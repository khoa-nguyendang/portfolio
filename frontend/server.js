import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 3000;
const API_BACKEND = process.env.API_BACKEND || 'http://backend:8080';

// Static HTML cache for blog posts.
// Cached pages auto-expire after CACHE_TTL_MS and are invalidated immediately on CMS changes.
const CACHE_DIR = path.resolve(__dirname, 'cache');
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
if (isProduction) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

function isCacheValid(filePath) {
  try {
    const stat = fs.statSync(filePath);
    return Date.now() - stat.mtimeMs < CACHE_TTL_MS;
  } catch {
    return false;
  }
}

// CDN cache headers for Cloudflare edge caching.
// - s-maxage: how long Cloudflare caches at the edge
// - stale-while-revalidate: serve stale while fetching fresh in background
// - maxage: browser cache (keep short so users see updates)
function getCacheHeaders(pageType) {
  switch (pageType) {
    case 'blog-post':
      // Blog posts: edge-cached 1 day, stale OK for 7 days while revalidating.
      // Browser caches 60s. Cloudflare serves stale instantly, refreshes behind the scenes.
      return {
        'Cache-Control': 'public, max-age=60, s-maxage=86400, stale-while-revalidate=604800',
        'CDN-Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      };
    case 'blog-list':
      // Blog listing: edge-cached 5 min, stale OK for 1 hour.
      return {
        'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600',
        'CDN-Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
      };
    case 'static':
      // Static pages (home, contact, about): edge-cached 1 hour, stale 1 day.
      return {
        'Cache-Control': 'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400',
        'CDN-Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      };
    default:
      // Dynamic/unknown: no edge cache.
      return {
        'Cache-Control': 'public, max-age=0, must-revalidate',
      };
  }
}

function isStaticPage(url) {
  return ['/', '/contact', '/contact/'].includes(url);
}

async function createServer() {
  const app = express();

  // Security headers
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
    );
    next();
  });

  let vite;
  let template;
  let render;

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
  } else {
    const compression = (await import('compression')).default;
    const sirv = (await import('sirv')).default;
    app.use(compression());
    app.use(
      sirv(path.resolve(__dirname, 'client'), {
        gzip: true,
        maxAge: 31536000, // 1 year for hashed assets
        immutable: true,
      })
    );

    // Pre-load template and render function once in production.
    template = fs.readFileSync(
      path.resolve(__dirname, 'client/index.html'),
      'utf-8'
    );
    const mod = await import(path.resolve(__dirname, 'server/entry-server.js'));
    render = mod.render;
  }

  // Proxy /api requests to the backend service.
  app.use('/api', express.raw({ type: '*/*', limit: '10mb' }), async (req, res) => {
    const url = `${API_BACKEND}/api${req.url}`;
    try {
      const proxyHeaders = {};
      for (const [key, value] of Object.entries(req.headers)) {
        if (!['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
          proxyHeaders[key] = value;
        }
      }
      const fetchOptions = {
        method: req.method,
        headers: proxyHeaders,
      };
      if (!['GET', 'HEAD'].includes(req.method) && req.body && req.body.length > 0) {
        fetchOptions.body = req.body;
      }
      const fetchRes = await fetch(url, fetchOptions);
      res.status(fetchRes.status);
      fetchRes.headers.forEach((value, key) => {
        if (!['transfer-encoding', 'content-encoding', 'connection'].includes(key.toLowerCase())) {
          res.setHeader(key, value);
        }
      });
      const body = await fetchRes.arrayBuffer();
      res.end(Buffer.from(body));
    } catch (e) {
      console.error('API proxy error:', e.message);
      res.status(502).json({ error: 'Backend unavailable' });
    }
  });

  // Webhook to invalidate cached blog pages when CMS publishes/updates a post.
  // POST /cache/invalidate?slug=my-post  (or without slug to clear all)
  // Clears both local disk cache AND Cloudflare edge cache.
  app.post('/cache/invalidate', async (req, res) => {
    const slug = req.query.slug;

    // 1. Clear local disk cache.
    if (slug) {
      const file = path.join(CACHE_DIR, `blog-${slug}.html`);
      if (fs.existsSync(file)) fs.unlinkSync(file);
      console.log(`Local cache invalidated: blog/${slug}`);
    } else {
      const files = fs.readdirSync(CACHE_DIR).filter(f => f.startsWith('blog-'));
      files.forEach(f => fs.unlinkSync(path.join(CACHE_DIR, f)));
      console.log(`Local cache invalidated: all blog pages (${files.length} files)`);
    }

    // 2. Purge Cloudflare edge cache (if configured).
    const cfZoneId = process.env.CF_ZONE_ID;
    const cfApiToken = process.env.CF_API_TOKEN;
    const siteHost = process.env.SITE_HOST || 'khoadangnguyen.com';
    if (cfZoneId && cfApiToken) {
      try {
        const urls = slug
          ? [`https://${siteHost}/blog/${slug}`, `https://www.${siteHost}/blog/${slug}`]
          : [`https://${siteHost}/blog`, `https://www.${siteHost}/blog`];
        const cfRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${cfZoneId}/purge_cache`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${cfApiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(slug ? { files: urls } : { purge_everything: true }),
        });
        const cfData = await cfRes.json();
        console.log(`Cloudflare cache purged:`, cfData.success ? 'OK' : cfData.errors);
      } catch (e) {
        console.error('Cloudflare purge failed:', e.message);
      }
    }
    res.json({ ok: true });
  });

  // SSR handler — only for HTML page requests, NOT static assets.
  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;

    // Skip static asset requests — let them 404 naturally instead of serving HTML.
    if (url.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|map|json)(\?.*)?$/)) {
      return next();
    }

    try {
      let pageTemplate;
      let pageRender;

      if (!isProduction) {
        pageTemplate = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        pageTemplate = await vite.transformIndexHtml(url, pageTemplate);
        const mod = await vite.ssrLoadModule('/src/entry-server.tsx');
        pageRender = mod.render;
      } else {
        pageTemplate = template;
        pageRender = render;

        // Serve cached blog pages if still valid.
        const blogMatch = url.match(/^\/blog\/([a-zA-Z0-9_-]+)\/?$/);
        if (blogMatch) {
          const cacheFile = path.join(CACHE_DIR, `blog-${blogMatch[1]}.html`);
          if (isCacheValid(cacheFile)) {
            const cached = fs.readFileSync(cacheFile, 'utf-8');
            res.set(getCacheHeaders('blog-post'));
            return res.status(200).set({ 'Content-Type': 'text/html' }).end(cached);
          }
        }
      }

      const { html: appHtml, meta } = pageRender(url);

      let finalHtml = pageTemplate
        .replace('<!--ssr-outlet-->', appHtml)
        .replace(/<title>.*?<\/title>/, `<title>${meta.title}</title>`)
        .replace(
          '<meta name="description" content="',
          `<meta name="description" content="${meta.description}" />\n    <meta property="og:title" content="${meta.ogTitle}" />\n    <meta property="og:description" content="${meta.ogDescription}" />\n    <meta property="og:image" content="${meta.ogImage}" />\n    <meta name="old-description" content="`
        );

      // Cache blog post pages for subsequent requests.
      if (isProduction) {
        const blogMatch = url.match(/^\/blog\/([a-zA-Z0-9_-]+)\/?$/);
        if (blogMatch) {
          const cacheFile = path.join(CACHE_DIR, `blog-${blogMatch[1]}.html`);
          fs.writeFileSync(cacheFile, finalHtml);
          console.log(`Cached: ${url}`);
        }
      }

      // Set CDN cache headers based on page type.
      const isBlogPost = url.match(/^\/blog\/[a-zA-Z0-9_-]+\/?$/);
      const isBlogList = url === '/blog' || url === '/blog/';
      const pageType = isBlogPost ? 'blog-post' : isBlogList ? 'blog-list' : isStaticPage(url) ? 'static' : 'dynamic';
      res.set(getCacheHeaders(pageType));

      res.status(200).set({ 'Content-Type': 'text/html' }).end(finalHtml);
    } catch (e) {
      if (!isProduction && vite) {
        vite.ssrFixStacktrace(e);
      }
      console.error(e.stack);
      res.status(500).end(e.stack);
    }
  });

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

createServer();

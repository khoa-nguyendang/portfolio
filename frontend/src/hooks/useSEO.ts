import { useEffect } from 'react';

interface SEOOptions {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
}

export function useSEO(options: SEOOptions) {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (options.title) {
      document.title = options.title;
    }

    const metaTags: Record<string, string | undefined> = {
      description: options.description,
      'og:title': options.ogTitle || options.title,
      'og:description': options.ogDescription || options.description,
      'og:image': options.ogImage,
      'twitter:card': options.twitterCard || 'summary_large_image',
    };

    Object.entries(metaTags).forEach(([name, content]) => {
      if (!content) return;

      const isOg = name.startsWith('og:') || name.startsWith('twitter:');
      const attr = isOg ? 'property' : 'name';

      let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    });
  }, [options.title, options.description, options.ogTitle, options.ogDescription, options.ogImage, options.twitterCard]);
}

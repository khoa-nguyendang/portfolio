import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { App } from './App';
import { LanguageProvider } from '@/hooks/useLanguage';
import { getYearsOfExperience } from '@/utils/career';

interface RenderResult {
  html: string;
  meta: {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
  };
}

export function render(url: string): RenderResult {
  const html = renderToString(
    <StaticRouter location={url}>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </StaticRouter>
  );

  const meta = getMetaForRoute(url);

  return { html, meta };
}

function getMetaForRoute(url: string): RenderResult['meta'] {
  const years = getYearsOfExperience();
  const baseMeta = {
    title: 'Khoa Nguyen Dang - Portfolio',
    description:
      `Senior Solution Architect & Full-Stack Engineer with ${years}+ years of experience in cloud architecture, microservices, and AI/ML.`,
    ogTitle: 'Khoa Nguyen Dang - Portfolio',
    ogDescription:
      `Senior Solution Architect & Full-Stack Engineer with ${years}+ years of experience.`,
    ogImage: '/og-image.png',
  };

  if (url === '/' || url === '') {
    return baseMeta;
  }

  if (url.startsWith('/blog') && url !== '/blog') {
    return {
      ...baseMeta,
      title: 'Blog Post - Khoa Nguyen Dang',
      description: 'Read blog posts about software architecture, cloud, and AI/ML.',
      ogTitle: 'Blog - Khoa Nguyen Dang',
      ogDescription: 'Technical blog posts on architecture, cloud, and AI/ML.',
    };
  }

  if (url === '/blog') {
    return {
      ...baseMeta,
      title: 'Blog - Khoa Nguyen Dang',
      description: 'Technical blog posts about software architecture, cloud computing, and AI/ML.',
      ogTitle: 'Blog - Khoa Nguyen Dang',
      ogDescription: 'Technical blog posts on architecture, cloud, and AI/ML.',
    };
  }

  if (url === '/contact') {
    return {
      ...baseMeta,
      title: 'Contact - Khoa Nguyen Dang',
      description: 'Get in touch with Khoa Nguyen Dang for collaboration or consulting.',
      ogTitle: 'Contact - Khoa Nguyen Dang',
      ogDescription: 'Get in touch for collaboration or consulting opportunities.',
    };
  }

  return baseMeta;
}

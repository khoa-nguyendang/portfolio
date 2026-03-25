import { useSEO } from '@/hooks/useSEO';

interface SEOHeadProps {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

export function SEOHead({ title, description, ogTitle, ogDescription, ogImage }: SEOHeadProps) {
  useSEO({
    title,
    description,
    ogTitle,
    ogDescription,
    ogImage,
  });

  return null;
}

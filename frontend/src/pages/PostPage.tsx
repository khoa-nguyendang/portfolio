import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { PostContent } from '@/components/PostContent';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useTranslation } from '@/i18n';
import { getPost } from '@/services/api';
import type { Post } from '@/services/api';

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, language } = useTranslation();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;

    async function fetchPost() {
      setLoading(true);
      setError('');
      try {
        const data = await getPost(slug!, language);
        setPost(data);
      } catch {
        setError(t('post.error'));
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [slug, language]);

  if (loading) return <LoadingSpinner />;

  if (error || !post) {
    return (
      <section className="py-20 bg-bg min-h-screen">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-error mb-4">{error || t('post.notfound')}</p>
          <Link to="/blog" className="text-primary hover:underline">
            {t('notfound.back')}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <SEOHead
        title={`${post.title} - Khoa Nguyen Dang`}
        description={post.excerpt}
        ogTitle={post.title}
        ogDescription={post.excerpt}
        ogImage={post.coverImage}
      />

      <section className="py-20 bg-bg min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-text-muted hover:text-primary text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('nav.blog')}
          </Link>

          <PostContent post={post} />
        </div>
      </section>
    </>
  );
}

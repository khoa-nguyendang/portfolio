import { Link } from 'react-router-dom';
import { Clock, Tag } from 'lucide-react';
import { useTranslation } from '@/i18n';
import type { Post } from '@/services/api';

interface BlogCardProps {
  post: Post;
}

export function BlogCard({ post }: BlogCardProps) {
  const { t } = useTranslation();

  return (
    <article className="bg-surface rounded-2xl overflow-hidden card-hover border border-border/30 group">
      <Link to={`/blog/${post.slug}`} className="block">
        {/* Cover image or gradient placeholder */}
        {post.coverImage ? (
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-accent/30 transition-colors">
            <span className="text-4xl font-bold gradient-text opacity-50">
              {post.title.charAt(0)}
            </span>
          </div>
        )}

        <div className="p-5">
          {/* Category & read time */}
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              <Tag className="w-3 h-3" />
              {post.category}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-text-dim">
              <Clock className="w-3 h-3" />
              {post.readTime} {t('blog.minRead')}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-text text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="text-text-muted text-sm line-clamp-3 mb-4">
            {post.excerpt}
          </p>

          {/* Date */}
          <time className="text-text-dim text-xs" dateTime={post.publishedAt}>
            {new Date(post.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        </div>
      </Link>
    </article>
  );
}

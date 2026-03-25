import { useState, useEffect, useMemo } from 'react';
import { Clock, Calendar, Tag, User, Globe } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useTranslation } from '@/i18n';
import { languages } from '@/i18n/translations';
import { getPostTranslation } from '@/services/api';
import type { Post } from '@/services/api';
import type { LangCode } from '@/i18n/translations';

interface PostContentProps {
  post: Post;
}

export function PostContent({ post: initialPost }: PostContentProps) {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const [post, setPost] = useState(initialPost);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [loadingTranslation, setLoadingTranslation] = useState(false);

  useEffect(() => {
    setPost(initialPost);
  }, [initialPost]);

  useEffect(() => {
    if (language === initialPost.language) {
      setPost(initialPost);
      return;
    }

    async function fetchTranslation() {
      setLoadingTranslation(true);
      try {
        const translated = await getPostTranslation(initialPost.slug, language);
        setPost(translated);
      } catch {
        // Keep original if translation not available
        setPost(initialPost);
      } finally {
        setLoadingTranslation(false);
      }
    }
    fetchTranslation();
  }, [language, initialPost]);

  // Extract headings for ToC from content
  const headings = useMemo(() => {
    const matches = post.content.matchAll(/^#{2,3}\s+(.+)$/gm);
    return Array.from(matches).map((match) => ({
      text: match[1],
      level: match[0].startsWith('###') ? 3 : 2,
      id: match[1].toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    }));
  }, [post.content]);

  // Simple markdown-like rendering (basic)
  const renderedContent = useMemo(() => {
    let html = post.content
      // Headings
      .replace(/^### (.+)$/gm, '<h3 id="$1">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 id="$1">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Code blocks
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Links
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      // Blockquotes
      .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
      // Unordered lists
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      // Images
      .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" loading="lazy" />')
      // Paragraphs (double newline)
      .replace(/\n\n/g, '</p><p>')
      // Single newlines in remaining text
      .replace(/\n/g, '<br />');

    // Wrap lists
    html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');

    // Clean up heading IDs
    html = html.replace(/id="([^"]+)"/g, (_match, id: string) => {
      return `id="${id.toLowerCase().replace(/[^a-z0-9]+/g, '-')}"`;
    });

    return `<p>${html}</p>`;
  }, [post.content]);

  return (
    <div className="flex gap-8">
      {/* Table of contents - desktop sidebar */}
      {headings.length > 2 && (
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24">
            <h4 className="font-semibold text-text text-sm mb-3">{t('post.toc')}</h4>
            <nav className="space-y-1" aria-label="Table of contents">
              {headings.map((heading) => (
                <a
                  key={heading.id}
                  href={`#${heading.id}`}
                  className={`block text-xs text-text-muted hover:text-primary transition-colors ${
                    heading.level === 3 ? 'pl-4' : ''
                  }`}
                >
                  {heading.text}
                </a>
              ))}
            </nav>
          </div>
        </aside>
      )}

      {/* Main content */}
      <article className="flex-1 min-w-0">
        {/* Meta info */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              <Tag className="w-3 h-3" />
              {post.category}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-text-dim">
              <Clock className="w-3 h-3" />
              {post.readTime} {t('blog.minRead')}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-text-dim">
              <Calendar className="w-3 h-3" />
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-text mb-4">{post.title}</h1>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-text-muted text-sm">
              <User className="w-4 h-4" />
              <span>{post.author}</span>
            </div>

            {/* Language switcher */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-hover text-text-muted text-xs transition-colors"
                aria-label="Switch language"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="uppercase">{language}</span>
              </button>
              {langMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 max-h-60 overflow-y-auto glass-strong rounded-xl shadow-2xl z-30">
                  <div className="p-1.5">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code as LangCode);
                          setLangMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
                          language === lang.code
                            ? 'bg-primary/20 text-primary'
                            : 'hover:bg-surface-hover text-text-muted'
                        }`}
                      >
                        {lang.nativeName}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {loadingTranslation && (
          <div className="text-center py-4 text-text-muted text-sm">{t('post.loading.translation')}</div>
        )}

        {/* Post content */}
        <div
          className="prose-blog"
          dangerouslySetInnerHTML={{ __html: renderedContent }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-10 pt-6 border-t border-border/30">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs bg-surface text-text-muted border border-border/30"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}

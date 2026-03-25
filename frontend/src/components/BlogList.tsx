import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { BlogCard } from './BlogCard';
import { Pagination } from './Pagination';
import { LoadingSpinner } from './LoadingSpinner';
import { getPosts, getCategories } from '@/services/api';
import type { Post, Category } from '@/services/api';

export function BlogList() {
  const { t, language } = useTranslation();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchCategories() {
      try {
        const cats = await getCategories();
        setCategories(cats);
      } catch {
        // Categories are optional
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      setError('');
      try {
        const result = await getPosts({
          page,
          pageSize: 9,
          category: activeCategory || undefined,
          search: search || undefined,
          language,
        });
        setPosts(result.posts);
        setTotalPages(result.totalPages);
      } catch {
        setError(t('blog.error'));
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, [page, activeCategory, search, language]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div>
      {/* Search & filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
          <input
            type="search"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t('blog.search')}
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border/30 rounded-xl text-text text-sm placeholder:text-text-dim focus:outline-none focus:border-primary/50 transition-colors"
            aria-label={t('blog.search')}
          />
        </div>
      </div>

      {/* Category tabs */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8" role="tablist" aria-label="Blog categories">
          <button
            onClick={() => handleCategoryChange('')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeCategory === ''
                ? 'bg-primary text-white'
                : 'bg-surface text-text-muted hover:text-text hover:bg-surface-hover'
            }`}
            role="tab"
            aria-selected={activeCategory === ''}
          >
            {t('blog.all')}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => handleCategoryChange(cat.name)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === cat.name
                  ? 'bg-primary text-white'
                  : 'bg-surface text-text-muted hover:text-text hover:bg-surface-hover'
              }`}
              role="tab"
              aria-selected={activeCategory === cat.name}
            >
              {cat.name} ({cat.count})
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-error">{error}</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-text-muted">{t('blog.noPosts')}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

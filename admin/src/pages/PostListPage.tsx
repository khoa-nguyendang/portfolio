import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ExternalLink,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import ConfirmDialog from '@/components/ConfirmDialog';
import { ToastContainer } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import { getPosts, deletePost, type Post } from '@/services/api';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://khoadangnguyen.com';

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Drafts' },
  { value: 'archived', label: 'Archived' },
];

export default function PostListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);

  const { toasts, showToast, dismiss } = useToast();

  const page = parseInt(searchParams.get('page') || '1');
  const status = searchParams.get('status') || '';
  const search = searchParams.get('search') || '';

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const filters: Record<string, string> = {};
      if (status) filters.status = status;
      if (search) filters.search = search;
      const result = await getPosts(page, filters);
      setPosts(result.data);
      setTotalPages(result.total_pages);
      setTotal(result.total);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [page, status, search, showToast]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleStatusFilter = (newStatus: string) => {
    const params = new URLSearchParams(searchParams);
    if (newStatus) {
      params.set('status', newStatus);
    } else {
      params.delete('status');
    }
    params.delete('page');
    setSearchParams(params);
  };

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    params.delete('page');
    setSearchParams(params);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(newPage));
    setSearchParams(params);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePost(deleteTarget.id);
      showToast('success', `"${deleteTarget.title}" has been deleted.`);
      setDeleteTarget(null);
      loadPosts();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to delete post');
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Posts</h1>
          <p className="mt-1 text-sm text-gray-400">{total} total posts</p>
        </div>
        <Link
          to="/posts/new"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Status tabs */}
        <div className="flex gap-1 rounded-lg border border-gray-800 bg-gray-900/50 p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleStatusFilter(tab.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                status === tab.value
                  ? 'bg-indigo-500/20 text-indigo-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="search"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="!py-2 !pl-9"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 py-16 text-center">
          <p className="text-gray-500">No posts found</p>
          <Link
            to="/posts/new"
            className="mt-3 inline-flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300"
          >
            <Plus className="h-3.5 w-3.5" />
            Create your first post
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-800">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/80">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Title
                </th>
                <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 md:table-cell">
                  Category
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Status
                </th>
                <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 lg:table-cell">
                  Published
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {posts.map((post) => (
                <tr
                  key={post.id}
                  className="bg-gray-900/30 transition-colors hover:bg-gray-800/50"
                >
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/posts/${post.id}/edit`)}
                      className="text-left"
                    >
                      <p className="font-medium text-gray-200 hover:text-indigo-400 transition-colors">
                        {post.title}
                      </p>
                      {post.excerpt && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">
                          {post.excerpt}
                        </p>
                      )}
                    </button>
                  </td>
                  <td className="hidden px-4 py-3 text-gray-400 md:table-cell">
                    {post.category_name || '--'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={post.status} />
                  </td>
                  <td className="hidden px-4 py-3 text-gray-500 lg:table-cell">
                    {formatDate(post.published_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => navigate(`/posts/${post.id}/edit`)}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-200"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {post.status === 'published' && (
                        <a
                          href={`${SITE_URL}/blog/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-200"
                          title="View on site"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      <button
                        onClick={() => setDeleteTarget(post)}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-800 px-3 py-1.5 text-sm text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-200 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-800 px-3 py-1.5 text-sm text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-200 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Post"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}

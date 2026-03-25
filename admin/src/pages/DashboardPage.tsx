import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Mail,
  Eye,
  Clock,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import StatsCard from '@/components/StatsCard';
import StatusBadge from '@/components/StatusBadge';
import { getDashboardStats, type DashboardStats } from '@/services/api';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center">
        <p className="text-red-400">{error}</p>
        <button
          onClick={loadStats}
          className="mt-3 text-sm text-indigo-400 hover:text-indigo-300"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!stats) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="fade-in space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-400">
          Overview of your portfolio content
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          icon={FileText}
          label="Total Posts"
          value={stats.total_posts}
          subtext={`${stats.published_posts} published, ${stats.draft_posts} drafts`}
          color="indigo"
        />
        <StatsCard
          icon={Mail}
          label="Unread Contacts"
          value={stats.unread_contacts}
          color={stats.unread_contacts > 0 ? 'yellow' : 'green'}
        />
      </div>

      {/* Recent sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent posts */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/50">
          <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
            <h2 className="font-semibold text-white">Recent Posts</h2>
            <Link
              to="/posts"
              className="flex items-center gap-1 text-xs text-indigo-400 transition-colors hover:text-indigo-300"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-800/50">
            {stats.recent_posts.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-gray-500">
                No posts yet
              </p>
            ) : (
              stats.recent_posts.map((post) => (
                <Link
                  key={post.id}
                  to={`/posts/${post.id}/edit`}
                  className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-gray-800/30"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-200">
                      {post.title}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {formatDate(post.created_at)}
                    </div>
                  </div>
                  <StatusBadge status={post.status} />
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent contacts */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/50">
          <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
            <h2 className="font-semibold text-white">Recent Contacts</h2>
            <Link
              to="/contacts"
              className="flex items-center gap-1 text-xs text-indigo-400 transition-colors hover:text-indigo-300"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-800/50">
            {stats.recent_contacts.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-gray-500">
                No contacts yet
              </p>
            ) : (
              stats.recent_contacts.map((contact) => (
                <Link
                  key={contact.id}
                  to="/contacts"
                  className={`flex items-center gap-3 px-5 py-3 transition-colors hover:bg-gray-800/30 ${
                    !contact.is_read ? 'bg-indigo-500/5' : ''
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p
                        className={`truncate text-sm ${
                          contact.is_read
                            ? 'text-gray-400'
                            : 'font-medium text-gray-200'
                        }`}
                      >
                        {contact.name}
                      </p>
                      {!contact.is_read && (
                        <span className="h-2 w-2 rounded-full bg-indigo-400" />
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-gray-500">
                      {contact.subject}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Eye className="h-3 w-3" />
                    {formatDate(contact.created_at)}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

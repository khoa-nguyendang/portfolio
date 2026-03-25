import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Mail,
  MailOpen,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import ConfirmDialog from '@/components/ConfirmDialog';
import { ToastContainer } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import {
  getContacts,
  markContactRead,
  deleteContact,
  type Contact,
} from '@/services/api';

const FILTER_TABS = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' },
];

export default function ContactsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);

  const { toasts, showToast, dismiss } = useToast();

  const page = parseInt(searchParams.get('page') || '1');
  const filter = (searchParams.get('filter') || 'all') as 'all' | 'read' | 'unread';

  const loadContacts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getContacts(page, filter);
      setContacts(result.data);
      setTotalPages(result.total_pages);
      setTotal(result.total);
    } catch (err) {
      showToast(
        'error',
        err instanceof Error ? err.message : 'Failed to load contacts',
      );
    } finally {
      setLoading(false);
    }
  }, [page, filter, showToast]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const handleFilterChange = (newFilter: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('filter', newFilter);
    params.delete('page');
    setSearchParams(params);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(newPage));
    setSearchParams(params);
  };

  const handleExpand = async (contact: Contact) => {
    if (expandedId === contact.id) {
      setExpandedId(null);
      return;
    }

    setExpandedId(contact.id);

    if (!contact.is_read) {
      try {
        await markContactRead(contact.id);
        setContacts((prev) =>
          prev.map((c) => (c.id === contact.id ? { ...c, is_read: true } : c)),
        );
      } catch {
        // Silently fail -- the read status is not critical
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteContact(deleteTarget.id);
      showToast('success', 'Contact deleted');
      setDeleteTarget(null);
      if (expandedId === deleteTarget.id) setExpandedId(null);
      loadContacts();
    } catch (err) {
      showToast(
        'error',
        err instanceof Error ? err.message : 'Failed to delete contact',
      );
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const unreadCount = contacts.filter((c) => !c.is_read).length;

  return (
    <div className="fade-in space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">Contacts</h1>
          {unreadCount > 0 && (
            <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs font-medium text-indigo-400">
              {unreadCount} unread
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-400">{total} total messages</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 rounded-lg border border-gray-800 bg-gray-900/50 p-1 w-fit">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleFilterChange(tab.value)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === tab.value
                ? 'bg-indigo-500/20 text-indigo-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contacts list */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
        </div>
      ) : contacts.length === 0 ? (
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 py-16 text-center">
          <Mail className="mx-auto h-10 w-10 text-gray-600" />
          <p className="mt-3 text-gray-500">No contacts found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className={`rounded-lg border transition-colors ${
                contact.is_read
                  ? 'border-gray-800 bg-gray-900/30'
                  : 'border-indigo-500/20 bg-indigo-500/5'
              }`}
            >
              {/* Row */}
              <button
                onClick={() => handleExpand(contact)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left"
              >
                <div className="flex-shrink-0">
                  {contact.is_read ? (
                    <MailOpen className="h-5 w-5 text-gray-500" />
                  ) : (
                    <Mail className="h-5 w-5 text-indigo-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p
                      className={`truncate text-sm ${
                        contact.is_read
                          ? 'text-gray-400'
                          : 'font-semibold text-gray-200'
                      }`}
                    >
                      {contact.name}
                    </p>
                    <span className="text-xs text-gray-600">
                      &lt;{contact.email}&gt;
                    </span>
                  </div>
                  <p
                    className={`mt-0.5 truncate text-sm ${
                      contact.is_read ? 'text-gray-500' : 'text-gray-300'
                    }`}
                  >
                    {contact.subject}
                  </p>
                </div>
                <span className="flex-shrink-0 text-xs text-gray-500">
                  {formatDate(contact.created_at)}
                </span>
                {expandedId === contact.id ? (
                  <ChevronUp className="h-4 w-4 flex-shrink-0 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-500" />
                )}
              </button>

              {/* Expanded content */}
              {expandedId === contact.id && (
                <div className="border-t border-gray-800 px-5 py-4">
                  <div className="mb-3 flex items-center gap-4 text-xs text-gray-500">
                    <span>From: {contact.name} ({contact.email})</span>
                    <span>{formatDate(contact.created_at)}</span>
                  </div>
                  <div className="rounded-lg bg-gray-800/50 p-4">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
                      {contact.message}
                    </p>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(contact);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-red-400 transition-colors hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
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
              className="inline-flex items-center gap-1 rounded-lg border border-gray-800 px-3 py-1.5 text-sm text-gray-400 transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-800 px-3 py-1.5 text-sm text-gray-400 transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-30"
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
        title="Delete Contact"
        message={`Delete message from "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}

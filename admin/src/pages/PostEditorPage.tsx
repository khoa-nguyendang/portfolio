import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import {
  Save,
  Eye,
  Loader2,
  ArrowLeft,
  Globe,
  Languages,
} from 'lucide-react';
import SlugInput from '@/components/SlugInput';
import StatusBadge from '@/components/StatusBadge';
import { ToastContainer } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import {
  getPost,
  createPost,
  updatePost,
  getCategories,
  translatePost,
  getPostTranslations,
  type Post,
  type Category,
  type Translation,
} from '@/services/api';

const AVAILABLE_LANGUAGES = [
  { code: 'vi', label: 'Vietnamese' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'zh', label: 'Chinese' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'es', label: 'Spanish' },
];

interface PostFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  category_id: string;
  tags: string;
  status: 'draft' | 'published';
}

const emptyForm: PostFormData = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  cover_image_url: '',
  category_id: '',
  tags: '',
  status: 'draft',
};

export default function PostEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [form, setForm] = useState<PostFormData>(emptyForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [selectedLangs, setSelectedLangs] = useState<string[]>([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const { toasts, showToast, dismiss } = useToast();

  const loadData = useCallback(async () => {
    try {
      const cats = await getCategories();
      setCategories(cats);

      if (id) {
        const [post, trans] = await Promise.all([
          getPost(id),
          getPostTranslations(id),
        ]);
        setForm({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          cover_image_url: post.cover_image_url,
          category_id: post.category_id,
          tags: post.tags?.join(', ') || '',
          status: post.status === 'archived' ? 'draft' : post.status,
        });
        setTranslations(trans);
      }
    } catch (err) {
      showToast(
        'error',
        err instanceof Error ? err.message : 'Failed to load data',
      );
    } finally {
      setLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateField = <K extends keyof PostFormData>(
    key: K,
    value: PostFormData[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    // Validate required fields
    if (!form.title.trim()) {
      showToast('error', 'Title is required');
      return;
    }
    if (!form.slug.trim()) {
      showToast('error', 'Slug is required');
      return;
    }
    if (!form.content.trim()) {
      showToast('error', 'Content is required');
      return;
    }

    setSaving(true);
    try {
      const payload: Partial<Post> = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        excerpt: form.excerpt.trim(),
        content: form.content,
        cover_image_url: form.cover_image_url.trim(),
        category_id: form.category_id || undefined,
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        status: form.status,
      };

      if (isEditing && id) {
        await updatePost(id, payload);
        showToast('success', 'Post updated successfully');
      } else {
        const created = await createPost(payload);
        showToast('success', 'Post created successfully');
        navigate(`/posts/${created.id}/edit`, { replace: true });
      }
    } catch (err) {
      showToast(
        'error',
        err instanceof Error ? err.message : 'Failed to save post',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleTranslate = async (languages?: string[]) => {
    if (!id) {
      showToast('error', 'Please save the post first before translating');
      return;
    }

    const langs = languages || selectedLangs;
    if (langs.length === 0) {
      showToast('error', 'Please select at least one language');
      return;
    }

    setTranslating(true);
    try {
      const result = await translatePost(id, langs);
      setTranslations((prev) => {
        const existing = prev.filter(
          (t) => !result.some((r) => r.language === t.language),
        );
        return [...existing, ...result];
      });
      setSelectedLangs([]);
      showToast('success', `Translation started for ${langs.length} language(s)`);
    } catch (err) {
      showToast(
        'error',
        err instanceof Error ? err.message : 'Translation failed',
      );
    } finally {
      setTranslating(false);
    }
  };

  const toggleLanguage = (code: string) => {
    setSelectedLangs((prev) =>
      prev.includes(code) ? prev.filter((l) => l !== code) : [...prev, code],
    );
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="fade-in space-y-6">
      {/* Header with save button */}
      <div className="sticky top-0 z-10 -mx-6 -mt-6 flex items-center justify-between border-b border-gray-800 bg-gray-950/95 px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/posts')}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-white">
            {isEditing ? 'Edit Post' : 'New Post'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-800"
          >
            <Eye className="h-4 w-4" />
            {showPreview ? 'Editor' : 'Preview'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content area */}
        <div className="space-y-6 lg:col-span-2">
          {/* Title */}
          <div>
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Enter post title..."
              className="!text-lg !font-semibold"
            />
          </div>

          {/* Slug */}
          <SlugInput
            value={form.slug}
            sourceValue={form.title}
            onChange={(slug) => updateField('slug', slug)}
          />

          {/* Excerpt */}
          <div>
            <label htmlFor="excerpt">Excerpt</label>
            <textarea
              id="excerpt"
              value={form.excerpt}
              onChange={(e) => updateField('excerpt', e.target.value)}
              placeholder="Brief description of the post..."
              rows={3}
            />
          </div>

          {/* Content */}
          <div>
            <label>Content</label>
            <div data-color-mode="dark">
              <MDEditor
                value={form.content}
                onChange={(val) => updateField('content', val || '')}
                height={500}
                preview={showPreview ? 'preview' : 'edit'}
                visibleDragbar={false}
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={form.status}
              onChange={(e) =>
                updateField('status', e.target.value as 'draft' | 'published')
              }
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          {/* Category */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={form.category_id}
              onChange={(e) => updateField('category_id', e.target.value)}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
            <label htmlFor="tags">Tags</label>
            <input
              id="tags"
              type="text"
              value={form.tags}
              onChange={(e) => updateField('tags', e.target.value)}
              placeholder="react, typescript, web..."
            />
            <p className="mt-1.5 text-xs text-gray-500">
              Separate tags with commas
            </p>
            {form.tags && (
              <div className="mt-2 flex flex-wrap gap-1">
                {form.tags
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .map((tag, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs text-indigo-400"
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            )}
          </div>

          {/* Cover Image */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
            <label htmlFor="cover_image">Cover Image URL</label>
            <input
              id="cover_image"
              type="url"
              value={form.cover_image_url}
              onChange={(e) => updateField('cover_image_url', e.target.value)}
              placeholder="https://..."
            />
            {form.cover_image_url && (
              <div className="mt-3 overflow-hidden rounded-lg border border-gray-800">
                <img
                  src={form.cover_image_url}
                  alt="Cover preview"
                  className="h-32 w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Translations (only for existing posts) */}
          {isEditing && (
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="h-4 w-4 text-gray-400" />
                <label className="!mb-0">Translations</label>
              </div>

              {/* Existing translations */}
              {translations.length > 0 && (
                <div className="mb-4 space-y-2">
                  {translations.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between rounded-lg bg-gray-800/50 px-3 py-2"
                    >
                      <span className="text-sm text-gray-300">
                        {AVAILABLE_LANGUAGES.find((l) => l.code === t.language)
                          ?.label || t.language}
                      </span>
                      <StatusBadge status={t.status} />
                    </div>
                  ))}
                </div>
              )}

              {/* Language selection */}
              <div className="space-y-2">
                {AVAILABLE_LANGUAGES.filter(
                  (l) =>
                    !translations.some(
                      (t) => t.language === l.code && t.status === 'completed',
                    ),
                ).map((lang) => (
                  <label
                    key={lang.code}
                    className="flex cursor-pointer items-center gap-2 !mb-0"
                  >
                    <input
                      type="checkbox"
                      checked={selectedLangs.includes(lang.code)}
                      onChange={() => toggleLanguage(lang.code)}
                      className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-400">{lang.label}</span>
                  </label>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleTranslate()}
                  disabled={translating || selectedLangs.length === 0}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-700 px-3 py-2 text-xs font-medium text-gray-300 transition-colors hover:bg-gray-800 disabled:opacity-40"
                >
                  {translating ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Languages className="h-3.5 w-3.5" />
                  )}
                  Translate Selected
                </button>
                <button
                  onClick={() =>
                    handleTranslate(AVAILABLE_LANGUAGES.map((l) => l.code))
                  }
                  disabled={translating}
                  className="rounded-lg border border-gray-700 px-3 py-2 text-xs font-medium text-gray-300 transition-colors hover:bg-gray-800 disabled:opacity-40"
                  title="Translate to all languages"
                >
                  All
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-600">
                Uses AI for translation
              </p>
            </div>
          )}
        </div>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}

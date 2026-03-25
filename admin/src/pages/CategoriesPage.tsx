import { useEffect, useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Loader2,
  FolderOpen,
} from 'lucide-react';
import ConfirmDialog from '@/components/ConfirmDialog';
import { ToastContainer } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type Category,
} from '@/services/api';

interface CategoryForm {
  name: string;
  slug: string;
  description: string;
  sort_order: number;
}

const emptyForm: CategoryForm = {
  name: '',
  slug: '',
  description: '',
  sort_order: 0,
};

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const { toasts, showToast, dismiss } = useToast();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      showToast(
        'error',
        err instanceof Error ? err.message : 'Failed to load categories',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowAddForm(true);
  };

  const handleEdit = (cat: Category) => {
    setShowAddForm(false);
    setEditId(cat.id);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      sort_order: cat.sort_order,
    });
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditId(null);
    setForm(emptyForm);
  };

  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      slug: editId ? prev.slug : generateSlug(name),
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      showToast('error', 'Category name is required');
      return;
    }

    setSaving(true);
    try {
      if (editId) {
        await updateCategory(editId, {
          name: form.name.trim(),
          slug: form.slug.trim() || generateSlug(form.name),
          description: form.description.trim(),
          sort_order: form.sort_order,
        });
        showToast('success', 'Category updated');
      } else {
        await createCategory({
          name: form.name.trim(),
          slug: form.slug.trim() || generateSlug(form.name),
          description: form.description.trim(),
          sort_order: form.sort_order,
        });
        showToast('success', 'Category created');
      }
      handleCancel();
      loadCategories();
    } catch (err) {
      showToast(
        'error',
        err instanceof Error ? err.message : 'Failed to save category',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategory(deleteTarget.id);
      showToast('success', `"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      loadCategories();
    } catch (err) {
      showToast(
        'error',
        err instanceof Error ? err.message : 'Failed to delete category',
      );
    }
  };

  const CategoryFormRow = () => (
    <tr className="bg-indigo-500/5">
      <td className="px-4 py-3">
        <input
          type="text"
          value={form.name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Category name"
          autoFocus
          className="!py-1.5 !text-sm"
        />
      </td>
      <td className="px-4 py-3">
        <input
          type="text"
          value={form.slug}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, slug: generateSlug(e.target.value) }))
          }
          placeholder="auto-generated"
          className="!py-1.5 !text-sm"
        />
      </td>
      <td className="hidden px-4 py-3 md:table-cell">
        <input
          type="text"
          value={form.description}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Description"
          className="!py-1.5 !text-sm"
        />
      </td>
      <td className="px-4 py-3">
        <input
          type="number"
          value={form.sort_order}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              sort_order: parseInt(e.target.value) || 0,
            }))
          }
          className="!w-16 !py-1.5 !text-center !text-sm"
          min={0}
        />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg p-1.5 text-emerald-400 transition-colors hover:bg-emerald-500/10"
            title="Save"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={handleCancel}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-800"
            title="Cancel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Categories</h1>
          <p className="mt-1 text-sm text-gray-400">
            {categories.length} categories
          </p>
        </div>
        <button
          onClick={handleAdd}
          disabled={showAddForm}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          New Category
        </button>
      </div>

      {/* Table */}
      {categories.length === 0 && !showAddForm ? (
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 py-16 text-center">
          <FolderOpen className="mx-auto h-10 w-10 text-gray-600" />
          <p className="mt-3 text-gray-500">No categories yet</p>
          <button
            onClick={handleAdd}
            className="mt-3 inline-flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300"
          >
            <Plus className="h-3.5 w-3.5" />
            Create your first category
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-800">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/80">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Name
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Slug
                </th>
                <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 md:table-cell">
                  Description
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Order
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {showAddForm && <CategoryFormRow />}
              {categories.map((cat) =>
                editId === cat.id ? (
                  <CategoryFormRow key={cat.id} />
                ) : (
                  <tr
                    key={cat.id}
                    className="bg-gray-900/30 transition-colors hover:bg-gray-800/50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-200">
                          {cat.name}
                        </span>
                        {cat.post_count !== undefined && (
                          <span className="rounded-full bg-gray-800 px-1.5 py-0.5 text-xs text-gray-500">
                            {cat.post_count}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{cat.slug}</td>
                    <td className="hidden px-4 py-3 text-gray-500 md:table-cell">
                      {cat.description || '--'}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-400">
                      {cat.sort_order}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(cat)}
                          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-200"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(cat)}
                          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Posts in this category will not be deleted but will be uncategorized.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}

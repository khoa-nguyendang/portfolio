/**
 * API Client for Portfolio Admin CMS
 *
 * SECURITY NOTES:
 * - JWT stored in localStorage for SPA convenience.
 *   For production, consider httpOnly cookies set by the server
 *   to prevent token theft via XSS.
 * - All requests include Authorization header with Bearer token.
 * - 401 responses trigger automatic logout and redirect to /login.
 * - Input validation should be performed before calling these functions.
 */

const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'admin_token';

// ─── Types ─────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar_url?: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  category_id: string;
  category_name?: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  author_id: string;
  author_name?: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  sort_order: number;
  post_count?: number;
  created_at: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Translation {
  id: string;
  post_id: string;
  language: string;
  title: string;
  excerpt: string;
  content: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface SiteConfig {
  key: string;
  value: string;
  description?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface PostFilters {
  status?: string;
  category_id?: string;
  search?: string;
}

// ─── Token Management ──────────────────────────────────

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ─── Fetch Wrapper ─────────────────────────────────────

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'same-origin',
  });

  if (response.status === 401) {
    removeToken();
    window.location.href = '/login';
    throw new ApiError(401, 'Unauthorized');
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      message = body.error || body.message || message;
    } catch {
      // Use default message
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// ─── Auth API ──────────────────────────────────────────

export async function login(
  email: string,
  password: string,
): Promise<{ token: string; user: User }> {
  const data = await request<{ token: string; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(data.token);
  return data;
}

export async function getMe(): Promise<User> {
  return request<User>('/auth/me');
}

// ─── Posts API ─────────────────────────────────────────

export async function getPosts(
  page: number = 1,
  filters: PostFilters = {},
): Promise<PaginatedResponse<Post>> {
  const params = new URLSearchParams({ page: String(page) });
  if (filters.status) params.set('status', filters.status);
  if (filters.category_id) params.set('category_id', filters.category_id);
  if (filters.search) params.set('search', filters.search);

  // Backend returns { posts, pagination: { page, page_size, total, total_pages } }
  const raw = await request<{
    posts: Post[];
    pagination: { page: number; page_size: number; total: number; total_pages: number };
  }>(`/posts?${params.toString()}`);

  return {
    data: raw.posts || [],
    total: raw.pagination?.total || 0,
    page: raw.pagination?.page || 1,
    per_page: raw.pagination?.page_size || 20,
    total_pages: raw.pagination?.total_pages || 1,
  };
}

export async function getPost(id: string): Promise<Post> {
  return request<Post>(`/posts/${encodeURIComponent(id)}`);
}

export async function createPost(
  data: Partial<Post>,
): Promise<Post> {
  return request<Post>('/admin/posts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updatePost(
  id: string,
  data: Partial<Post>,
): Promise<Post> {
  return request<Post>(`/admin/posts/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deletePost(id: string): Promise<void> {
  return request<void>(`/admin/posts/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

// ─── Categories API ────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  return request<Category[]>('/categories');
}

export async function createCategory(
  data: Partial<Category>,
): Promise<Category> {
  return request<Category>('/admin/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCategory(
  id: string,
  data: Partial<Category>,
): Promise<Category> {
  return request<Category>(`/admin/categories/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteCategory(id: string): Promise<void> {
  return request<void>(`/admin/categories/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

// ─── Contacts API ──────────────────────────────────────

export async function getContacts(
  page: number = 1,
  filter?: 'all' | 'read' | 'unread',
): Promise<PaginatedResponse<Contact>> {
  const params = new URLSearchParams({ page: String(page) });
  if (filter && filter !== 'all') params.set('filter', filter);

  const raw = await request<{
    contacts: Contact[];
    pagination: { page: number; page_size: number; total: number; total_pages: number };
  }>(`/admin/contacts?${params.toString()}`);

  return {
    data: raw.contacts || [],
    total: raw.pagination?.total || 0,
    page: raw.pagination?.page || 1,
    per_page: raw.pagination?.page_size || 20,
    total_pages: raw.pagination?.total_pages || 1,
  };
}

export async function markContactRead(id: string): Promise<void> {
  return request<void>(`/admin/contacts/${encodeURIComponent(id)}/read`, {
    method: 'PUT',
  });
}

export async function deleteContact(id: string): Promise<void> {
  return request<void>(`/contacts/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

// ─── Translations API ──────────────────────────────────

export async function translatePost(
  postId: string,
  languages: string[],
): Promise<Translation[]> {
  return request<Translation[]>(
    `/admin/posts/${encodeURIComponent(postId)}/translate`,
    {
      method: 'POST',
      body: JSON.stringify({ languages }),
    },
  );
}

export async function getPostTranslations(
  postId: string,
): Promise<Translation[]> {
  return request<Translation[]>(
    `/admin/posts/${encodeURIComponent(postId)}/translations`,
  );
}

// ─── Site Config API ───────────────────────────────────

export async function getSiteConfig(): Promise<SiteConfig[]> {
  return request<SiteConfig[]>('/admin/site-config');
}

export async function updateSiteConfig(
  configs: SiteConfig[],
): Promise<SiteConfig[]> {
  return request<SiteConfig[]>('/admin/site-config', {
    method: 'PUT',
    body: JSON.stringify({ configs }),
  });
}

// ─── Auth API ─────────────────────────────────────────

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ message: string }> {
  return request<{ message: string }>('/admin/auth/password', {
    method: 'PUT',
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  });
}

// ─── Dashboard Stats API ──────────────────────────────

export interface DashboardStats {
  total_posts: number;
  published_posts: number;
  draft_posts: number;
  unread_contacts: number;
  recent_posts: Post[];
  recent_contacts: Contact[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return request<DashboardStats>('/admin/dashboard/stats');
}

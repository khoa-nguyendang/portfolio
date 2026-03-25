const BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface FetchOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  category: string;
  tags: string[];
  author: string;
  publishedAt: string;
  readTime: number;
  language: string;
}

export interface PostsResponse {
  posts: Post[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface Category {
  name: string;
  count: number;
}

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface SiteConfig {
  siteName: string;
  siteDescription: string;
  ownerName: string;
  ownerEmail: string;
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
}

export function getPosts(params?: {
  page?: number;
  pageSize?: number;
  category?: string;
  search?: string;
  language?: string;
}): Promise<PostsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
  if (params?.category) searchParams.set('category', params.category);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.language) searchParams.set('language', params.language);

  const query = searchParams.toString();
  return fetchApi<PostsResponse>(`/posts${query ? `?${query}` : ''}`);
}

export function getPost(slug: string, language?: string): Promise<Post> {
  const params = language ? `?language=${language}` : '';
  return fetchApi<Post>(`/posts/${slug}${params}`);
}

export function getPostTranslation(slug: string, language: string): Promise<Post> {
  return fetchApi<Post>(`/posts/${slug}/translations/${language}`);
}

export function getCategories(): Promise<Category[]> {
  return fetchApi<Category[]>('/categories');
}

export function submitContact(payload: ContactPayload): Promise<{ success: boolean; message: string }> {
  return fetchApi('/contact', {
    method: 'POST',
    body: payload,
  });
}

export function getSiteConfig(): Promise<SiteConfig> {
  return fetchApi<SiteConfig>('/config');
}

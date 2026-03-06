import { paths } from '@/types/api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

export async function apiFetch<T>(
  path: string,
  options: {
    method?: HttpMethod;
    body?: unknown;
    params?: Record<string, string | number>;
    headers?: Record<string, string>;
  } = {}
): Promise<T> {
  // Ensure path starts with /api/v1 if it doesn't and it's not a root check
  // Also handle cases where path might already include the base URL or be an absolute path
  let fullPath = path;
  if (!path.startsWith('http') && !path.startsWith('/api/v1')) {
    fullPath = `/api/v1${path.startsWith('/') ? '' : '/'}${path}`;
  }
  
  // Use window.location.origin as default if BASE_URL is empty and in browser
  const origin = BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '');
  const url = new URL(fullPath.startsWith('http') ? fullPath : `${origin}${fullPath}`);
  
  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }

  const response = await fetch(url.toString(), {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'API request failed');
  }

  return response.json();
}

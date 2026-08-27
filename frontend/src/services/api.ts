export const API_BASE = '/api';

export function getToken(): string | null {
  return localStorage.getItem('lps_auth_token');
}

export function setToken(token: string | null): void {
  if (token) {
    localStorage.setItem('lps_auth_token', token);
  } else {
    localStorage.removeItem('lps_auth_token');
  }
}

export function getStoredUser(): any | null {
  const raw = localStorage.getItem('lps_user_info');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUser(user: any | null): void {
  if (user) {
    localStorage.setItem('lps_user_info', JSON.stringify(user));
  } else {
    localStorage.removeItem('lps_user_info');
  }
}

export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (response.status === 204) {
    return null as unknown as T;
  }

  const text = await response.text();
  let data: any = null;
  if (text && text.trim().length > 0) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    const errorMsg = data?.message || data?.title || `Error ${response.status}: ${response.statusText}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

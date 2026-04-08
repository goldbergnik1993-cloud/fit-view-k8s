const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiError {
  detail: string | { loc: string[]; msg: string; type: string }[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  email: string;
  id: number;
  role: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// ─── Token storage ────────────────────────────────────────────────────────────

export const tokenStorage = {
  getAccess: () => localStorage.getItem('access_token'),
  getRefresh: () => localStorage.getItem('refresh_token'),
  set: (access: string, refresh: string) => {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  },
  clear: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};

// ─── Base fetch ───────────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {},
  withAuth = false
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (withAuth) {
    const token = tokenStorage.getAccess();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // Try to refresh token on 401
  if (res.status === 401 && withAuth) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${tokenStorage.getAccess()}`;
      const retryRes = await fetch(`${BASE_URL}${path}`, { ...options, headers });
      if (!retryRes.ok) throw new Error('Unauthorized');
      return retryRes.json();
    }
    tokenStorage.clear();
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  if (!res.ok) {
    const err: ApiError = await res.json().catch(() => ({ detail: 'Unknown error' }));
    const message =
      typeof err.detail === 'string'
        ? err.detail
        : err.detail.map((e) => e.msg).join(', ');
    throw new Error(message);
  }

  return res.json();
}

async function tryRefreshToken(): Promise<boolean> {
  const refresh = tokenStorage.getRefresh();
  if (!refresh) return false;
  try {
    const data = await request<TokenResponse>('/user/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refresh }),
    });
    tokenStorage.set(data.access_token, data.refresh_token);
    return true;
  } catch {
    return false;
  }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  signup: (body: SignupRequest) =>
    request<AuthResponse>('/user/signup', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  login: async (body: LoginRequest): Promise<AuthResponse> => {
    // FastAPI OAuth2 expects form data for /token, but your endpoint is JSON /user/login
    const data = await request<TokenResponse>('/user/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    tokenStorage.set(data.access_token, data.refresh_token);
    // Fetch profile after login
    return request<AuthResponse>('/user/profile', {}, true);
  },

  logout: () => {
    tokenStorage.clear();
  },

  getProfile: () => request<AuthResponse>('/user/profile', {}, true),
};

// ─── Items ────────────────────────────────────────────────────────────────────

export interface BackendItem {
  id: number;
  name: string;
  brand: string;
  category: string;
  image_url: string;
  price: number;
  size_charts: { id: number; item_id: number; size_label: string }[];
  measurements: {
    id: number;
    item_id: number;
    size_label: string;
    total_length_cm?: number;
    inseam_cm?: number;
  }[];
}

export interface PaginatedResponse {
  total_items: number;
  total_pages: number;
  next_page: string | null;
  prev_page: string | null;
  items: BackendItem[];
}

export const itemsApi = {
  getAll: (params?: { category?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<PaginatedResponse>(`/items/${qs}`, {}, true);
  },

  getById: (id: string | number) =>
    request<BackendItem>(`/items/${id}`, {}, true),

  toggleFavorite: (itemId: string | number) =>
    request(`/items/${itemId}/favorite`, { method: 'POST' }, true),
};

// ─── User ─────────────────────────────────────────────────────────────────────

export const userApi = {
  getFavorites: () => request<BackendItem[]>('/user/favorites', {}, true),
};
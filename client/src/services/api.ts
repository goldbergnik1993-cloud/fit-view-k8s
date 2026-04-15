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

export async function request<T>(
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

  if (res.status === 401 && withAuth) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${tokenStorage.getAccess()}`;
      const retryRes = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
      });
      if (!retryRes.ok) throw new Error('Unauthorized');
      return retryRes.json();
    }
    tokenStorage.clear();
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  if (!res.ok) {
    const err: ApiError = await res
      .json()
      .catch(() => ({ detail: 'Unknown error' }));
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
    const data = await request<TokenResponse>('/user/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    tokenStorage.set(data.access_token, data.refresh_token);
    return request<AuthResponse>('/user/profile', {}, true).catch(() => ({
      email: body.email,
      id: 0,
      role: 'user',
    }));
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
  brand: { id: number; name: string } | string;
  category: string;
  gender?: string;
  image_url: string;
  price: number | string;
  is_favorite?: boolean;
  available_sizes: { id: number; size_label: string }[];
  available_measurements: { id: number; size_label: string }[];
}

export interface PaginatedResponse {
  total_items: number;
  total_pages: number;
  next_page: string | null;
  prev_page: string | null;
  items: BackendItem[];
}

export interface GetItemsParams {
  brands?: number[];
  page?: number;
  per_page?: number;
  category?: string;
  name?: string;
  size?: string;
  gender?: 'male' | 'female' | 'unisex';
  min_price?: number;
  max_price?: number;
  sort_by?: 'price_asc' | 'price_desc';
}

// ─── Fitting Room ─────────────────────────────────────────────────────────────

export interface FittingRoomRequest {
  measurement_id?: number;
  size_chart_id?: number;
  height_cm: number;
  shoulders_length_cm?: number;
  breast_length_cm?: number;
  waist_length_cm?: number;
  hips_length_cm?: number;
  leg_length_cm?: number;
}

export interface FittingRoomResponse {
  item_id: number;
  size_label: string;
  gender: string;
  visual_markers: {
    h_end_cm: number;
    line_position_pct: number;
    reference_point: string;
  };
  fit_analysis: {
    waist_fit: string;
    breast_fit: string;
    hips_fit: string;
    shoulders_fit: string;
  };
  user_body: {
    gender: string;
    height_cm: number;
    leg_length_cm: number;
    hips_length_cm: number;
    waist_length_cm: number;
    breast_length_cm: number;
    shoulders_length_cm: number;
  };
}

export interface SearchSuggestion {
  id: number;
  name: string;
  image_url: string;
  price: number;
}

export const itemsApi = {
  getAll: (params?: GetItemsParams) => {
    const query = new URLSearchParams();
    if (params?.page)      query.set('page', String(params.page));
    if (params?.per_page)  query.set('per_page', String(params.per_page));
    if (params?.category)  query.set('category', params.category);
    if (params?.name)      query.set('name', params.name);
    if (params?.size)      query.set('size', params.size);
    if (params?.gender)    query.set('gender', params.gender);
    if (params?.min_price) query.set('min_price', String(params.min_price));
    if (params?.max_price) query.set('max_price', String(params.max_price));
    if (params?.sort_by)   query.set('sort_by', params.sort_by);
    params?.brands?.forEach(id => query.append('brands', String(id)));
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<PaginatedResponse>(`/items/${qs}`, {}, true);
  },

  getById: (id: string | number) =>
    request<BackendItem>(`/items/${id}`, {}, true),

  toggleFavorite: (itemId: string | number) =>
    request(`/items/${itemId}/favorite`, { method: 'POST' }, true),

  fitItem: (itemId: number, body: FittingRoomRequest) =>
    request<FittingRoomResponse>(`/items/${itemId}/fitting-room`, {
      method: 'POST',
      body: JSON.stringify(body),
    }, true),

  getSearchSuggestions: (q: string) =>
    request<SearchSuggestion[]>(
      `/items/search/suggestions?q=${encodeURIComponent(q)}`,
      {},
      true
    ),

  getPersonalizedRecommendations: () =>
    request<BackendItem[]>('/items/recommendations/personalized', {}, true),
};

// ─── User ─────────────────────────────────────────────────────────────────────
export interface ProfileData {
  height_cm: number;
  gender: 'male' | 'female' | 'unisex' | null;
  shoulders_length_cm: number;
  breast_length_cm: number;
  waist_length_cm: number;
  hips_length_cm: number;
  leg_length_cm: number;
}

export interface ProfileResponse extends ProfileData {
  id: number;
  user_id: number;
}

export const userApi = {
  getFavorites: () =>
    request<BackendItem[]>('/user/favorites', {}, true),

  getProfile: () =>
    request<ProfileResponse>('/user/profile', {}, true),

  createProfile: (body: ProfileData) =>
    request<ProfileResponse>('/user/profile', {
      method: 'POST',
      body: JSON.stringify(body),
    }, true),

  updateProfile: (body: ProfileData) =>
    request<ProfileResponse>('/user/profile', {
      method: 'PATCH',
      body: JSON.stringify(body),
    }, true),
};

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: number;
  quantity: number;
  item: {
    id: number;
    name: string;
    brand: { id: number; name: string };
    category: string;
    gender: string;
    image_url: string;
    price: string;
    is_favorite: boolean;
  };
}

export interface Cart {
  user_id: number;
  id: number;
  status: 'Active' | 'Converted' | 'Abandoned';
  cart_items: CartItem[];
  created_at: string;
  updated_at: string;
  total_items: number;
  total_price: number;
}

export const cartApi = {
  getCart: () =>
    request<Cart>('/cart/', {}, true),

  clearCart: () =>
    request<Cart>('/cart/', { method: 'DELETE' }, true),

  addItem: (item_id: number, quantity = 1) =>
    request<Cart>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ item_id, quantity }),
    }, true),

  updateQuantity: (item_id: number, quantity: number) =>
    request<Cart>(`/cart/items/${item_id}`, {
      method: 'PATCH',
      body: JSON.stringify(quantity),
    }, true),

  removeItem: (item_id: number) =>
    request<Cart>(`/cart/items/${item_id}`, { method: 'DELETE' }, true),
};
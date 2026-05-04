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
  first_name: string;
  last_name: string;
  phone_number: string;
  birth_date?: string | null;
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

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface PasswordResetConfirmBody {
  password: string;
  token: string;
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
  withAuth = false,
  silentOn401 = false
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
    if (silentOn401) throw new Error('Unauthorized');
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
    const data = await request<TokenResponse>('/auth/refresh', {
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

export async function requestOptionalAuth<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = tokenStorage.getAccess();
  if (token) return request<T>(path, options, true);
  return request<T>(path, options, false);
}

export const authApi = {
  signup: (body: SignupRequest) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  verifyEmail: (body: VerifyEmailRequest) =>
    request<{ message: string }>('/auth/verify', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  login: async (body: LoginRequest): Promise<AuthResponse> => {
    const data = await request<TokenResponse>('/auth/login', {
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

  getProfile: () => requestOptionalAuth<AuthResponse>('/user/profile'),

  passwordResetRequest: (email: string) =>
    request<{ message: string }>('/auth/password-reset-request', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  passwordResetConfirm: (body: PasswordResetConfirmBody) =>
    request<{ message: string }>('/auth/password-reset-confirm', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
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
  description?: string | null;
  fitting_image_url?: string | null;
  mandatory_fields?: string[];
  available_sizes: { id: number; size_label: string }[];
  available_measurements: { id: number; size_label: string; total_length_cm?: number; inseam_cm?: number }[];
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
  gender?: 'male' | 'female';
  min_price?: number;
  max_price?: number;
  sort_by?: 'price_asc' | 'price_desc' | 'new' | 'popular';
}

// ─── Fitting Room ─────────────────────────────────────────────────────────────

export interface FittingRoomRequest {
  size_label: string;
  height_cm?: number | null;
  shoulders_length_cm?: number | null;
  breast_length_cm?: number | null;
  waist_length_cm?: number | null;
  hips_length_cm?: number | null;
  leg_length_cm?: number | null;
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

export interface ToggleFavoriteResponse {
  message: string;
  is_favorite: boolean;
}

export interface RecommendationItem {
  id: number;
  name: string;
  brand: { id: number; name: string };
  category: string;
  gender: string;
  image_url: string;
  price: string;
  is_favorite?: boolean;
  available_sizes: string[];
  available_measurements: string[];
}

export const itemsApi = {
  getAll: (params?: GetItemsParams) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.per_page) query.set('per_page', String(params.per_page));
    if (params?.category) query.set('category', params.category);
    if (params?.name) query.set('name', params.name);
    if (params?.size) query.set('size', params.size);
    if (params?.gender) query.set('gender', params.gender);
    if (params?.min_price) query.set('min_price', String(params.min_price));
    if (params?.max_price) query.set('max_price', String(params.max_price));
    if (params?.sort_by) query.set('sort_by', params.sort_by);
    params?.brands?.forEach((id) => query.append('brands', String(id)));
    const qs = query.toString() ? `?${query.toString()}` : '';
    return requestOptionalAuth<PaginatedResponse>(`/items/${qs}`);
  },

  getById: (id: string | number) =>
    requestOptionalAuth<BackendItem>(`/items/${id}`),

  toggleFavorite: (itemId: string | number) =>
    request<ToggleFavoriteResponse>(
      `/items/${itemId}/favorite`,
      { method: 'POST' },
      true,
      true
    ),

  fitItem: (itemId: number, body: FittingRoomRequest) =>
    requestOptionalAuth<FittingRoomResponse>(`/items/${itemId}/fitting-room`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getSearchSuggestions: (q: string) =>
    requestOptionalAuth<SearchSuggestion[]>(
      `/items/search/suggestions?q=${encodeURIComponent(q)}`
    ),

  getPersonalizedRecommendations: () =>
    requestOptionalAuth<RecommendationItem[]>(
      '/items/recommendations/personalized'
    ),
};

// ─── User ─────────────────────────────────────────────────────────────────────
export interface ProfileResponse {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  birth_date: string | null;
  height_cm: number | null;
  gender: string | null;
  shoulders_length_cm: number | null;
  breast_length_cm: number | null;
  waist_length_cm: number | null;
  hips_length_cm: number | null;
  leg_length_cm: number | null;
}

export interface ProfileUpdateData {
  first_name?: string | null;
  last_name?: string | null;
  phone_number?: string | null;
  birth_date?: string | null;
  email?: string | null;
  password?: string | null;
  height_cm?: number | null;
  gender?: string | null;
  shoulders_length_cm?: number | null;
  breast_length_cm?: number | null;
  waist_length_cm?: number | null;
  hips_length_cm?: number | null;
  leg_length_cm?: number | null;
}

export const userApi = {
  getFavorites: (params?: GetItemsParams) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.per_page) query.set('per_page', String(params.per_page));
    if (params?.category) query.set('category', params.category);
    if (params?.name) query.set('name', params.name);
    if (params?.size) query.set('size', params.size);
    if (params?.gender) query.set('gender', params.gender);
    if (params?.min_price) query.set('min_price', String(params.min_price));
    if (params?.max_price) query.set('max_price', String(params.max_price));
    if (params?.sort_by) query.set('sort_by', params.sort_by);
    params?.brands?.forEach((id) => query.append('brands', String(id)));
    const qs = query.toString() ? `?${query.toString()}` : '';
    return requestOptionalAuth<PaginatedResponse>(`/user/favorites${qs}`);
  },

  getProfile: () => requestOptionalAuth<ProfileResponse>('/user/profile'),

  updateProfile: (body: ProfileUpdateData) =>
    requestOptionalAuth<ProfileResponse>('/user/profile', {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  changeEmail: (code: string) =>
    requestOptionalAuth<{ message: string }>('/user/change-email', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),
};

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  size_label: string;
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
  getCart: () => requestOptionalAuth<Cart>('/cart/'),

  clearCart: () => requestOptionalAuth<Cart>('/cart/', { method: 'DELETE' }),

  addItem: (item_id: number, size_label: string, quantity = 1) =>
    requestOptionalAuth<Cart>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ item_id, size_label, quantity }),
    }),
  updateQuantity: (item_id: number, quantity: number) =>
    requestOptionalAuth<Cart>(`/cart/items/${item_id}`, {
      method: 'PATCH',
      body: JSON.stringify(quantity),
    }),
  removeItem: (item_id: number) =>
    requestOptionalAuth<Cart>(`/cart/items/${item_id}`, { method: 'DELETE' }),
};

// ─── Orders ───────────────────────────────────────────────────────────────────

export type DeliveryMethod = 'COURIER' | 'POST_OFFICE' | 'PARCEL_LOCKER';
export type OrderStatus =
  | 'Pending'
  | 'Paid'
  | 'Shipped'
  | 'Delivered'
  | 'Canceled'
  | 'Returned';
export type PaymentStatus = 'pending' | 'successful' | 'canceled' | 'refunded';

export interface DeliveryInfo {
  country: string;
  city: string;
  delivery_method: DeliveryMethod;
  zip_code?: string | null;
  address_line?: string | null;
  delivery_point_id?: string | null;
}

export interface OrderItemInCart {
  id: number;
  name: string;
  brand: { id: number; name: string };
  category: string;
  gender: string;
  image_url: string;
  price: string;
  is_favorite?: boolean;
}

export interface OrderItem {
  id: number;
  item_id: number | null;
  size_label: string;
  quantity: number;
  price_at_purchase: number;
  item: OrderItemInCart | null;
}

export interface OrderPayment {
  id: number;
  user_id: number | null;
  order_id: number | null;
  amount: string;
  currency?: string;
  status: PaymentStatus;
  external_payment_id: string;
  created_at: string;
}

export interface Order {
  id: number;
  user_id: number | null;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  delivery_info: DeliveryInfo;
  order_items: OrderItem[];
  payment: OrderPayment | null;
}

export interface OrderCreateBody {
  delivery_info: DeliveryInfo;
}

export interface CheckoutSessionResponse {
  checkout_url: string;
  payment_intent_id: string;
}

export const ordersApi = {
  getAll: () => requestOptionalAuth<Order[]>('/orders/'),

  create: (body: OrderCreateBody) =>
    requestOptionalAuth<Order>('/orders/', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getById: (orderId: number) =>
    requestOptionalAuth<Order>(`/orders/${orderId}`),

  checkout: (orderId: number) =>
    requestOptionalAuth<CheckoutSessionResponse>(
      `/orders/${orderId}/checkout`,
      { method: 'POST' }
    ),
};

// ─── Analytics ────────────────────────────────────────────────────────────────

export type FitViewEventType =
  | 'widget_shown'
  | 'height_entered'
  | 'result_shown';

export interface FitViewEventBody {
  item_id: number;
  event_type: FitViewEventType;
  height_used_cm?: number | null;
}

export const analyticsApi = {
  trackFitView: (body: FitViewEventBody) =>
    requestOptionalAuth<void>('/events/fitview', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};

import { API_URL } from './constants';
import { useAuthStore } from '@/stores/authStore';
import type {
  ApiResult,
  AuthResponse,
  AuthTokens,
  Booking,
  CreateBookingRequest,
  CreatePropertyRequest,
  DashboardSummary,
  KycResult,
  LoginRequest,
  PagedResult,
  Property,
  PropertyFilters,
  RegisterRequest,
  User,
} from './types';

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
  query?: Record<string, string | number | undefined>;
  retry?: boolean;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = new URL(`${API_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

async function refreshTokens(): Promise<boolean> {
  const { tokens, setSession, logout } = useAuthStore.getState();
  if (!tokens?.refreshToken) {
    logout();
    return false;
  }
  try {
    const response = await fetch(buildUrl('/auth/refresh'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: tokens.refreshToken }),
    });
    if (!response.ok) {
      logout();
      return false;
    }
    const data = (await response.json()) as AuthTokens;
    setSession({ tokens: data });
    return true;
  } catch {
    logout();
    return false;
  }
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResult<T>> {
  const { method = 'GET', body, auth = false, query, retry = true } = options;
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  if (auth) {
    const token = useAuthStore.getState().tokens?.accessToken;
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    return {
      ok: false,
      error: { status: 0, message: 'No se pudo conectar con el servidor.' },
    };
  }

  if (response.status === 401 && auth && retry) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      return request<T>(path, { ...options, retry: false });
    }
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
    return {
      ok: false,
      error: { status: 401, message: 'Sesion expirada.' },
    };
  }

  if (!response.ok) {
    return { ok: false, error: { status: response.status, message: await errorMessage(response) } };
  }

  if (response.status === 204) {
    return { ok: true, data: undefined as T };
  }

  const data = (await response.json()) as T;
  return { ok: true, data };
}

async function errorMessage(response: Response): Promise<string> {
  if (response.status === 429) {
    return 'Demasiadas solicitudes. Intentalo de nuevo en unos minutos.';
  }
  try {
    const data = await response.json();
    if (typeof data?.message === 'string') return data.message;
    if (typeof data?.title === 'string') return data.title;
  } catch {
    /* ignore */
  }
  return 'Ocurrio un error inesperado.';
}

export const api = {
  login(payload: LoginRequest) {
    return request<AuthResponse>('/auth/login', { method: 'POST', body: payload });
  },
  register(payload: RegisterRequest) {
    return request<AuthResponse>('/auth/register', { method: 'POST', body: payload });
  },
  me() {
    return request<User>('/auth/me', { auth: true });
  },
  listProperties(filters: PropertyFilters) {
    return request<PagedResult<Property>>('/properties', {
      query: {
        city: filters.city,
        checkIn: filters.checkIn,
        checkOut: filters.checkOut,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        guests: filters.guests,
        page: filters.page,
        pageSize: filters.pageSize,
      },
    });
  },
  getProperty(id: string) {
    return request<Property>(`/properties/${id}`);
  },
  createProperty(payload: CreatePropertyRequest) {
    return request<Property>('/properties', { method: 'POST', body: payload, auth: true });
  },
  listBookings() {
    return request<Booking[]>('/bookings', { auth: true });
  },
  getBooking(id: string) {
    return request<Booking>(`/bookings/${id}`, { auth: true });
  },
  createBooking(payload: CreateBookingRequest) {
    return request<Booking>('/bookings', { method: 'POST', body: payload, auth: true });
  },
  cancelBooking(id: string) {
    return request<Booking>(`/bookings/${id}/cancel`, { method: 'POST', auth: true });
  },
  getKycStatus() {
    return request<KycResult>('/kyc', { auth: true });
  },
  submitKyc(documentBase64: string, documentType: string) {
    return request<KycResult>('/kyc', {
      method: 'POST',
      body: { document: documentBase64, documentType },
      auth: true,
    });
  },
  getWishlist() {
    return request<Property[]>('/users/wishlist', { auth: true });
  },
  addToWishlist(propertyId: string) {
    return request<void>(`/users/wishlist/${propertyId}`, { method: 'POST', auth: true });
  },
  removeFromWishlist(propertyId: string) {
    return request<void>(`/users/wishlist/${propertyId}`, { method: 'DELETE', auth: true });
  },
  mergeWishlist(propertyIds: string[]) {
    return request<Property[]>('/users/wishlist/merge', {
      method: 'POST',
      body: { propertyIds },
      auth: true,
    });
  },
  getDashboard() {
    return request<DashboardSummary>('/dashboard', { auth: true });
  },
  exportUrl() {
    return buildUrl('/dashboard/export');
  },
};

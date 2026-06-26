export type UserRole = 'Guest' | 'Owner';

export type KycVerdict = 'Pending' | 'Approved' | 'Rejected';

// GET /auth/me devuelve unicamente estos campos. El estado KYC no forma parte
// del usuario: se consulta aparte con GET /kyc/status.
export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// El backend de /auth/login y /auth/register devuelve unicamente los tokens.
// El perfil del usuario se obtiene aparte con GET /auth/me.
export type AuthResponse = AuthTokens;

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: UserRole;
}

export interface PropertyPhoto {
  id: string;
  url: string;
  displayOrder: number;
}

// Detalle de inmueble. Forma de GET /properties/{id}.
export interface Property {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  nightlyRate: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  photos: PropertyPhoto[];
  rating?: number;
}

// Resumen de inmueble en el catalogo. Forma de cada item de GET /properties.
export interface PropertySummary {
  id: string;
  title: string;
  city: string;
  country: string;
  nightlyRate: number;
  maxGuests: number;
  mainPhotoUrl?: string;
  // El listado no devuelve coordenadas ni rating; quedan opcionales para el mapa.
  latitude?: number;
  longitude?: number;
  rating?: number;
  // Presente solo cuando el backend lo incluye; permite filtrar por propietario.
  ownerId?: string;
}

// Forma minima que necesita el mapa. La cumplen tanto Property como PropertySummary.
export interface MapProperty {
  id: string;
  title: string;
  city: string;
  nightlyRate: number;
  latitude?: number;
  longitude?: number;
}

export interface PropertyFilters {
  city?: string;
  checkIn?: string;
  checkOut?: string;
  minPrice?: number;
  maxPrice?: number;
  guests?: number;
  ownerId?: string;
  page?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';

// Forma de GET /bookings y GET /bookings/{id}. No incluye el inmueble anidado:
// la informacion del inmueble se resuelve aparte con GET /properties/{id}.
export interface Booking {
  id: string;
  propertyId: string;
  guestId: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
}

export interface CreateBookingRequest {
  propertyId: string;
  checkIn: string;
  checkOut: string;
}

export interface KycStatusResponse {
  verdict: KycVerdict;
  verifiedAt?: string;
}

export interface KycVerifyResponse {
  verdict: KycVerdict;
  reason?: string;
}

// Forma real de GET /dashboard/summary: solo KPIs agregados. No incluye el
// listado de inmuebles ni las reservas; cada uno se consulta en su endpoint.
// revenuePerProperty puede llegar como numero o como arreglo por inmueble.
export interface DashboardSummary {
  totalProperties: number;
  occupancyRate: number;
  totalRevenue: number;
  revenuePerProperty: number | number[];
}

export interface CreatePropertyRequest {
  title: string;
  description: string;
  city: string;
  country: string;
  address: string;
  pricePerNight: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  latitude: number;
  longitude: number;
  images: string[];
}

export interface ApiError {
  status: number;
  message: string;
}

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };

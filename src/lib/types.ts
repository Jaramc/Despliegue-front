export type UserRole = 'Guest' | 'Owner';

export type KycStatus = 'NotSubmitted' | 'Pending' | 'Approved' | 'Rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  kycStatus: KycStatus;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  city: string;
  country: string;
  address: string;
  pricePerNight: number;
  currency: string;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  latitude: number;
  longitude: number;
  ownerId: string;
  rating?: number;
}

export interface PropertyFilters {
  city?: string;
  checkIn?: string;
  checkOut?: string;
  minPrice?: number;
  maxPrice?: number;
  guests?: number;
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

export interface Booking {
  id: string;
  propertyId: string;
  property: Property;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
}

export interface CreateBookingRequest {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}

export interface KycResult {
  status: KycStatus;
  reason?: string;
}

export interface DashboardKpis {
  totalProperties: number;
  totalBookings: number;
  totalRevenue: number;
  occupancyRate: number;
}

export interface DashboardSummary {
  kpis: DashboardKpis;
  recentBookings: Booking[];
  properties: Property[];
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

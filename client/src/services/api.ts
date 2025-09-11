import axios from 'axios';
import { AuthResponse, Trip, Booking, HoldResponse, PurchaseResponse, Seat } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  signup: (data: { name: string; email: string; password: string; role?: string }) =>
    api.post<AuthResponse>('/auth/signup', data),
  
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),
};

// Trips API
export const tripsApi = {
  getAll: () => api.get<{ success: boolean; trips: Trip[] }>('/trips'),
  
  getById: (id: string) => 
    api.get<{ success: boolean; trip: Trip; totalAvailablePrice: number }>(`/trips/${id}`),
  
  create: (data: Partial<Trip> & { seats?: Partial<Seat>[] }) =>
    api.post<{ success: boolean; trip: Trip }>('/trips', data),
};

// Seats API
export const seatsApi = {
  getStatus: (tripId: string) =>
    api.get<{ success: boolean; tripId: string; seats: Seat[] }>(`/seats/${tripId}/status`),
  
  hold: (tripId: string, seats: number[]) =>
    api.post<HoldResponse>(`/seats/${tripId}/hold`, { seats }),
  
  release: (tripId: string, seats: number[]) =>
    api.post<{ success: boolean; released: number[] }>(`/seats/${tripId}/release`, { seats }),
  
  purchase: (tripId: string, seats: number[], holdId: string) =>
    api.post<PurchaseResponse>(`/seats/${tripId}/purchase`, { seats, holdId }),
};

// Bookings API
export const bookingsApi = {
  getMy: () => api.get<{ success: boolean; bookings: Booking[] }>('/bookings/my'),
  
  getAll: () => api.get<{ success: boolean; bookings: Booking[] }>('/bookings'),
  
  cancel: (bookingId: string) =>
    api.delete<{ 
      success: boolean; 
      message: string; 
      seatsReleased: number[]; 
      totalAmountRefunded: number 
    }>(`/bookings/${bookingId}`),
};

export default api;
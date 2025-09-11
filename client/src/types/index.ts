export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface Trip {
  id: string;
  title: string;
  route_from: string;
  route_to: string;
  departure_at: string;
  arrival_at: string;
  bus_type: 'standard' | 'luxury' | 'sleeper';
  sale_starts_at?: string;
  sale_ends_at?: string;
  seats?: Seat[];
  seatCounts?: {
    available: number;
    held: number;
    sold: number;
  };
}

export interface Seat {
  id: string;
  number: number;
  price: number;
  status: 'available' | 'held' | 'sold';
  row?: number;
  column?: string;
  ttl?: number;
}

export interface Booking {
  id: string;
  UserId: string;
  TripId: string;
  seats: number[];
  total_amount: number;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface HoldResponse {
  success: boolean;
  holdId?: string;
  totalPrice?: number;
  ttl?: number;
  seats?: number[];
  error?: string;
  failedSeats?: number[];
}

export interface PurchaseResponse {
  success: boolean;
  booking?: Booking;
  totalPrice?: number;
  error?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}

export interface WebSocketMessage {
  type: 'seat_held' | 'seat_released' | 'seat_sold';
  tripId: string;
  seats: number[];
  holdId?: string;
  userId?: string;
}
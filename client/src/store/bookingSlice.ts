import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { seatsApi, bookingsApi } from '../services/api';
import { Booking, HoldResponse } from '../types';

interface BookingState {
  selectedSeats: number[];
  holdId: string | null;
  holdTtl: number | null;
  holdExpiresAt: number | null;
  totalPrice: number;
  myBookings: Booking[];
  allBookings: Booking[];
  isLoading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  selectedSeats: [],
  holdId: null,
  holdTtl: null,
  holdExpiresAt: null,
  totalPrice: 0,
  myBookings: [],
  allBookings: [],
  isLoading: false,
  error: null,
};

export const holdSeats = createAsyncThunk(
  'booking/holdSeats',
  async ({ tripId, seats }: { tripId: string; seats: number[] }) => {
    const response = await seatsApi.hold(tripId, seats);
    return response.data;
  }
);

export const releaseSeats = createAsyncThunk(
  'booking/releaseSeats',
  async ({ tripId, seats }: { tripId: string; seats: number[] }) => {
    const response = await seatsApi.release(tripId, seats);
    return response.data;
  }
);

export const purchaseSeats = createAsyncThunk(
  'booking/purchaseSeats',
  async ({ tripId, seats, holdId }: { tripId: string; seats: number[]; holdId: string }) => {
    const response = await seatsApi.purchase(tripId, seats, holdId);
    return response.data;
  }
);

export const fetchMyBookings = createAsyncThunk('booking/fetchMy', async () => {
  const response = await bookingsApi.getMy();
  return response.data;
});

export const fetchAllBookings = createAsyncThunk('booking/fetchAll', async () => {
  const response = await bookingsApi.getAll();
  return response.data;
});

export const cancelBooking = createAsyncThunk(
  'booking/cancel',
  async (bookingId: string) => {
    const response = await bookingsApi.cancel(bookingId);
    return response.data;
  }
);

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    toggleSeatSelection: (state, action: PayloadAction<number>) => {
      const seatNumber = action.payload;
      const index = state.selectedSeats.indexOf(seatNumber);
      
      if (index > -1) {
        state.selectedSeats.splice(index, 1);
      } else {
        state.selectedSeats.push(seatNumber);
      }
    },
    clearSelection: (state) => {
      state.selectedSeats = [];
      state.holdId = null;
      state.holdTtl = null;
      state.holdExpiresAt = null;
      state.totalPrice = 0;
    },
    updateHoldExpiry: (state) => {
      if (state.holdExpiresAt && Date.now() >= state.holdExpiresAt) {
        state.holdId = null;
        state.holdTtl = null;
        state.holdExpiresAt = null;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Hold seats
    builder.addCase(holdSeats.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(holdSeats.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload.success && action.payload.holdId) {
        state.holdId = action.payload.holdId;
        state.holdTtl = action.payload.ttl || 120;
        state.holdExpiresAt = Date.now() + (action.payload.ttl || 120) * 1000;
        state.totalPrice = action.payload.totalPrice || 0;
        state.selectedSeats = action.payload.seats || state.selectedSeats;
      }
    });
    builder.addCase(holdSeats.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to hold seats';
    });

    // Purchase seats
    builder.addCase(purchaseSeats.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(purchaseSeats.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload.success) {
        // Clear selection after successful purchase
        state.selectedSeats = [];
        state.holdId = null;
        state.holdTtl = null;
        state.holdExpiresAt = null;
        state.totalPrice = 0;
      }
    });
    builder.addCase(purchaseSeats.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to purchase seats';
    });

    // Fetch my bookings
    builder.addCase(fetchMyBookings.fulfilled, (state, action) => {
      if (action.payload.success) {
        state.myBookings = action.payload.bookings;
      }
    });

    // Fetch all bookings (admin)
    builder.addCase(fetchAllBookings.fulfilled, (state, action) => {
      if (action.payload.success) {
        state.allBookings = action.payload.bookings;
      }
    });

    // Cancel booking
    builder.addCase(cancelBooking.fulfilled, (state, action) => {
      if (action.payload.success) {
        // Remove cancelled booking from lists
        const bookingId = action.meta.arg;
        state.myBookings = state.myBookings.filter(b => b.id !== bookingId);
        state.allBookings = state.allBookings.filter(b => b.id !== bookingId);
      }
    });
  },
});

export const { toggleSeatSelection, clearSelection, updateHoldExpiry, clearError } = bookingSlice.actions;
export default bookingSlice.reducer;
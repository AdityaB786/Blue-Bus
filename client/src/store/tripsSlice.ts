import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { tripsApi, seatsApi } from '../services/api';
import { Trip, Seat, WebSocketMessage } from '../types';

interface TripsState {
  trips: Trip[];
  currentTrip: Trip | null;
  currentSeats: Seat[];
  isLoading: boolean;
  error: string | null;
}

const initialState: TripsState = {
  trips: [],
  currentTrip: null,
  currentSeats: [],
  isLoading: false,
  error: null,
};

export const fetchTrips = createAsyncThunk('trips/fetchAll', async () => {
  const response = await tripsApi.getAll();
  return response.data;
});

export const fetchTripById = createAsyncThunk(
  'trips/fetchById',
  async (id: string) => {
    const response = await tripsApi.getById(id);
    return response.data;
  }
);

export const fetchSeatStatus = createAsyncThunk(
  'trips/fetchSeatStatus',
  async (tripId: string) => {
    const response = await seatsApi.getStatus(tripId);
    return response.data;
  }
);

const tripsSlice = createSlice({
  name: 'trips',
  initialState,
  reducers: {
    updateSeatStatus: (state, action: PayloadAction<WebSocketMessage>) => {
      const { type, seats } = action.payload;
      
      // Update seat status based on WebSocket message
      state.currentSeats = state.currentSeats.map(seat => {
        if (seats.includes(seat.number)) {
          if (type === 'seat_held') {
            return { ...seat, status: 'held' as const };
          } else if (type === 'seat_released') {
            return { ...seat, status: 'available' as const };
          } else if (type === 'seat_sold') {
            return { ...seat, status: 'sold' as const };
          }
        }
        return seat;
      });

      // Update seat counts if current trip is loaded
      if (state.currentTrip) {
        const counts = { available: 0, held: 0, sold: 0 };
        state.currentSeats.forEach(seat => {
          counts[seat.status]++;
        });
        state.currentTrip.seatCounts = counts;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all trips
    builder.addCase(fetchTrips.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchTrips.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload.success) {
        state.trips = action.payload.trips;
      }
    });
    builder.addCase(fetchTrips.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to fetch trips';
    });

    // Fetch trip by ID
    builder.addCase(fetchTripById.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchTripById.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload.success) {
        state.currentTrip = action.payload.trip;
        state.currentSeats = action.payload.trip.seats || [];
      }
    });
    builder.addCase(fetchTripById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to fetch trip';
    });

    // Fetch seat status
    builder.addCase(fetchSeatStatus.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchSeatStatus.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload.success) {
        state.currentSeats = action.payload.seats;
      }
    });
    builder.addCase(fetchSeatStatus.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to fetch seat status';
    });
  },
});

export const { updateSeatStatus, clearError } = tripsSlice.actions;
export default tripsSlice.reducer;
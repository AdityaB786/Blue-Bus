import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../services/api';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

// ---------- SAFE PARSER ----------
function safeJSONParse<T>(item: string | null): T | null {
  if (!item) return null;
  try {
    return JSON.parse(item) as T;
  } catch {
    return null;
  }
}

// ---------- INITIAL STATE ----------
const initialState: AuthState = {
  user: safeJSONParse<User>(localStorage.getItem('user')),
  token: localStorage.getItem('token') ?? null,
  isLoading: false,
  error: null,
};

// ---------- ASYNC THUNKS ----------
export const signup = createAsyncThunk(
  'auth/signup',
  async (data: { name: string; email: string; password: string; role?: string }) => {
    const response = await authApi.signup(data);
    return response.data;
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (data: { email: string; password: string }) => {
    const response = await authApi.login(data);
    return response.data;
  }
);

// ---------- SLICE ----------
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Signup
    builder.addCase(signup.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(signup.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload.success && action.payload.user) {
        state.user = action.payload.user;
      }
    });
    builder.addCase(signup.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Signup failed';
    });

    // Login
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload.success && action.payload.token && action.payload.user) {
        state.token = action.payload.token;
        state.user = action.payload.user;
        // Save to localStorage safely
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      }
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Login failed';
    });
  },
});

// ---------- EXPORTS ----------
export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;

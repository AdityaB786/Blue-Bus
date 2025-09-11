import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { TripsPage } from './pages/TripsPage';
import { TripDetailPage } from './pages/TripDetailPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { AdminTripPage } from './pages/AdminTripPage';
import { AdminBookingsPage } from './pages/AdminBookingsPage';
import websocketService from './services/websocket';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" />;
};

function AppContent() {
  useEffect(() => {
    // Connect to WebSocket on app start
    websocketService.connect();
    
    return () => {
      websocketService.disconnect();
    };
  }, []);

  return (
    <Router>
      <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/"
            element={
              <Layout>
                <LandingPage />
              </Layout>
            }
          />
          <Route
            path="/trips"
            element={
              <Layout>
                <TripsPage />
              </Layout>
            }
          />
          <Route
            path="/trips/:id"
            element={
              <Layout>
                <TripDetailPage />
              </Layout>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <PrivateRoute>
                <Layout>
                  <MyBookingsPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/trips"
            element={
              <PrivateRoute>
                <Layout>
                  <AdminTripPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <PrivateRoute>
                <Layout>
                  <AdminBookingsPage />
                </Layout>
              </PrivateRoute>
            }
          />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
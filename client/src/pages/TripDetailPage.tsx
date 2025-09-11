import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchTripById, updateSeatStatus, fetchTrips } from '../store/tripsSlice';
import { holdSeats, purchaseSeats, clearSelection, updateHoldExpiry } from '../store/bookingSlice';
import { SeatMap } from '../components/SeatMap';
import websocketService from '../services/websocket';

export const TripDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  
  const { currentTrip, currentSeats, isLoading } = useAppSelector((state) => state.trips);
  const { selectedSeats, holdId, holdExpiresAt, totalPrice } = useAppSelector((state) => state.booking);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (id) {
      dispatch(fetchTripById(id));
      
      // Subscribe to WebSocket updates
      const unsubscribe = websocketService.subscribe(id, (message) => {
        dispatch(updateSeatStatus(message));
      });

      return () => {
        unsubscribe();
        dispatch(clearSelection());
      };
    }
  }, [id, dispatch]);

  // Update hold expiry timer
  useEffect(() => {
    if (holdExpiresAt) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, holdExpiresAt - Date.now());
        setTimeLeft(Math.floor(remaining / 1000));
        
        if (remaining === 0) {
          dispatch(updateHoldExpiry());
          dispatch(clearSelection());
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [holdExpiresAt, dispatch]);

  const handleHoldSeats = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (selectedSeats.length === 0) {
      alert('Please select at least one seat');
      return;
    }

    if (id) {
      const result = await dispatch(holdSeats({ tripId: id, seats: selectedSeats }));
      if (holdSeats.rejected.match(result)) {
        alert('Failed to hold seats. Some seats may have been taken by another user.');
      }
    }
  };

  const handlePurchase = async () => {
    if (!id || !holdId) return;

    const result = await dispatch(purchaseSeats({ tripId: id, seats: selectedSeats, holdId }));
    if (purchaseSeats.fulfilled.match(result)) {
      alert('Booking confirmed! Redirecting to your bookings...');
      // Refresh trips to update seat counts
      dispatch(fetchTrips());
      navigate('/my-bookings');
    } else {
      alert('Purchase failed. Please try again.');
    }
  };

  const handleCancel = () => {
    dispatch(clearSelection());
  };

  if (isLoading || !currentTrip) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-3xl font-bold text-gray-900">{currentTrip.title}</h1>
          <div className="mt-2 text-lg text-gray-600">
            {currentTrip.route_from} → {currentTrip.route_to}
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Departure</h3>
              <p className="mt-1 text-sm text-gray-900">
                {format(new Date(currentTrip.departure_at), 'EEEE, MMMM d, yyyy')}
              </p>
              <p className="text-sm text-gray-900">
                {format(new Date(currentTrip.departure_at), 'h:mm a')}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Arrival</h3>
              <p className="mt-1 text-sm text-gray-900">
                {format(new Date(currentTrip.arrival_at), 'EEEE, MMMM d, yyyy')}
              </p>
              <p className="text-sm text-gray-900">
                {format(new Date(currentTrip.arrival_at), 'h:mm a')}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              currentTrip.bus_type === 'luxury' ? 'bg-purple-100 text-purple-800' :
              currentTrip.bus_type === 'sleeper' ? 'bg-indigo-100 text-indigo-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {currentTrip.bus_type} Bus
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SeatMap seats={currentSeats} busType={currentTrip.bus_type} />
        </div>
        
        <div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Booking Summary</h3>
            
            {holdId ? (
              <>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Hold expires in:</p>
                  <p className="text-2xl font-bold text-red-600">
                    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                  </p>
                </div>
                <div className="space-y-2 mb-4">
                  <p className="text-sm">
                    <span className="font-medium">Seat number:</span> {selectedSeats.join(', ')}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Total Price:</span> Rs.{totalPrice}
                  </p>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={handlePurchase}
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Complete Purchase
                  </button>
                  <button
                    onClick={handleCancel}
                    className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel Hold
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    {selectedSeats.length === 0
                      ? 'Select seats to continue'
                      : `${selectedSeats.length} seat${selectedSeats.length > 1 ? 's' : ''} selected`}
                  </p>
                </div>
                <button
                  onClick={handleHoldSeats}
                  disabled={selectedSeats.length === 0}
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Hold Selected Seats
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
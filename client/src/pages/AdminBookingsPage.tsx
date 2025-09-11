import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchAllBookings, cancelBooking } from '../store/bookingSlice';

export const AdminBookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { allBookings, isLoading } = useAppSelector((state) => state.booking);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    dispatch(fetchAllBookings());
  }, [user, navigate, dispatch]);

  const handleCancel = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      await dispatch(cancelBooking(bookingId));
      dispatch(fetchAllBookings());
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">All Bookings</h1>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {allBookings.length === 0 ? (
          <p className="text-center py-12 text-gray-500">No bookings yet</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {allBookings.map((booking) => (
              <li key={booking.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-600 truncate">
                        Booking ID: {booking.id}
                      </p>
                      <p className="mt-2 text-sm text-gray-500">
                        <span className="font-medium">User:</span> {booking.UserId}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        <span className="font-medium">Trip:</span> {booking.TripId}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        <span className="font-medium">Seats:</span> {booking.seats.join(', ')}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        <span className="font-medium">Total:</span> ${booking.total_amount}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        <span className="font-medium">Booked on:</span>{' '}
                        {format(new Date(booking.createdAt), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        booking.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status}
                      </span>
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          className="text-sm text-red-600 hover:text-red-500"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
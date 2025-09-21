import React, { useEffect } from 'react';
import { format } from 'date-fns';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchMyBookings, cancelBooking } from '../store/bookingSlice';

export const MyBookingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { myBookings, isLoading } = useAppSelector((state) => state.booking);

  useEffect(() => {
    dispatch(fetchMyBookings());
  }, [dispatch]);

  const handleCancel = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking? You will receive a full refund.')) {
      const result = await dispatch(cancelBooking(bookingId));
      if (cancelBooking.fulfilled.match(result)) {
        alert('Booking cancelled successfully. Refund will be processed.');
        dispatch(fetchMyBookings());
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (myBookings.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-medium text-gray-900">No bookings yet</h2>
        <p className="mt-2 text-gray-600">Start by booking a trip!</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {myBookings.map((booking) => (
            <li key={booking.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-600 truncate">
                      Booking ID: {booking.id}
                    </p>
                    <p className="mt-2 flex items-center text-sm text-gray-500">
                      <span className="font-medium">Trip:</span>
                      <span className="ml-1">{booking.TripId}</span>
                    </p>
                    <p className="mt-1 flex items-center text-sm text-gray-500">
                      <span className="font-medium">Seats:</span>
                      <span className="ml-1">{booking.seats.join(', ')}</span>
                    </p>
                    <p className="mt-1 flex items-center text-sm text-gray-500">
                      <span className="font-medium">Total:</span>
                      <span className="ml-1">{booking.total_amount}</span>
                    </p>
                    <p className="mt-1 flex items-center text-sm text-gray-500">
                      <span className="font-medium">Booked on:</span>
                      <span className="ml-1">
                        {format(new Date(booking.createdAt), 'MMM d, yyyy h:mm a')}
                      </span>
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
      </div>
    </div>
  );
};
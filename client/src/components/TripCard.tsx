import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Trip } from '../types';
import { useAppSelector } from '../hooks/redux';

interface TripCardProps {
  trip: Trip;
}

export const TripCard: React.FC<TripCardProps> = ({ trip }) => {
  const { user } = useAppSelector((state) => state.auth);
  const { seatCounts } = trip;
  const totalSeats = seatCounts
    ? seatCounts.available + seatCounts.held + seatCounts.sold
    : 0;
  const availablePercentage = seatCounts ? (seatCounts.available / totalSeats) * 100 : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="p-5">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{trip.title}</h3>
            <div className="flex items-center text-sm text-gray-600">
              <span className="font-medium">{trip.route_from}</span>
              <svg className="w-4 h-4 mx-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <span className="font-medium">{trip.route_to}</span>
            </div>
          </div>
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
            trip.bus_type === 'luxury' 
              ? 'bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 border border-purple-200' 
              : trip.bus_type === 'sleeper' 
              ? 'bg-gradient-to-r from-indigo-100 to-indigo-50 text-indigo-700 border border-indigo-200'
              : 'bg-gray-100 text-gray-700 border border-gray-200'
          }`}>
            {trip.bus_type.charAt(0).toUpperCase() + trip.bus_type.slice(1)}
          </span>
        </div>

        {/* Time Info */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Departure</p>
            <p className="text-sm font-medium text-gray-900">
              {format(new Date(trip.departure_at), 'MMM d, h:mm a')}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Arrival</p>
            <p className="text-sm font-medium text-gray-900">
              {format(new Date(trip.arrival_at), 'MMM d, h:mm a')}
            </p>
          </div>
        </div>

        {/* Seat Availability */}
        {seatCounts && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-gray-600">
                {seatCounts.available} seats available
              </span>
              <span className="text-xs text-gray-500">
                {totalSeats} total
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="h-1.5 rounded-full bg-gradient-to-r from-green-500 to-green-400"
                style={{ width: `${availablePercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Button */}
        <Link
          to={`/trips/${trip.id}`}
          className="w-full flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-sm hover:shadow"
        >
          View Details
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
};
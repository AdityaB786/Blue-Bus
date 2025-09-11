import React from 'react';
import { Seat } from '../types';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { toggleSeatSelection } from '../store/bookingSlice';

interface SeatMapProps {
  seats: Seat[];
  busType: string;
}

export const SeatMap: React.FC<SeatMapProps> = ({ seats, busType }) => {
  const dispatch = useAppDispatch();
  const { selectedSeats, holdId } = useAppSelector((state) => state.booking);
  const { user } = useAppSelector((state) => state.auth);

  // Group seats by row for better layout
  const seatsByRow = seats.reduce((acc, seat) => {
    const row = seat.row || Math.floor((seat.number - 1) / 4) + 1;
    if (!acc[row]) acc[row] = [];
    acc[row].push(seat);
    return acc;
  }, {} as Record<number, Seat[]>);

  const handleSeatClick = (seat: Seat) => {
    if (!user) {
      alert('Please login to select seats');
      return;
    }

    if (seat.status !== 'available') {
      return;
    }

    if (holdId) {
      alert('Please complete or cancel your current booking before selecting new seats');
      return;
    }

    dispatch(toggleSeatSelection(seat.number));
  };

  const getSeatColor = (seat: Seat) => {
    if (selectedSeats.includes(seat.number)) {
      return 'bg-blue-500 text-white';
    }

    switch (seat.status) {
      case 'available':
        return 'bg-green-100 hover:bg-green-200 text-green-800';
      case 'held':
        return 'bg-amber-100 text-amber-800 cursor-not-allowed';
      case 'sold':
        return 'bg-red-100 text-red-800 cursor-not-allowed';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Select Seats</h3>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 text-sm">
        <div className="flex items-center">
          <div className="w-6 h-6 bg-green-100 rounded mr-2"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center">
          <div className="w-6 h-6 bg-amber-100 rounded mr-2"></div>
          <span>Held</span>
        </div>
        <div className="flex items-center">
          <div className="w-6 h-6 bg-red-100 rounded mr-2"></div>
          <span>Sold</span>
        </div>
        <div className="flex items-center">
          <div className="w-6 h-6 bg-blue-500 rounded mr-2"></div>
          <span>Selected</span>
        </div>
      </div>

      {/* Bus Layout */}
      <div className="border-2 border-gray-300 rounded-lg p-4 max-w-md mx-auto">
        <div className="text-center mb-4 text-gray-600">
          <div className="text-sm">Front</div>
          <div className="w-16 h-8 bg-gray-300 rounded mx-auto mt-1"></div>
        </div>

        <div className="space-y-2">
          {Object.entries(seatsByRow).map(([row, rowSeats]) => (
            <div key={row} className="flex justify-center gap-2">
              <div className="grid grid-cols-2 gap-2">
                {rowSeats.slice(0, 2).map((seat) => (
                  <button
                    key={seat.number}
                    onClick={() => handleSeatClick(seat)}
                    disabled={seat.status !== 'available' && !selectedSeats.includes(seat.number)}
                    className={`w-10 h-10 rounded text-sm font-medium transition-colors ${getSeatColor(
                      seat
                    )}`}
                  >
                    {seat.number}
                  </button>
                ))}
              </div>
              <div className="w-8"></div>
              <div className="grid grid-cols-2 gap-2">
                {rowSeats.slice(2, 4).map((seat) => (
                  <button
                    key={seat.number}
                    onClick={() => handleSeatClick(seat)}
                    disabled={seat.status !== 'available' && !selectedSeats.includes(seat.number)}
                    className={`w-10 h-10 rounded text-sm font-medium transition-colors ${getSeatColor(
                      seat
                    )}`}
                  >
                    {seat.number}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-4 text-gray-600">
          <div className="text-sm">Rear</div>
        </div>
      </div>

      {/* Selected Seats Summary */}
      {selectedSeats.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900">Selected Seats</h4>
          <p className="text-blue-700">
            Seat Number: {selectedSeats.sort((a, b) => a - b).join(', ')}
          </p>
          <p className="text-blue-700">
            Total seats: {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''}
          </p>
          <p className="text-sm text-blue-600 mt-2">
            Price will be calculated when you proceed to hold seats
          </p>
        </div>
      )}
    </div>
  );
};
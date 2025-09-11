import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { tripsApi } from '../services/api';
import { fetchTrips } from '../store/tripsSlice';
import { Seat } from '../types';

export const AdminTripPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { trips } = useAppSelector((state) => state.trips);
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    route_from: '',
    route_to: '',
    departure_at: '',
    arrival_at: '',
    bus_type: 'standard' as 'standard' | 'luxury' | 'sleeper',
    sale_starts_at: '',
    sale_ends_at: '',
    seatRows: 10,
    seatsPerRow: 4,
    basePrice: 50,
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
    dispatch(fetchTrips());
  }, [user, navigate, dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Generate seats based on configuration
      const seats: Array<Partial<Seat>> = [];
      let seatNumber = 1;
      
      for (let row = 1; row <= formData.seatRows; row++) {
        for (let col = 1; col <= formData.seatsPerRow; col++) {
          seats.push({
            number: seatNumber++,
            row: row,
            column: String.fromCharCode(64 + col), // A, B, C, D
            price: formData.basePrice
          });
        }
      }

      const tripData = {
        title: formData.title,
        route_from: formData.route_from,
        route_to: formData.route_to,
        departure_at: new Date(formData.departure_at).toISOString(),
        arrival_at: new Date(formData.arrival_at).toISOString(),
        bus_type: formData.bus_type as 'standard' | 'luxury' | 'sleeper',
        sale_starts_at: formData.sale_starts_at ? new Date(formData.sale_starts_at).toISOString() : new Date().toISOString(),
        sale_ends_at: formData.sale_ends_at ? new Date(formData.sale_ends_at).toISOString() : new Date(formData.departure_at).toISOString(),
      };

      await tripsApi.create({ ...tripData, seats } as Parameters<typeof tripsApi.create>[0]);
      alert('Trip created successfully!');
      setShowForm(false);
      dispatch(fetchTrips());
      
      // Reset form
      setFormData({
        title: '',
        route_from: '',
        route_to: '',
        departure_at: '',
        arrival_at: '',
        bus_type: 'standard' as 'standard' | 'luxury' | 'sleeper',
        sale_starts_at: '',
        sale_ends_at: '',
        seatRows: 10,
        seatsPerRow: 4,
        basePrice: 50,
      });
    } catch (error: any) {
      alert('Failed to create trip: ' + (error.response?.data?.error || error.message));
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Trips</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'Create New Trip'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Trip</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Trip Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter Title"
                />
              </div>
              
              <div>
                <label htmlFor="bus_type" className="block text-sm font-medium text-gray-700">
                  Bus Type
                </label>
                <select
                  id="bus_type"
                  name="bus_type"
                  value={formData.bus_type}
                  onChange={handleChange}
                >
                  <option value="standard">Standard</option>
                  <option value="luxury">Luxury</option>
                  <option value="sleeper">Sleeper</option>
                </select>
              </div>

              <div>
                <label htmlFor="route_from" className="block text-sm font-medium text-gray-700">
                  From
                </label>
                <input
                  type="text"
                  id="route_from"
                  name="route_from"
                  required
                  value={formData.route_from}
                  onChange={handleChange}
                  placeholder="Noida"
                />
              </div>

              <div>
                <label htmlFor="route_to" className="block text-sm font-medium text-gray-700">
                  To
                </label>
                <input
                  type="text"
                  id="route_to"
                  name="route_to"
                  required
                  value={formData.route_to}
                  onChange={handleChange}
                  placeholder="Agra"
                />
              </div>

              <div>
                <label htmlFor="departure_at" className="block text-sm font-medium text-gray-700">
                  Departure Date & Time
                </label>
                <input
                  type="datetime-local"
                  id="departure_at"
                  name="departure_at"
                  required
                  value={formData.departure_at}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="arrival_at" className="block text-sm font-medium text-gray-700">
                  Arrival Date & Time
                </label>
                <input
                  type="datetime-local"
                  id="arrival_at"
                  name="arrival_at"
                  required
                  value={formData.arrival_at}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-2">Seat Configuration</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="seatRows" className="block text-sm font-medium text-gray-700">
                    Number of Rows
                  </label>
                  <input
                    type="number"
                    id="seatRows"
                    name="seatRows"
                    min="1"
                    max="20"
                    required
                    value={formData.seatRows}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="seatsPerRow" className="block text-sm font-medium text-gray-700">
                    Seats Per Row
                  </label>
                  <input
                    type="number"
                    id="seatsPerRow"
                    name="seatsPerRow"
                    min="2"
                    max="6"
                    required
                    value={formData.seatsPerRow}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700">
                    Base Price (Rs.)
                  </label>
                  <input
                    type="number"
                    id="basePrice"
                    name="basePrice"
                    min="1"
                    step="0.01"
                    required
                    value={formData.basePrice}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                This will create {formData.seatRows * formData.seatsPerRow} seats
              </p>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Trip
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {trips.map((trip) => (
            <li key={trip.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 truncate">
                      {trip.title}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {trip.route_from} → {trip.route_to}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Departure: {new Date(trip.departure_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    <p>Type: {trip.bus_type}</p>
                    <p>Seats: {trip.seats?.length || 0}</p>
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
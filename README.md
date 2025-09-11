# Bus Ticket Booking System

A real-time bus ticket booking system with seat selection, hold mechanism, and WebSocket updates.

## Features

- **User Authentication**: Signup/login with JWT tokens
- **Real-time Seat Updates**: WebSocket integration for live seat availability
- **Seat Hold Mechanism**: 2-minute hold before purchase with atomic Redis operations
- **Concurrent Booking Protection**: Prevents double-booking with distributed locking
- **Role-based Access**: Admin and user roles with different permissions
- **Responsive UI**: Modern React frontend with Tailwind CSS

## Tech Stack

### Backend
- Node.js + Express
- PostgreSQL with Sequelize ORM
- Redis for seat holds
- Socket.IO for real-time updates
- JWT authentication
- Express Validator for input validation

### Frontend
- React with TypeScript
- Redux Toolkit for state management
- Tailwind CSS for styling
- Socket.IO client
- React Router for navigation

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- PostgreSQL
- Redis
- npm or yarn

### Backend Setup

1. Navigate to the API directory:
```bash
cd api
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
DATABASE_URL=postgres://username:password@localhost:5432/ticket_booking
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:3000
PORT=5000
```

4. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login

### Trips
- `GET /api/trips` - Get all trips (public)
- `GET /api/trips/:id` - Get trip details (public)
- `POST /api/trips` - Create trip (admin only)

### Seats
- `GET /api/seats/:tripId/status` - Get seat status (public)
- `POST /api/seats/:tripId/hold` - Hold seats (auth required)
- `POST /api/seats/:tripId/purchase` - Purchase seats (auth required)
- `POST /api/seats/:tripId/release` - Release seats (auth required)

### Bookings
- `GET /api/bookings/my` - Get user's bookings (auth required)
- `GET /api/bookings` - Get all bookings (admin only)
- `DELETE /api/bookings/:bookingId` - Cancel booking (auth required)

## Key Improvements Implemented

1. **Atomic Redis Operations**: Using SET NX for preventing race conditions
2. **Input Validation**: Comprehensive validation middleware for all endpoints
3. **Trip Validation**: Checks for trip existence and sale window
4. **Proper Error Handling**: Detailed error messages and status codes
5. **Transaction Management**: Database transactions for critical operations
6. **WebSocket Integration**: Real-time updates for seat status changes

## Testing

### Create Admin User
First user to signup with role "admin" becomes admin:
```json
{
  "name": "Admin",
  "email": "admin@example.com",
  "password": "password123",
  "role": "admin"
}
```

### Create Sample Trip (Admin)
```json
{
  "title": "Express Bus to NYC",
  "route_from": "Boston",
  "route_to": "New York",
  "departure_at": "2024-12-25T10:00:00Z",
  "arrival_at": "2024-12-25T14:00:00Z",
  "bus_type": "luxury",
  "seats": [
    {"number": 1, "price": 50, "row": 1},
    {"number": 2, "price": 50, "row": 1},
    {"number": 3, "price": 50, "row": 1},
    {"number": 4, "price": 50, "row": 1}
  ]
}
```

## Architecture Decisions

1. **Redux for State Management**: Centralized state for complex booking flow
2. **Socket.IO over WebSocket**: Better browser compatibility and reconnection handling
3. **Atomic Redis Operations**: Prevents race conditions in distributed systems
4. **Sequelize ORM**: Type-safe database queries with migration support
5. **TypeScript Frontend**: Better type safety and developer experience
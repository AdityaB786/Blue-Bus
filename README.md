# Blue Bus

A real-time bus ticket booking system with seat selection, hold mechanism, and WebSocket updates.  

**Live Demo:** [https://blue-bus.vercel.app/](https://blue-bus.vercel.app/)

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
- npm

### Backend Setup

1. Navigate to the API directory:
```bash
cd api
````

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

3. Start the development server:

```bash
npm start
```

## API Endpoints

### Authentication

* `POST /api/auth/signup` - Create new account
* `POST /api/auth/login` - Login

### Trips

* `GET /api/trips` - Get all trips (public)
* `GET /api/trips/:id` - Get trip details (public)
* `POST /api/trips` - Create trip (admin only)

### Seats

* `GET /api/seats/:tripId/status` - Get seat status (public)
* `POST /api/seats/:tripId/hold` - Hold seats (auth required)
* `POST /api/seats/:tripId/purchase` - Purchase seats (auth required)
* `POST /api/seats/:tripId/release` - Release seats (auth required)

### Bookings

* `GET /api/bookings/my` - Get user's bookings (auth required)
* `GET /api/bookings` - Get all bookings (admin only)
* `DELETE /api/bookings/:bookingId` - Cancel booking (auth required)

**Admin Details:**  
- Email: `admin@gmail.com`  
- Password: `123456`

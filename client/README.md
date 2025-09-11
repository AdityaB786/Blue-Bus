# Bus Ticket Booking System - Frontend

## How to Use the System

### Prerequisites
- Backend server must be running on port 8000
- Frontend runs on port 3000

### Setup Instructions

1. **Start the Backend Server First**
   ```bash
   cd ../api
   npm install
   npm start
   ```

2. **Start the Frontend Client**
   ```bash
   cd ../client
   npm install
   npm start
   ```

## User Roles and Workflows

### Admin Role

**Creating an Admin Account:**
1. Navigate to http://localhost:3000/signup
2. Fill in your details
3. Select "Admin" from the Account Type dropdown
4. Click "Create account"
5. **Note:** Admin role is only granted if no admin exists in the system

**Admin Features:**
- Create and manage bus trips
- View all bookings across the system
- Access trip management dashboard

**Admin Workflow:**
1. Login with admin credentials
2. Click "Manage Trips" in the navigation menu
3. Click "Create New Trip" button
4. Fill in trip details:
   - Trip title (e.g., "Express Bus NYC")
   - Route from and to
   - Departure and arrival times
   - Bus type (standard/luxury/sleeper)
   - Seat configuration (rows × seats per row)
   - Base price per seat
5. Click "Create Trip" to save

### Regular User Role

**Creating a User Account:**
1. Navigate to http://localhost:3000/signup
2. Fill in your details
3. Select "Regular User" from the Account Type dropdown
4. Click "Create account"

**User Features:**
- Browse available trips
- Book seats on trips
- View and manage bookings
- Cancel bookings

**User Workflow:**
1. Login with user credentials
2. Browse available trips on the home page
3. Click on a trip card to view details
4. On the trip detail page:
   - View the seat map
   - Click on available (green) seats to select
   - Click "Hold Seats" to reserve temporarily
   - Click "Purchase" to complete booking
5. View bookings by clicking "My Bookings" in navigation

## Features

### Real-time Updates
- Seat availability updates in real-time
- WebSocket connection for live updates
- See when other users book seats

### Seat Management
- Visual seat map with color coding:
  - Green: Available
  - Yellow: Held (temporarily reserved)
  - Red: Sold
- Seats are held for a limited time before release

### Booking System
- Select multiple seats at once
- Temporary hold before purchase
- View booking history
- Cancel bookings (seats become available again)

## Troubleshooting

### Common Issues

**1. Trips not showing up:**
- Ensure backend server is running
- Check browser console for errors
- Refresh the page (F5)
- Verify admin has created trips

**2. Getting logged out on reload:**
- This happens when the auth token expires
- Simply log in again to continue
- User data is preserved in localStorage

**3. Cannot create admin account:**
- An admin already exists in the system
- Only one admin account is allowed
- Contact the existing admin for access

**4. WebSocket connection issues:**
- Check that backend is running on port 8000
- Look for WebSocket errors in console
- Ensure no firewall is blocking the connection

### Development

**Available Scripts:**
- `npm start` - Run development server
- `npm test` - Run tests
- `npm run build` - Build for production
- `npm run eject` - Eject from Create React App

**Tech Stack:**
- React with TypeScript
- Redux Toolkit for state management
- Tailwind CSS for styling
- Axios for API calls
- Socket.io for real-time updates

## API Endpoints

The frontend communicates with these backend endpoints:
- POST `/api/auth/signup` - Create account
- POST `/api/auth/login` - Login
- GET `/api/trips` - Get all trips
- GET `/api/trips/:id` - Get trip details
- POST `/api/trips` - Create trip (admin only)
- POST `/api/seats/:tripId/hold` - Hold seats
- POST `/api/seats/:tripId/purchase` - Purchase seats
- GET `/api/bookings/my` - Get user bookings
- DELETE `/api/bookings/:id` - Cancel booking
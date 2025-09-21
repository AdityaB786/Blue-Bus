require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { syncDB } = require('./models');
const { init: initSocketIO } = require('./models/wsServer');

// Routes
const authRoutes = require('./routes/authRoutes');
const tripRoutes = require('./routes/tripRoutes');
const seatRoutes = require('./routes/seatRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/bookings', bookingRoutes);


// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
initSocketIO(server);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);

syncDB();

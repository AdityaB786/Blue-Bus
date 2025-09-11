const { Server } = require('socket.io');

let io = null;

// Initialize Socket.IO server
const init = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling']
  });

  io.on('connection', (socket) => {
    console.log('✅ New Socket.IO client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('❌ Socket.IO client disconnected:', socket.id);
    });
  });

  return io;
};

// Broadcast message to all connected clients
const broadcast = (data) => {
  if (!io) {
    console.warn('Socket.IO not initialized, cannot broadcast');
    return;
  }
  
  io.emit('message', data);
};

module.exports = { init, broadcast };
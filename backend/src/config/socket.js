const { Server } = require('socket.io');

let io = null;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      // Reflects whatever origin connects, same policy as the REST API in app.js —
      // a mismatched hardcoded origin here would silently block the handshake
      // while REST calls kept working, making it look like a random flaky bug.
      origin: true,
    },
  });

  io.on('connection', (socket) => {
    socket.on('join_table', (tableId) => {
      socket.join(`table:${tableId}`);
    });

    socket.on('join_kitchen', () => {
      socket.join('kitchen');
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initSocket(server) first.');
  }
  return io;
}

module.exports = { initSocket, getIO };

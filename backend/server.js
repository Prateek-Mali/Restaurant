require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { initSocket } = require('./src/config/socket');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
initSocket(server);

// Open the port before touching the database. If the DB is unreachable, a host
// like Render still sees a live service and /api/health can report *why* —
// otherwise the whole app looks like a silent timeout with no way to diagnose it.
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

connectDB();

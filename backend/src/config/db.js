const mongoose = require('mongoose');

async function connectDB() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not set — check the environment variables on your host.');
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    // Deliberately not exiting: on a managed host, exiting here causes a restart
    // loop that hides the error. Staying up lets /api/health surface the cause.
    console.error(`MongoDB connection failed: ${error.message}`);
  }
}

module.exports = connectDB;

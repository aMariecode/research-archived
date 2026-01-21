const mongoose = require('mongoose');
require('dotenv').config();

// Cache the MongoDB connection for serverless environments
let cachedConnection = null;

const connectDB = async () => {
  // Reuse existing connection if available (serverless optimization)
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('Using cached MongoDB connection');
    return cachedConnection;
  }

  try {
    // Optimized for serverless with shorter timeouts
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
      socketTimeoutMS: 45000,
      bufferCommands: false, // Disable buffering for serverless
    });
    
    cachedConnection = conn;
    console.log('MongoDB connected successfully');
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Don't exit process in serverless environment
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
    throw error;
  }
};

// Only set up event listeners if not in serverless
if (!process.env.VERCEL) {
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
    if (err.message && err.message.includes('buffering timeout')) {
      setTimeout(() => connectDB(), 5000);
    }
  });
}

module.exports = connectDB;
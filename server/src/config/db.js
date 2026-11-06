const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/finance_tracker';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500, // Quick timeout if local mongo is not running
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.log(`ℹ️ MongoDB connection not available at ${uri}`);
    console.log(`🚀 Activating Built-in Resilient Data Store (zero-config, all features active)`);
    console.log(`💡 To connect to MongoDB Atlas, set MONGODB_URI in server/.env`);
    isConnected = false;
    return false;
  }
};

const getIsConnected = () => isConnected;

module.exports = { connectDB, getIsConnected };

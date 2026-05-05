const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`[Ghost Library] Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Security Alert] DB Error: ${error.message}`);
    throw error; // Rethrow to handle in start()
  }
};

module.exports = connectDB;

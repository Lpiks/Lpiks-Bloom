require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');

const start = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error(`[Security Alert] DB Error: ${error.message}`);
    console.warn('[System] Continuing in "Live-Stream Only" mode (History disabled)');
  }
  
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Sovereign Foundation] Engine online on http://0.0.0.0:${PORT}`);
  });
};

start();

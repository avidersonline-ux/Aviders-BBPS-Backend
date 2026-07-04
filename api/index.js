require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('../config/db');

// Initialize Express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection Middleware for Serverless
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Import Routes (Assuming we keep the previous routes layout)
// Note: In serverless, we mount them to the app instance
const bbpsRoutes = require('../routes/bbpsRoutes');
app.use('/api/bbps', bbpsRoutes);

// Health Check
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Aviders BBPS API is live on Vercel' });
});

// Export the app instance for Vercel
module.exports = app;

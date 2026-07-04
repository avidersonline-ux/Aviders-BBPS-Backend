import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import bbpsRoutes from './routes/bbpsRoutes.js';

// Load environment variables
dotenv.config();

// Initialize Database Connection
connectDB();

const app = express();

// Security & Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/bbps', bbpsRoutes);

// Basic Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'active', message: 'Aviders BBPS Backend is running' });
});

// Port Configuration
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  // server.close(() => process.exit(1));
});

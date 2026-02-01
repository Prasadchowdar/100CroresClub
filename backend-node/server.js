import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import authRoutes from './routes/auth.js';
import pointsRoutes from './routes/points.js';
import referralRoutes from './routes/referral.js';
import clubsRoutes from './routes/clubs.js';
import contactRoutes from './routes/contact.js';
import adminRoutes from './routes/admin.js';
import mediaRoutes from './routes/media.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/referral', referralRoutes);
app.use('/api/clubs', clubsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/media', mediaRoutes);

// Health check
app.get('/api', (req, res) => {
  res.json({ message: '100CRORECLUB API is running' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Start server
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();

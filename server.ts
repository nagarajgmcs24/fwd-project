
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import reportRoutes from './routes/reportRoutes';
import { Ward } from './models/Ward';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors() as any);
app.use(express.json({ limit: '50mb' }) as any);

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fixmyward';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to Ward Database'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Modular Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);

// Ward Route (Inline for simplicity or can be modularized further)
app.get('/api/wards', async (req, res) => {
  try {
    const wards = await Ward.find();
    res.json(wards);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch wards' });
  }
});

app.listen(PORT, () => {
  console.log(`Fix My Ward Server active on http://localhost:${PORT}`);
});

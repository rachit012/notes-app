import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import passport from 'passport';
import { configurePassport } from './config/passport';
import authRoutes from './routes/authRoutes';
import noteRoutes from './routes/noteRoutes';

dotenv.config();
configurePassport();

const app = express();
const PORT = process.env.PORT || 5001;

// --- ROBUST CORS CONFIGURATION START ---
const allowedOrigins = [process.env.FRONTEND_URL];

const corsOptions = {
  // Add explicit types to the origin function parameters
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // The !origin condition allows REST tools and server-to-server requests
    if (!origin || (allowedOrigins[0] && allowedOrigins.includes(origin))) {
      callback(null, true);
    } else {
      callback(new Error('This origin is not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200,
};

// This handles preflight requests for all routes
app.options('*', cors(corsOptions));

// This applies the CORS settings to all other requests
app.use(cors(corsOptions));
// --- ROBUST CORS CONFIGURATION END ---

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log(`MongoDB Connected`);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};
connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
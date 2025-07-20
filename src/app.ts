import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/user';
import authRoutes from './routes/authRoutes';
import organizationRoutes from './routes/organizationRoutes';

const app = express();

// CORS 設定：允許 dev-eolc.muldertech.co.uk、api-eolc.muldertech.co.uk、localhost 及 127.0.0.1
const allowedOrigins = [
  'https://dev-eolc.muldertech.co.uk',
  'https://api-eolc.muldertech.co.uk',
  'http://localhost:3000',
  'http://localhost:8080',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:8080'
];

app.use(cors({
  origin: function (origin, callback) {
    // 允許所有來源（開發方便，正式環境建議改嚴格）
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // 允許所有來源
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use('/api/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/organizations', organizationRoutes);

export default app; 
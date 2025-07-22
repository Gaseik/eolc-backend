import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/user';
import authRoutes from './routes/authRoutes';
import organizationRoutes from './routes/organizationRoutes';
import { CorsOptions } from 'cors';

const app = express();

// CORS 設定：全開放
const corsOptions: CorsOptions = {
  origin: '*', // 允許所有來源
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Credentials',
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Methods'
  ],
  exposedHeaders: [
    'Content-Disposition'
  ]
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());
app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/organizations', organizationRoutes);

export default app; 
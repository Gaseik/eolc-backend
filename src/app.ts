import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/user';
import authRoutes from './routes/authRoutes';
import organizationRoutes from './routes/organizationRoutes';
import { CorsOptions } from 'cors';

const app = express();

// CORS 設定：開發環境
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // 允許的來源列表
    const allowedOrigins = [
      'http://localhost:5173',
      'https://localhost:5173',
      'http://localhost:3000',
      'https://localhost:3000',
      'http://localhost:8080',
      'https://localhost:8080',
      'https://dev-eolc.muldertech.co.uk',
      'https://api-eolc.muldertech.co.uk'
    ];
    
    // 允許沒有 origin 的請求（例如同源請求）
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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
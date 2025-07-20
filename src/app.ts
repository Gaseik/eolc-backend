import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/user';
import authRoutes from './routes/authRoutes';
import organizationRoutes from './routes/organizationRoutes';
import { CorsOptions } from 'cors';

const app = express();

// CORS 設定：允許 dev-eolc.muldertech.co.uk、api-eolc.muldertech.co.uk、localhost 及 127.0.0.1
const allowedOrigins = [
  'https://dev-eolc.muldertech.co.uk',
  'https://api-eolc.muldertech.co.uk',
  'http://localhost:3000',
  'http://localhost:8080',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:8080',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

const corsOptions: CorsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    if (!origin || allowedOrigins.includes(origin)) {
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
    'Origin'
  ],
  exposedHeaders: [
    'Content-Disposition'
  ]
};

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: [
    'Content-Disposition'
  ]
}));
app.use('/api-docs', cors(corsOptions));

app.use(express.json());
app.use(cookieParser());
app.use('/api/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/organizations', organizationRoutes);

export default app; 
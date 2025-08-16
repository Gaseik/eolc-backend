import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/user';
import authRoutes from './routes/authRoutes';
import organizationRoutes from './routes/organizationRoutes';
import modelRoutes from './routes/ModelRoutes';
import orderRoutes from './routes/orderRoutes';
import roleRoutes from './routes/roleRoutes';
import modelReportRoutes from './routes/modelReportRoutes';
import orderReportRoutes from './routes/orderReportRoutes';
import statisticsRoutes from './routes/statisticsRoutes';
import { CorsOptions } from 'cors';

const app = express();

// 效能監控中間件
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});

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
      'https://api-eolc.muldertech.co.uk',
      'https://eolc.muldertech.co.uk'
    ];
    
    // 允許沒有 origin 的請求（例如同源請求）
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
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
    'Access-Control-Allow-Methods',
    'Idempotency-Key',
    'Cookie',
    'Set-Cookie'
  ],
  exposedHeaders: [
    'Content-Disposition',
    'x-access-token',
    'Set-Cookie'
  ],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// 額外的 CORS 處理中間件
app.use((req, res, next) => {
  // 處理預檢請求
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cookie, Set-Cookie, Idempotency-Key');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
    return res.status(204).end();
  }
  
  // 為所有響應添加 CORS 頭
  const origin = req.headers.origin;
  if (origin) {
    const allowedOrigins = [
      'http://localhost:5173',
      'https://localhost:5173',
      'http://localhost:3000',
      'https://localhost:3000',
      'http://localhost:8080',
      'https://localhost:8080',
      'https://dev-eolc.muldertech.co.uk',
      'https://api-eolc.muldertech.co.uk',
      'https://eolc.muldertech.co.uk'
    ];
    
    if (allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
    }
  }
  
  next();
});

// 設定 JSON 解析限制以提升效能
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 靜態檔案快取設定
app.use(express.static('public', {
  maxAge: '1h',
  etag: true
}));

app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/organizations', organizationRoutes);
app.use('/models', modelRoutes);
app.use('/orders', orderRoutes);
app.use('/roles', roleRoutes);
app.use('/model-reports', modelReportRoutes);
app.use('/order-reports', orderReportRoutes);
app.use('/statistics', statisticsRoutes);


export default app; 
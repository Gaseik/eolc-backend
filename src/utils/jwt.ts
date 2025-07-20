import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = '7d'; // 7天
const REFRESH_THRESHOLD = 24 * 60 * 60; // 1天（秒）

// 產生 JWT
export function generateToken(payload: any) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Middleware: 驗證 JWT 並自動刷新
export async function authAndRefresh(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ success: false, error: 'No token' });
    let payload: any;
    try {
      payload = jwt.verify(token, JWT_SECRET) as any;
    } catch (err) {
      return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
    // 將 user id 附加到 req
    (req as any).user = { id: payload.id, email: payload.email, role: payload.role };
    // 自動刷新：如果剩餘有效期小於 1 天
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp - now < REFRESH_THRESHOLD) {
      // 查找用戶（可選，若要檢查用戶狀態）
      const user = await User.findById(payload.id);
      if (user) {
        const newToken = generateToken({ id: user._id, email: user.email, role: user.role });
        res.cookie('token', newToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7天
        });
      }
    }
    next();
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server error' });
  }
} 
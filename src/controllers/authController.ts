import { Request, Response } from 'express';
import User, { IUser, UserRole } from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendMail } from '../utils/email';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = '7d';

// Helper: 產生 JWT
function generateToken(user: IUser) {
  return jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Helper: 產生 Refresh Token
function generateRefreshToken(user: IUser) {
  return jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
}

// 註冊
export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, organizationId, role, phone } = req.body;
    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    // 產生 email 驗證 token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24小時
    const user = await User.create({
      email,
      passwordHash,
      firstName,
      lastName,
      organizationId,
      role,
      phone,
      emailVerified: false,
      emailVerificationToken,
      emailVerificationExpires
    });
    // 根據來源動態產生驗證連結
    const origin = req.headers.origin || req.headers.referer || 'https://dev-eolc.muldertech.co.uk';
    const verifyUrl = `${origin.replace(/\/$/, '')}/verify?email=${encodeURIComponent(email)}&token=${emailVerificationToken}`;
    await sendMail({
      to: email,
      subject: 'EOLC 帳號驗證信',
      html: `<p>您好，請點擊以下連結完成信箱驗證：</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>連結 24 小時內有效。</p>`
    });
    return res.status(201).json({
      success: true,
      data: {
        userId: user._id,
        emailVerificationRequired: true,
        message: 'Please check your email for verification'
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

// 登入
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    // TODO: 2FA 驗證
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    return res.status(200).json({
      success: true,
      data: {
        token,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
          twoFactorEnabled: user.twoFactorEnabled,
          profile: {
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone
          }
        }
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

// 取得個人資料
export const getProfile = async (req: Request, res: Response) => {
  try {
    // 假設已經有 auth middleware 解析 userId
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        profile: {
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          avatar: user.avatarUrl
        },
        settings: {
          twoFactorEnabled: user.twoFactorEnabled,
          notifications: {
            email: true, sms: false, push: true // TODO: 從 userSettings 取
          }
        },
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

// 更新個人資料
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const { firstName, lastName, phone, avatar, settings } = req.body;
    const update: any = {};
    if (firstName !== undefined) update.firstName = firstName;
    if (lastName !== undefined) update.lastName = lastName;
    if (phone !== undefined) update.phone = phone;
    if (avatar !== undefined) update.avatarUrl = avatar;
    // 假如有通知設定
    if (settings && settings.notifications) {
      update['settings.notifications'] = settings.notifications;
    }
    update.updatedAt = new Date();
    const user = await User.findByIdAndUpdate(userId, update, { new: true });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        profile: {
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          avatar: user.avatarUrl
        },
        settings: {
          twoFactorEnabled: user.twoFactorEnabled,
          notifications: user.settings?.notifications || {}
        },
        updatedAt: user.updatedAt
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Email 驗證
export const emailVerification = async (req: Request, res: Response) => {
  try {
    const { email, verificationToken } = req.body;
    if (!email || !verificationToken) {
      return res.status(400).json({ success: false, error: 'Missing email or token' });
    }
    const user = await User.findOne({ email, emailVerificationToken: verificationToken });
    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid verification token' });
    }
    // 檢查 token 是否過期
    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
      return res.status(400).json({ success: false, error: 'Verification token expired' });
    }
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    return res.status(200).json({
      success: true,
      data: {
        verified: true,
        message: 'Email verified successfully'
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

// 忘記密碼
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'Missing email' });
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ success: true, message: 'If this email exists, a reset link has been sent.' });
    // 產生重設密碼 token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1小時
    user.emailVerificationToken = resetToken;
    user.emailVerificationExpires = resetExpires;
    await user.save();
    // 產生重設連結
    const origin = req.headers.origin || req.headers.referer || 'https://dev-eolc.muldertech.co.uk';
    const resetUrl = `${origin.replace(/\/$/, '')}/reset-password?email=${encodeURIComponent(email)}&token=${resetToken}`;
    await sendMail({
      to: email,
      subject: 'EOLC 密碼重設連結',
      html: `<p>請點擊以下連結重設您的密碼：</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>連結 1 小時內有效。</p>`
    });
    return res.status(200).json({ success: true, message: 'If this email exists, a reset link has been sent.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

// 重設密碼
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    const user = await User.findOne({ email, emailVerificationToken: token });
    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired token' });
    }
    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
      return res.status(400).json({ success: false, error: 'Token expired' });
    }
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    return res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

// 登出
export const logout = async (req: Request, res: Response) => {
  try {
    // 清除 httpOnly cookie（如果有）
    res.clearCookie('token');
    res.clearCookie('refreshToken');
    // TODO: 若有 refresh token 存資料庫，也可在這裡移除
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Token 刷新
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, error: 'Missing refresh token' });
    }
    // 驗證 refresh token
    let payload: any;
    try {
      payload = jwt.verify(refreshToken, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, error: 'Invalid refresh token' });
    }
    // 查找用戶
    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid refresh token' });
    }
    // 產生新 access token 和 refresh token
    const newToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);
    return res.status(200).json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server error' });
  }
}; 
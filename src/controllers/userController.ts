import { Request, Response } from 'express';
import User from '../models/User';
import Organization from '../models/Organization';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { Request as ExpressRequest } from 'express';

interface RequestWithUser extends ExpressRequest {
  user?: { _id: any };
}

const INVITE_TOKEN_EXPIRES = '3d';

// 取得所有使用者（原有）
export const getAll = async (req: Request, res: Response) => {
  const users = await User.find({}, '-passwordHash');
  res.json(users);
};

// 取得該組織所有成員（僅 admin 可查詢）
export const getMembers = async (req: RequestWithUser, res: Response) => {
  try {
    const userId = req.user?._id;
    const user = await User.findById(userId);
    if (!user || user.orgRole !== 'admin') {
      return res.status(403).json({ message: '僅 admin 可查詢成員' });
    }
    const members = await User.find({ organizationId: user.organizationId }, '-passwordHash');
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: '查詢成員失敗', error: err });
  }
};

// 邀請用戶加入組織（預設為非 admin，動態產生註冊連結並發送 email）
export const inviteUser = async (req: RequestWithUser, res: Response) => {
  try {
    const { email, role } = req.body;
    const userId = req.user?._id;
    const inviter = await User.findById(userId);
    if (!inviter) return res.status(401).json({ message: '未授權' });
    const orgId = inviter.organizationId;
    // 檢查是否已存在
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: '該 email 已存在' });
    // 產生邀請 token
    const token = jwt.sign({ email, organizationId: orgId, role }, process.env.JWT_SECRET!, { expiresIn: INVITE_TOKEN_EXPIRES });
    // 動態取得 origin
    const origin = req.headers.origin || req.headers.referer || process.env.FRONTEND_URL || 'https://default-domain.com';
    // 組合註冊連結
    const registerUrl = `${origin.replace(/\/login.*/, '')}/login/signup?token=${token}`;
    // 寄送 email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: '[EOLC] 您被邀請加入組織',
      html: `您被邀請加入組織，請點擊以下連結註冊：<br><a href="${registerUrl}">${registerUrl}</a><br>此連結三天內有效。`
    });
    res.json({ message: '邀請已送出', email, organizationId: orgId, role });
  } catch (err) {
    res.status(500).json({ message: '邀請失敗', error: err });
  }
};

// 取得邀請資訊（前端註冊頁用）
export const getInviteInfo = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: '缺少 token' });
    const payload = jwt.verify(token as string, process.env.JWT_SECRET!);
    // 回傳 email, organizationId, role
    res.json({ email: (payload as any).email, organizationId: (payload as any).organizationId, role: (payload as any).role });
  } catch (err) {
    res.status(400).json({ message: '邀請 token 無效或過期' });
  }
};

// 啟用邀請註冊
export const activateInvite = async (req: Request, res: Response) => {
  try {
    const { token, password, firstName, lastName } = req.body;
    if (!token || !password) return res.status(400).json({ message: '缺少必要參數' });
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    const { email, organizationId, role } = payload as any;
    // 檢查 email 是否已存在
    let user = await User.findOne({ email });
    if (user && user.status === 'active') return res.status(400).json({ message: '該 email 已註冊' });
    if (!user) {
      // 新增 user
      user = new User({
        email,
        passwordHash: password, // 實際應 hash 處理
        organizationId,
        role,
        orgRole: 'member',
        status: 'active',
        firstName,
        lastName,
        emailVerified: true
      });
    } else {
      // 更新 user 狀態
      user.passwordHash = password; // 實際應 hash 處理
      user.organizationId = organizationId;
      user.role = role;
      user.orgRole = 'member';
      user.status = 'active';
      user.firstName = firstName;
      user.lastName = lastName;
      user.emailVerified = true;
    }
    await user.save();
    res.json({ message: '註冊成功' });
  } catch (err) {
    res.status(400).json({ message: '邀請 token 無效或過期' });
  }
}; 
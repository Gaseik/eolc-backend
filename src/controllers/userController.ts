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

// 取得該組織所有成員（任何已登入用戶可查詢）
// GET /users/members?page=1&limit=10&search=user&sortBy=firstName&sortOrder=asc
export const getMembers = async (req: RequestWithUser, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: '未授權' });
    }
    
    // 獲取查詢參數
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || '';
    const sortBy = req.query.sortBy as string || 'firstName';
    const sortOrder = (req.query.sortOrder as string) === 'desc' ? -1 : 1;
    
    // 計算跳過的數量
    const skip = (page - 1) * limit;
    
    // 構建查詢條件
    const query: any = { organizationId: user.organizationId };
    
    // 添加搜尋條件
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } }
      ];
    }
    
    // 執行查詢
    const members = await User.find(query, '-passwordHash')
      .populate('organizationId', 'name type')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);
    
    // 獲取總數
    const total = await User.countDocuments(query);
    
    // 計算分頁信息
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    res.json({
      success: true,
      data: members,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage
      },
      count: members.length
    });
  } catch (err) {
    console.error('Get members error:', err);
    res.status(500).json({ message: '查詢成員失敗', error: err });
  }
};

// 獲取所有 regulatory users（支援搜尋、分頁和排序）
// GET /users/regulatory-users?page=1&limit=10&search=user&sortBy=firstName&sortOrder=asc
export const getRegulatoryUsers = async (req: RequestWithUser, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    // 檢查用戶是否存在
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    // 獲取查詢參數
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || '';
    const sortBy = req.query.sortBy as string || 'firstName';
    const sortOrder = (req.query.sortOrder as string) === 'desc' ? -1 : 1;
    
    // 計算跳過的數量
    const skip = (page - 1) * limit;
    
    // 構建查詢條件
    const query: any = { role: 'regulator' };
    
    // 添加搜尋條件
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // 執行查詢
    const regulatoryUsers = await User.find(query)
      .select('_id firstName lastName email organizationId role')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    // 獲取總數
    const total = await User.countDocuments(query);

    // 獲取相關的組織資訊
    const organizationIds = [...new Set(regulatoryUsers.map(user => user.organizationId))];
    const organizations = await Organization.find({ 
      _id: { $in: organizationIds } 
    }).select('_id name type').lean();

    // 組合用戶和組織資訊
    const usersWithOrg = regulatoryUsers.map(user => {
      const org = organizations.find(org => org._id.toString() === user.organizationId?.toString());
      return {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        organization: org ? {
          id: org._id,
          name: org.name,
          type: org.type
        } : null
      };
    });

    // 計算分頁信息
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      data: usersWithOrg,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage
      },
      count: usersWithOrg.length
    });
  } catch (err) {
    console.error('Get regulatory users error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
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
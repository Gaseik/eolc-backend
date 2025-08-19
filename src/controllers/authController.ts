import { Request, Response } from 'express';
import User, { IUser, UserRole } from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendMail } from '../utils/email';
import Organization from '../models/Organization';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = '7d';

// Helper: Generate JWT
function generateToken(user: IUser) {
  return jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Helper: Generate Refresh Token
function generateRefreshToken(user: IUser) {
  return jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
}

// Register
// POST /api/auth/signup
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
    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    let orgId = organizationId;
    let orgRole = null;
    // Platform admin registration (API/Swagger only, no organization creation)
    if (role === 'admin') {
      orgId = null;
      orgRole = null;
    } else if (!organizationId) {
          // General registration, no organizationId provided, create new organization, orgRole: 'admin'
    // Ensure type is a valid organization type
      const orgType = role === 'admin' ? 'endUser' : role as 'manufacturer' | 'regulator' | 'endUser';
      const org = await Organization.create({
                  name: `${firstName} ${lastName}'s Organization`, // Use user name as initial organization name
          type: orgType,
          address: undefined, // Add address field, set to undefined
        members: [],
        status: 'active',
        invitations: []
      });
      orgId = org._id;
      orgRole = 'admin';
    } else {
      // Invited registration, join existing organization, orgRole: 'member'
      orgRole = 'member';
    }
    const user = await User.create({
      email,
      passwordHash,
      firstName,
      lastName,
      organizationId: orgId,
      role,
      orgRole,
      phone,
      emailVerified: true, // Temporarily set to true, skip email verification
      emailVerificationToken,
      emailVerificationExpires
    });
    // If organization is auto-created, add user to members
    if (orgRole === 'admin' && orgId) {
      await Organization.findByIdAndUpdate(orgId, { $push: { members: user._id } });
    }
    // Temporarily skip email verification, complete registration directly
    // TODO: Implement email verification feature in the future
    return res.status(201).json({
      success: true,
      data: {
        userId: user._id,
        organizationId: orgId,
        orgRole,
        emailVerificationRequired: true,
        message: 'Please check your email for verification'
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Direct registration to specified organization
// POST /api/auth/signup-with-organization
export const signupWithOrganization = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, organizationId, role, orgRole, phone } = req.body;
    
    // Validate required fields
    if (!email || !password || !firstName || !lastName || !organizationId || !role) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: email, password, firstName, lastName, organizationId, role' 
      });
    }
    
    // Check if email already exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }
    
    // Check if organization exists
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(400).json({ success: false, error: 'Organization not found' });
    }
    
    // Check organization status
    if (organization.status !== 'active') {
      return res.status(400).json({ success: false, error: 'Organization is not active' });
    }
    
    // Check if role matches organization type
    const validRoleForOrgType = {
      'manufacturer': ['manufacturer'],
      'regulator': ['regulator'],
      'endUser': ['endUser']
    };
    
    const allowedRoles = validRoleForOrgType[organization.type as keyof typeof validRoleForOrgType];
    if (!allowedRoles || !allowedRoles.includes(role as any)) {
      return res.status(400).json({ 
        success: false, 
        error: `Role '${role}' is not valid for organization type '${organization.type}'` 
      });
    }
    
    // Validate orgRole parameter
    const validOrgRoles = ['admin', 'member'];
    const finalOrgRole = orgRole && validOrgRoles.includes(orgRole) ? orgRole : 'member';
    
    const passwordHash = await bcrypt.hash(password, 10);
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    // Create user
    const user = await User.create({
      email,
      passwordHash,
      firstName,
      lastName,
      organizationId,
      role,
              orgRole: finalOrgRole, // Explicitly set orgRole
      phone,
      emailVerified: true,
      emailVerificationToken,
      emailVerificationExpires
    });
    
    // Add user to organization的 members 列表
    await Organization.findByIdAndUpdate(organizationId, { 
      $push: { members: user._id } 
    });
    
    // 返回詳細信息
    const populatedUser = await User.findById(user._id)
      .populate('organizationId', 'name type address email contactPhone website taxId');
    
    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: populatedUser!._id,
          email: populatedUser!.email,
          firstName: populatedUser!.firstName,
          lastName: populatedUser!.lastName,
          role: populatedUser!.role,
          orgRole: populatedUser!.orgRole,
          organization: populatedUser!.organizationId
        },
        message: 'User registered and added to organization successfully'
      }
    });
  } catch (err) {
    console.error('Signup with organization error:', err);
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
    // TODO: 2FA verification
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Set httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    return res.status(200).json({
      success: true,
      data: {
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

// Get profile
export const getProfile = async (req: Request, res: Response) => {
  try {
    // Assume auth middleware has parsed userId
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
        orgRole: user.orgRole, // Add organization role information
        profile: {
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          avatar: user.avatarUrl
        },
        settings: {
          twoFactorEnabled: user.twoFactorEnabled,
          notifications: {
            email: true, sms: false, push: true // TODO: Get from userSettings
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

// Update profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const { firstName, lastName, phone, settings } = req.body;
    const update: any = {};
    if (firstName !== undefined) update.firstName = firstName;
    if (lastName !== undefined) update.lastName = lastName;
    if (phone !== undefined) update.phone = phone;
    // If notification settings exist
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
          phone: user.phone
        },
        settings: {
          notifications: user.settings?.notifications || {}
        },
        updatedAt: user.updatedAt
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Change password (requires old password verification)
export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
    
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Current password and new password are required' });
    }
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    
    // Verify old password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, error: 'Current password is incorrect' });
    }
    
    // Hash new password
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.updatedAt = new Date();
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Email verification
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
    // 清除 httpOnly cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

// 檢查登入狀態
export const checkAuth = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }
    
    return res.status(200).json({
      success: true,
      data: {
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
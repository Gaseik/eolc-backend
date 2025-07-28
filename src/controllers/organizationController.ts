import { Request, Response } from 'express';
import Organization from '../models/Organization';
import User from '../models/User';
import mongoose from 'mongoose';

// 在檔案最上方加上 Express Request 型別擴充
import { Request as ExpressRequest } from 'express';

interface RequestWithUser extends ExpressRequest {
  user?: { _id: any };
}

/**
 * @swagger
 * tags:
 *   name: Organizations
 *   description: 組織管理 API
 */

export const getOrganizations = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const query: any = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    const organizations = await Organization.find(query)
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .exec();
    const total = await Organization.countDocuments(query);
    res.json({ data: organizations, total });
  } catch (err) {
    res.status(500).json({ message: '取得組織失敗', error: err });
  }
};

export const getOrganizationById = async (req: Request, res: Response) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) return res.status(404).json({ success: false, error: 'Organization not found' });
    
    // 確保返回完整的組織資料，包括所有可能的欄位
    const fullOrgData = {
      _id: org._id,
      name: org.name,
      type: org.type,
      address: org.address || null,
      taxId: org.taxId || null,
      email: org.email || null,
      contactPhone: org.contactPhone || null,
      website: org.website || null,
      members: org.members,
      status: org.status,
      invitations: org.invitations,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
      __v: org.__v
    };
    
    res.json({ success: true, data: fullOrgData });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// 獲取當前用戶的組織資訊
export const getMyOrganization = async (req: RequestWithUser, res: Response) => {
  try {
    console.log('Request user object:', (req as any).user);
    const userId = (req as any).user?.id;
    console.log('Extracted userId:', userId);
    
    if (!userId) {
      console.log('No userId found in request');
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    
    const user = await User.findById(userId);
    console.log('Found user:', user ? 'yes' : 'no');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    
    console.log('User organizationId:', user.organizationId);
    if (!user.organizationId) {
      return res.status(404).json({ success: false, error: 'User does not belong to any organization' });
    }
    
    const org = await Organization.findById(user.organizationId);
    console.log('Found organization:', org ? 'yes' : 'no');
    if (!org) return res.status(404).json({ success: false, error: 'Organization not found' });
    
    res.json({
      success: true,
      data: org
    });
  } catch (err) {
    console.error('getMyOrganization error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};



export const updateOrganization = async (req: RequestWithUser, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
    
    const { name, status, address, taxId, email, contactPhone, website } = req.body;
    const orgId = req.params.id;
    
    console.log('Update request body:', req.body);
    
    // 檢查用戶是否屬於該組織
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    
    if (user.organizationId?.toString() !== orgId) {
      return res.status(403).json({ success: false, error: 'You can only update your own organization' });
    }
    
    // 構建完整的更新數據，包括所有可能的欄位
    const updateData: any = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name;
    if (status !== undefined) updateData.status = status;
    if (address !== undefined) updateData.address = address;
    if (taxId !== undefined) updateData.taxId = taxId;
    if (email !== undefined) updateData.email = email;
    if (contactPhone !== undefined) updateData.contactPhone = contactPhone;
    if (website !== undefined) updateData.website = website;
    
    console.log('Update data:', updateData);
    
    // 使用 $set 來確保新欄位被正確設置，並使用 upsert: false 來避免創建新記錄
    const org = await Organization.findByIdAndUpdate(
      orgId,
      { $set: updateData },
      { new: true, runValidators: true, upsert: false }
    );
    if (!org) return res.status(404).json({ success: false, error: 'Organization not found' });
    
    console.log('Updated organization:', org);
    
    // 確保返回完整的組織資料，包括所有可能的欄位
    const fullOrgData = {
      _id: org._id,
      name: org.name,
      type: org.type,
      address: org.address || null,
      taxId: org.taxId || null,
      email: org.email || null,
      contactPhone: org.contactPhone || null,
      website: org.website || null,
      members: org.members,
      status: org.status,
      invitations: org.invitations,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
      __v: org.__v
    };
    
    res.json({
      success: true,
      data: fullOrgData
    });
  } catch (err) {
    console.error('Update organization error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const deleteOrganization = async (req: Request, res: Response) => {
  try {
    const org = await Organization.findByIdAndDelete(req.params.id);
    if (!org) return res.status(404).json({ message: '找不到組織' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: '刪除組織失敗', error: err });
  }
};

/**
 * @swagger
 * /organizations/{id}/invite:
 *   post:
 *     summary: 邀請成員加入組織
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 組織 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: 邀請已送出
 *       404:
 *         description: 找不到組織
 */
export const inviteMember = async (req: RequestWithUser, res: Response) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) return res.status(404).json({ message: '找不到組織' });
    const { email } = req.body;
    // 檢查是否已邀請過
    if (org.invitations.some((inv: any) => inv.email === email && !inv.accepted)) {
      return res.status(400).json({ message: '已邀請過該成員' });
    }
    org.invitations.push({
      email,
      invitedBy: req.user?._id || null,
      invitedAt: new Date(),
      accepted: false
    });
    await org.save();
    // TODO: 可在此發送 email 通知
    res.json({ message: '邀請已送出' });
  } catch (err) {
    res.status(500).json({ message: '邀請失敗', error: err });
  }
};

/**
 * @swagger
 * /organizations/{id}/invitations:
 *   get:
 *     summary: 查詢組織邀請列表
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 組織 ID
 *     responses:
 *       200:
 *         description: 邀請列表
 *       404:
 *         description: 找不到組織
 */
export const getInvitations = async (req: Request, res: Response) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) return res.status(404).json({ message: '找不到組織' });
    res.json(org.invitations);
  } catch (err) {
    res.status(500).json({ message: '查詢邀請失敗', error: err });
  }
};

/**
 * @swagger
 * /organizations/{id}/accept-invitation:
 *   post:
 *     summary: 接受組織邀請
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 組織 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: 已加入組織
 *       404:
 *         description: 找不到組織或邀請
 */
export const acceptInvitation = async (req: Request, res: Response) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) return res.status(404).json({ message: '找不到組織' });
    const { email } = req.body;
    const invitation = org.invitations.find((inv: any) => inv.email === email && !inv.accepted);
    if (!invitation) return res.status(404).json({ message: '找不到邀請' });
    invitation.accepted = true;
    invitation.acceptedAt = new Date();
    // 尋找 user 並加入 members
    const user = await User.findOne({ email });
    if (user && !org.members.map(String).includes(String(user._id))) {
      org.members.push(new mongoose.Types.ObjectId(String(user._id)));
    }
    await org.save();
    res.json({ message: '已加入組織' });
  } catch (err) {
    res.status(500).json({ message: '接受邀請失敗', error: err });
  }
};

/**
 * @swagger
 * /organizations/{id}/members:
 *   get:
 *     summary: 查詢組織成員列表
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 組織 ID
 *     responses:
 *       200:
 *         description: 成員列表
 *       404:
 *         description: 找不到組織
 */
export const getMembers = async (req: Request, res: Response) => {
  try {
    const org = await Organization.findById(req.params.id).populate('members');
    if (!org) return res.status(404).json({ message: '找不到組織' });
    res.json(org.members);
  } catch (err) {
    res.status(500).json({ message: '查詢成員失敗', error: err });
  }
};

/**
 * @swagger
 * /organizations/{id}/members/{userId}:
 *   delete:
 *     summary: 移除組織成員
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 組織 ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: 使用者 ID
 *     responses:
 *       200:
 *         description: 已移除成員
 *       404:
 *         description: 找不到組織或成員
 */
export const removeMember = async (req: Request, res: Response) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) return res.status(404).json({ message: '找不到組織' });
    const userId = req.params.userId;
    const idx = org.members.findIndex((m: any) => String(m) === userId);
    if (idx === -1) return res.status(404).json({ message: '找不到成員' });
    org.members.splice(idx, 1);
    await org.save();
    res.json({ message: '已移除成員' });
  } catch (err) {
    res.status(500).json({ message: '移除成員失敗', error: err });
  }
};

/**
 * @swagger
 * /organizations/{id}/members/{userId}/role:
 *   put:
 *     summary: 變更組織成員角色
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 組織 ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: 使用者 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orgRole:
 *                 type: string
 *                 enum: [admin, member]
 *     responses:
 *       200:
 *         description: 角色已更新
 *       404:
 *         description: 找不到組織或成員
 */
export const updateMemberRole = async (req: Request, res: Response) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) return res.status(404).json({ message: '找不到組織' });
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: '找不到成員' });
    user.orgRole = req.body.orgRole;
    await user.save();
    res.json({ message: '角色已更新' });
  } catch (err) {
    res.status(500).json({ message: '更新角色失敗', error: err });
  }
}; 
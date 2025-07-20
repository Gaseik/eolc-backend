/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /api/users/getAllUsers:
 *   get:
 *     summary: 取得所有使用者（不含密碼）
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: 成功取得所有使用者
 */
import { Router } from 'express';
import { getAll, getMembers, inviteUser, getInviteInfo, activateInvite } from '../controllers/userController';

const router = Router();

router.get('/getAllUsers', getAll);

/**
 * @swagger
 * /users/members:
 *   get:
 *     summary: 取得該組織所有成員（僅 admin 可查詢）
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: 成員列表
 *       403:
 *         description: 僅 admin 可查詢成員
 */
router.get('/members', getMembers);

/**
 * @swagger
 * /users/invite:
 *   post:
 *     summary: 邀請用戶加入組織（預設為非 admin）
 *     tags: [Users]
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
 *       400:
 *         description: 該 email 已存在
 *       401:
 *         description: 未授權
 */
router.post('/invite', inviteUser);

/**
 * @swagger
 * /auth/invite-info:
 *   get:
 *     summary: 取得邀請資訊（註冊頁用）
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: 邀請 token
 *     responses:
 *       200:
 *         description: 邀請資訊
 *       400:
 *         description: token 無效
 */
router.get('/auth/invite-info', getInviteInfo);

/**
 * @swagger
 * /auth/activate-invite:
 *   post:
 *     summary: 啟用邀請註冊
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       200:
 *         description: 註冊成功
 *       400:
 *         description: token 無效或缺少參數
 */
router.post('/auth/activate-invite', activateInvite);

export default router; 
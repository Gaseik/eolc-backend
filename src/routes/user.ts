/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /users/getAllUsers:
 *   get:
 *     summary: 取得所有使用者（不含密碼）
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: 成功取得所有使用者
 */
import { Router } from 'express';
import { getAll, getMembers, inviteUser } from '../controllers/userController';
import { authAndRefresh } from '../utils/jwt';

const router = Router();

router.get('/getAllUsers', authAndRefresh, getAll);

/**
 * @swagger
 * /users/members:
 *   get:
 *     summary: 取得該組織所有成員（僅 admin 可查詢）
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成員列表
 *       403:
 *         description: 僅 admin 可查詢成員
 *       401:
 *         description: 未授權
 */
router.get('/members', authAndRefresh, getMembers);

/**
 * @swagger
 * /users/invite:
 *   post:
 *     summary: 邀請用戶加入組織（預設為非 admin）
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [regulatory, manufacturer, end user]
 *     responses:
 *       200:
 *         description: 邀請已送出
 *       400:
 *         description: 該 email 已存在
 *       401:
 *         description: 未授權
 */
router.post('/invite', authAndRefresh, inviteUser);

export default router; 
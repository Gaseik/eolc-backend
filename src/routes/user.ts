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
import { getAll, getMembers, inviteUser, getRegulatoryUsers } from '../controllers/userController';
import { authAndRefresh } from '../utils/jwt';

const router = Router();

router.get('/getAllUsers', authAndRefresh, getAll);

/**
 * @swagger
 * /users/members:
 *   get:
 *     summary: 取得該組織所有成員（任何已登入用戶可查詢）
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 頁碼
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每頁項目數量
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜尋關鍵字（姓名、郵箱、角色）
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [firstName, lastName, email, role, createdAt]
 *           default: firstName
 *         description: 排序欄位
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: 排序方向
 *     responses:
 *       200:
 *         description: 成員列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 *                       organizationId:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           type:
 *                             type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     itemsPerPage:
 *                       type: integer
 *                     hasNextPage:
 *                       type: boolean
 *                     hasPrevPage:
 *                       type: boolean
 *                 count:
 *                   type: integer
 *       401:
 *         description: 未授權
 *       500:
 *         description: 伺服器錯誤
 */
router.get('/members', authAndRefresh, getMembers);

/**
 * @swagger
 * /users/regulatory-users:
 *   get:
 *     summary: 獲取所有 regulatory users（支援搜尋、分頁和排序）
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 頁碼
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每頁項目數量
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜尋關鍵字（姓名、郵箱）
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [firstName, lastName, email, createdAt]
 *           default: firstName
 *         description: 排序欄位
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: 排序方向
 *     responses:
 *       200:
 *         description: 成功獲取 regulatory users 列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: 用戶 ID
 *                       name:
 *                         type: string
 *                         description: 用戶姓名
 *                       email:
 *                         type: string
 *                         description: 用戶郵箱
 *                       role:
 *                         type: string
 *                         description: 用戶角色
 *                       organization:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             description: 組織 ID
 *                           name:
 *                             type: string
 *                             description: 組織名稱
 *                           type:
 *                             type: string
 *                             description: 組織類型
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     itemsPerPage:
 *                       type: integer
 *                     hasNextPage:
 *                       type: boolean
 *                     hasPrevPage:
 *                       type: boolean
 *                 count:
 *                   type: integer
 *       401:
 *         description: 未授權
 *       500:
 *         description: 伺服器錯誤
 */
router.get('/regulatory-users', authAndRefresh, getRegulatoryUsers);

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
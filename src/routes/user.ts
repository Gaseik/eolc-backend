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
 *     summary: Get All Users (without passwords)
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Successfully retrieved all users
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
 *     summary: Get All Organization Members (any logged-in user can query)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search keywords (name, email, role)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [firstName, lastName, email, role, createdAt]
 *           default: firstName
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Members list
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
 *         description: Successfully retrieved regulatory users list
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
 *                         description: User ID
 *                       name:
 *                         type: string
 *                         description: User name
 *                       email:
 *                         type: string
 *                         description: User email
 *                       role:
 *                         type: string
 *                         description: User role
 *                       organization:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             description: Organization ID
 *                           name:
 *                             type: string
 *                             description: Organization name
 *                           type:
 *                             type: string
 *                             description: Organization type
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
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/regulatory-users', authAndRefresh, getRegulatoryUsers);

/**
 * @swagger
 * /users/invite:
 *   post:
 *     summary: Invite User to Organization (default as non-admin)
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
 *         description: Invitation sent
 *       400:
 *         description: Email already exists
 *       401:
 *         description: Unauthorized
 */
router.post('/invite', authAndRefresh, inviteUser);

export default router; 
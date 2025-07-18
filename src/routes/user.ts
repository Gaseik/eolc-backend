/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: 註冊新使用者
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, manager, user]
 *     responses:
 *       201:
 *         description: User registered
 *       400:
 *         description: Invalid email format
 *       409:
 *         description: Email already exists
 */

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: 使用者登入
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
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: 登入成功，回傳 user profile
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: 取得所有使用者（不含密碼）
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: 成功取得所有使用者
 */
import { Router } from 'express';
import { register, login, getAll } from '../controllers/userController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/', getAll);

export default router; 
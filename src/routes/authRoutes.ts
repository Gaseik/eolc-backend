import { Router } from 'express';
import { signup, login, getProfile, emailVerification, logout, refreshToken } from '../controllers/authController';
import { authAndRefresh } from '../utils/jwt';

const router = Router();

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: 用戶註冊
 *     tags: [Auth]
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
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               organizationId:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, manufacturer, regulator, endUser]
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: 註冊成功
 *       400:
 *         description: Email 已存在
 */
router.post('/signup', signup);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: 用戶登入
 *     tags: [Auth]
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
 *         description: 登入成功
 *       401:
 *         description: 帳號或密碼錯誤
 */
router.post('/login', login);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: 取得用戶個人資料
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功取得個人資料
 *       401:
 *         description: 未授權
 */
router.get('/profile', authAndRefresh, getProfile);

/**
 * @swagger
 * /auth/email-verification:
 *   post:
 *     summary: 郵箱驗證
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               verificationToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: 驗證成功
 *       400:
 *         description: 驗證失敗
 */
router.post('/email-verification', emailVerification);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: 用戶登出
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 登出成功
 */
router.post('/logout', logout);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: 刷新 access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: 成功刷新 token
 *       401:
 *         description: refresh token 無效
 */
router.post('/refresh', refreshToken);

export default router; 
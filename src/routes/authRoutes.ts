import { Router } from 'express';
import { signup, signupWithOrganization, login, getProfile, emailVerification, logout, refreshToken, updateProfile, forgotPassword, resetPassword, checkAuth, changePassword } from '../controllers/authController';
import { getInviteInfo, activateInvite } from '../controllers/userController';
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
 * /auth/signup-with-organization:
 *   post:
 *     summary: 直接加入指定組織的用戶註冊
 *     description: 此 API 允許用戶直接註冊並加入指定的組織，無需系統自動創建新組織。支援指定用戶在組織內的職別（orgRole）。
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - organizationId
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 description: 用戶郵箱
 *               password:
 *                 type: string
 *                 description: 用戶密碼
 *               firstName:
 *                 type: string
 *                 description: 用戶名字
 *               lastName:
 *                 type: string
 *                 description: 用戶姓氏
 *               organizationId:
 *                 type: string
 *                 description: 要加入的組織 ID（必填）
 *               role:
 *                 type: string
 *                 enum: [manufacturer, regulator, endUser]
 *                 description: 用戶角色（必須與組織類型匹配）
 *               orgRole:
 *                 type: string
 *                 enum: [admin, member]
 *                 default: member
 *                 description: 用戶在組織內的職別（可選，預設為 member）
 *               phone:
 *                 type: string
 *                 description: 用戶電話（可選）
 *     responses:
 *       201:
 *         description: 註冊成功並加入組織
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       description: 用戶 ID
 *                     organizationId:
 *                       type: string
 *                       description: 組織 ID
 *                     role:
 *                       type: string
 *                       description: 用戶角色
 *                     orgRole:
 *                       type: string
 *                       description: 用戶在組織內的職別
 *                     organizationName:
 *                       type: string
 *                       description: 組織名稱
 *                     organizationType:
 *                       type: string
 *                       description: 組織類型
 *                     emailVerificationRequired:
 *                       type: boolean
 *                     message:
 *                       type: string
 *       400:
 *         description: 請求錯誤
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 *                   examples:
 *                     - "Missing required fields: email, password, firstName, lastName, organizationId, role"
 *                     - "Email already exists"
 *                     - "Organization not found"
 *                     - "Organization is not active"
 *                     - "Role 'manufacturer' is not valid for organization type 'endUser'"
 *                     - "Invalid orgRole. Must be either 'admin' or 'member'"
 *       500:
 *         description: 伺服器錯誤
 */
router.post('/signup-with-organization', signupWithOrganization);

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
 *   put:
 *     summary: 更新用戶個人資料
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
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
 *               phone:
 *                 type: string
 *               avatar:
 *                 type: string
 *               settings:
 *                 type: object
 *                 properties:
 *                   notifications:
 *                     type: object
 *                     properties:
 *                       email:
 *                         type: boolean
 *                       sms:
 *                         type: boolean
 *                       push:
 *                         type: boolean
 *     responses:
 *       200:
 *         description: 更新成功
 *       400:
 *         description: 輸入資料錯誤
 *       401:
 *         description: 未授權
 */
router.get('/check', authAndRefresh, checkAuth);
router.get('/profile', authAndRefresh, getProfile);
router.put('/profile', authAndRefresh, updateProfile);

/**
 * @swagger
 * /auth/change-password:
 *   put:
 *     summary: 修改密碼（需要驗證舊密碼）
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: 當前密碼
 *               newPassword:
 *                 type: string
 *                 description: 新密碼
 *     responses:
 *       200:
 *         description: 密碼修改成功
 *       400:
 *         description: 缺少必要欄位或當前密碼錯誤
 *       401:
 *         description: 未授權
 */
router.put('/change-password', authAndRefresh, changePassword);

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

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: 忘記密碼（寄送重設連結）
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
 *     responses:
 *       200:
 *         description: 如果 email 存在，會寄送重設連結
 */
router.post('/forgot-password', forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: 重設密碼
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
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: 密碼重設成功
 *       400:
 *         description: token 錯誤或過期
 */
router.post('/reset-password', resetPassword);

/**
 * @swagger
 * /auth/invite-info:
 *   get:
 *     summary: 取得邀請資訊（註冊頁用）
 *     tags: [Auth]
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
router.get('/invite-info', getInviteInfo);

/**
 * @swagger
 * /auth/activate-invite:
 *   post:
 *     summary: 啟用邀請註冊
 *     tags: [Auth]
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
router.post('/activate-invite', activateInvite);

export default router; 
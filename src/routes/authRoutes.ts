import { Router } from 'express';
import { signup, signupWithOrganization, login, getProfile, emailVerification, logout, refreshToken, updateProfile, forgotPassword, resetPassword, checkAuth, changePassword } from '../controllers/authController';
import { getInviteInfo, activateInvite } from '../controllers/userController';
import { authAndRefresh } from '../utils/jwt';

const router = Router();

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: User Registration
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
 *         description: Registration successful
 *       400:
 *         description: Email already exists
 */
router.post('/signup', signup);

/**
 * @swagger
 * /auth/signup-with-organization:
 *   post:
 *     summary: Direct Organization Registration
 *     description: This API allows users to register and join a specified organization directly without the system automatically creating a new organization. Supports specifying the user's role within the organization (orgRole).
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
 *                 description: User email
 *               password:
 *                 type: string
 *                 description: User password
 *               firstName:
 *                 type: string
 *                 description: User first name
 *               lastName:
 *                 type: string
 *                 description: User last name
 *               organizationId:
 *                 type: string
 *                 description: Organization ID to join (required)
 *               role:
 *                 type: string
 *                 enum: [manufacturer, regulator, endUser]
 *                 description: User role (must match organization type)
 *               orgRole:
 *                 type: string
 *                 enum: [admin, member]
 *                 default: member
 *                 description: User's role within the organization (optional, defaults to member)
 *               phone:
 *                 type: string
 *                 description: User phone number (optional)
 *     responses:
 *       201:
 *         description: Registration successful and joined organization
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
 *         description: Server error
 */
router.post('/signup-with-organization', signupWithOrganization);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User Login
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
 *         description: Login successful
 *       401:
 *         description: Invalid email or password
 */
router.post('/login', login);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get User Profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved profile
 *       401:
 *         description: Unauthorized
 *   put:
 *     summary: Update User Profile
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
 *         description: Update successful
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
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
 *         description: Verification successful
 *       400:
 *         description: Verification failed
 */
router.post('/email-verification', emailVerification);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: User Logout
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', logout);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh Access Token
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
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid refresh token
 */
router.post('/refresh', refreshToken);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Forgot Password (Send Reset Link)
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
 *         description: If email exists, reset link will be sent
 */
router.post('/forgot-password', forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset Password
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
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 */
router.post('/reset-password', resetPassword);

/**
 * @swagger
 * /auth/invite-info:
 *   get:
 *     summary: Get Invitation Information (for registration page)
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Invitation token
 *     responses:
 *       200:
 *         description: Invitation information
 *       400:
 *         description: Invalid token
 */
router.get('/invite-info', getInviteInfo);

/**
 * @swagger
 * /auth/activate-invite:
 *   post:
 *     summary: Activate Invitation Registration
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
 *         description: Registration successful
 *       400:
 *         description: Invalid token or missing parameters
 */
router.post('/activate-invite', activateInvite);

export default router; 
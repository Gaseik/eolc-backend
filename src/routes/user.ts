/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /user/getAllUsers:
 *   get:
 *     summary: 取得所有使用者（不含密碼）
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: 成功取得所有使用者
 */
import { Router } from 'express';
import { getAll } from '../controllers/userController';

const router = Router();

router.get('/getAllUsers', getAll);

export default router; 
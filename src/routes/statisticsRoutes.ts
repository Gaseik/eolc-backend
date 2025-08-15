import express from 'express';
import { getOrderStatistics } from '../controllers/statisticsController';
import { authAndRefresh } from '../utils/jwt';

const router = express.Router();

/**
 * @swagger
 * /statistics/orders:
 *   get:
 *     summary: 獲取訂單統計數據（包括與上個月的比較）
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功獲取統計數據
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
 *                     currentMonth:
 *                       type: object
 *                       properties:
 *                         period:
 *                           type: object
 *                           properties:
 *                             start:
 *                               type: string
 *                               format: date-time
 *                             end:
 *                               type: string
 *                               format: date-time
 *                         statistics:
 *                           type: object
 *                           properties:
 *                             unusedQuantity:
 *                               type: number
 *                             inUseQuantity:
 *                               type: number
 *                             disposedQuantity:
 *                               type: number
 *                             totalQuantity:
 *                               type: number
 *                     lastMonth:
 *                       type: object
 *                       properties:
 *                         period:
 *                           type: object
 *                           properties:
 *                             start:
 *                               type: string
 *                               format: date-time
 *                             end:
 *                               type: string
 *                               format: date-time
 *                         statistics:
 *                           type: object
 *                           properties:
 *                             unusedQuantity:
 *                               type: number
 *                             inUseQuantity:
 *                               type: number
 *                             disposedQuantity:
 *                               type: number
 *                             totalQuantity:
 *                               type: number
 *                     comparison:
 *                       type: object
 *                       properties:
 *                         unusedQuantity:
 *                           type: object
 *                           properties:
 *                             change:
 *                               type: number
 *                             percentageChange:
 *                               type: number
 *                         inUseQuantity:
 *                           type: object
 *                           properties:
 *                             change:
 *                               type: number
 *                             percentageChange:
 *                               type: number
 *                         disposedQuantity:
 *                           type: object
 *                           properties:
 *                             change:
 *                               type: number
 *                             percentageChange:
 *                               type: number
 *                         totalQuantity:
 *                           type: object
 *                           properties:
 *                             change:
 *                               type: number
 *                             percentageChange:
 *                               type: number
 *       401:
 *         description: 未授權
 *       404:
 *         description: 用戶不存在
 *       500:
 *         description: 伺服器錯誤
 */
router.get('/orders', authAndRefresh, getOrderStatistics);

export default router; 
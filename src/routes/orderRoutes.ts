import { Router } from 'express';
import * as orderController from '../controllers/orderController';
import { authAndRefresh } from '../utils/jwt';

const router = Router();

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: 創建訂單
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - modelId
 *               - batchNumber
 *               - endUserCompanyId
 *               - producedQuantity
 *             properties:
 *               modelId:
 *                 type: string
 *                 description: 模型 ID
 *               batchNumber:
 *                 type: string
 *                 description: 批次號
 *               endUserCompanyId:
 *                 type: string
 *                 description: 終端用戶公司 ID (Organization)
 *               producedQuantity:
 *                 type: number
 *                 description: 生產數量

 *     responses:
 *       201:
 *         description: 訂單創建成功
 *       400:
 *         description: 請求參數錯誤
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
 */
router.post('/', authAndRefresh, orderController.createOrder);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: 獲取訂單列表
 *     tags: [Orders]
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
 *         description: 每頁數量
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜尋關鍵字 (批次號、終端用戶公司)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_production, completed, disposed]
 *         description: 訂單狀態篩選
 *       - in: query
 *         name: scope
 *         schema:
 *           type: string
 *           enum: [my, organization]
 *           default: my
 *         description: 查詢範圍 (my: 自己的訂單, organization: 組織內所有訂單)
 *     responses:
 *       200:
 *         description: 成功獲取訂單列表
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
 */
router.get('/', authAndRefresh, orderController.getOrders);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: 獲取單一訂單
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 訂單 ID
 *     responses:
 *       200:
 *         description: 成功獲取訂單
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
 *       404:
 *         description: 訂單不存在
 */
router.get('/:id', authAndRefresh, orderController.getOrderById);

/**
 * @swagger
 * /orders/{id}:
 *   put:
 *     summary: 更新訂單
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 訂單 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               batchNumber:
 *                 type: string
 *                 description: 批次號
 *               endUserCompanyId:
 *                 type: string
 *                 description: 終端用戶公司 ID (Organization)
 *               status:
 *                 type: string
 *                 enum: [pending, in_production, completed, disposed]
 *                 description: 訂單狀態
 *               inUseQuantity:
 *                 type: number
 *                 description: 使用中數量
 *               disposedQuantity:
 *                 type: number
 *                 description: 已處置數量
 *               unusedQuantity:
 *                 type: number
 *                 description: 未使用數量
 *     responses:
 *       200:
 *         description: 訂單更新成功
 *       400:
 *         description: 請求參數錯誤
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
 *       404:
 *         description: 訂單不存在
 */
router.put('/:id', authAndRefresh, orderController.updateOrder);

/**
 * @swagger
 * /orders/{id}:
 *   delete:
 *     summary: 刪除訂單
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 訂單 ID
 *     responses:
 *       200:
 *         description: 訂單刪除成功
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
 *       404:
 *         description: 訂單不存在
 */
router.delete('/:id', authAndRefresh, orderController.deleteOrder);

export default router; 
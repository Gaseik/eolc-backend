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
 *           enum: [pending, production, in-used, disposed]
 *         description: 訂單狀態篩選
 *       - in: query
 *         name: scope
 *         schema:
 *           type: string
 *           enum: [my, organization]
 *           default: my
 *         description: "查詢範圍 (my: 自己的訂單, organization: 組織內所有訂單)"
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
 * /orders/test-user-and-orders:
 *   get:
 *     summary: 測試API - 檢查用戶組織信息和訂單信息
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功獲取測試信息
 *       401:
 *         description: 未授權
 *       500:
 *         description: 服務器錯誤
 */
router.get('/test-user-and-orders', authAndRefresh, orderController.testUserAndOrders);

/**
 * @swagger
 * /orders/by-enduser-company:
 *   get:
 *     summary: 獲取特定終端用戶公司的所有訂單（需要用戶認證）
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: endUserCompanyId
 *         schema:
 *           type: string
 *         description: 終端用戶公司 ID（可選，endUser 角色會自動使用自己的組織ID）
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
 *     responses:
 *       200:
 *         description: 成功獲取訂單列表
 *       400:
 *         description: 請求參數錯誤
 *       401:
 *         description: 未授權
 *       500:
 *         description: 服務器錯誤
 */
router.get('/by-enduser-company', authAndRefresh, orderController.getOrdersByEndUserCompany);

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
 *                 enum: [pending, production, in-used, disposed]
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
 * /orders/{id}/update-quantity:
 *   patch:
 *     summary: 更新訂單數量（以 type+quantity 操作，並觸發自動狀態轉換）
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
 *             required:
 *               - type
 *               - quantity
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [in-used, disposed]
 *                 description: '動作類型（相容舊版可傳 status，但以 type 為主）'
 *               status:
 *                 type: string
 *                 enum: [in-used, disposed]
 *                 description: '[Deprecated] 舊版欄位，將被忽略（僅保留相容）'
 *               quantity:
 *                 type: number
 *                 minimum: 1
 *                 description: 轉換數量
 *     responses:
 *       200:
 *         description: 訂單數量更新成功
 *       400:
 *         description: 請求參數錯誤或數量計算錯誤
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
 *       404:
 *         description: 訂單不存在
 */
router.patch('/:id/update-quantity', authAndRefresh, orderController.updateOrderStatus);

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     deprecated: true
 *     summary: '[Deprecated] 舊版路由，請改用 /orders/{id}/update-quantity'
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
 *             required:
 *               - type
 *               - quantity
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [in-used, disposed]
 *                 description: '動作類型（相容舊版可傳 status，但以 type 為主）'
 *               status:
 *                 type: string
 *                 enum: [in-used, disposed]
 *                 description: '[Deprecated] 舊版欄位，將被忽略（僅保留相容）'
 *               quantity:
 *                 type: number
 *                 minimum: 1
 *                 description: 轉換數量
 *     responses:
 *       200:
 *         description: 訂單數量更新成功
 *       400:
 *         description: 請求參數錯誤或數量計算錯誤
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
 *       404:
 *         description: 訂單不存在
 */
router.patch('/:id/status', authAndRefresh, orderController.updateOrderStatus);

// 額外相容：駝峰命名別名
router.patch('/:id/updateQuantity', authAndRefresh, orderController.updateOrderStatus);

// 額外相容：含有常見拼字誤差的別名（updateQuanity）
router.patch('/:id/updateQuanity', authAndRefresh, orderController.updateOrderStatus);

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
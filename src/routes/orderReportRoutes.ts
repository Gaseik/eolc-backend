import { Router } from 'express';
import { createOrderReport, getOrderReports, getOrderReportById, updateOrderReportStatus, deleteOrderReport } from '../controllers/orderReportController';
import { authAndRefresh } from '../utils/jwt';

const router = Router();

/**
 * @swagger
 * /order-reports:
 *   post:
 *     summary: 創建訂單報告
 *     tags: [Order Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - orderId
 *               - assignedTo
 *               - disposalQuantity
 *             properties:
 *               title:
 *                 type: string
 *                 description: 報告標題
 *               description:
 *                 type: string
 *                 description: 報告描述
 *               orderId:
 *                 type: string
 *                 description: 訂單 ID
 *               assignedTo:
 *                 type: string
 *                 description: 指派的 regulatory 用戶 ID
 *               disposalQuantity:
 *                 type: number
 *                 description: 處置數量
 *               disposalMethod:
 *                 type: string
 *                 description: 處置方法（可選）
 *               evidenceLinks:
 *                 type: array
 *                 description: 證據連結（例如 Google Drive/OneDrive 等 URL）
 *                 items:
 *                   type: string
 *                   format: uri
 *               materials:
 *                 type: array
 *                 description: 材料細項（可選）
 *                 items:
 *                   type: object
 *                   properties:
 *                     materialKey:
 *                       type: string
 *                     wasteStreamClassification:
 *                       type: array
 *                       items:
 *                         type: string
 *                     labellingAndPackaging:
 *                       type: array
 *                       items:
 *                         type: string
 *                     transportationAndStorage:
 *                       type: string
 *                     condition:
 *                       type: array
 *                       items:
 *                         type: string
 *                     disposalMethod:
 *                       type: array
 *                       items:
 *                         type: string
 *                     attachments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           fileId:
 *                             type: string
 *                           fileName:
 *                             type: string
 *                           mimeType:
 *                             type: string
 *               notes:
 *                 type: string
 *                 description: 備註（可選）
 *               submittedAt:
 *                 type: string
 *                 format: date-time
 *                 description: 提交時間（由後端自動生成，前端傳入會被忽略）
 *     responses:
 *       201:
 *         description: 訂單報告創建成功
 *       400:
 *         description: 請求參數錯誤
 *       401:
 *         description: 未授權
 *       500:
 *         description: 伺服器錯誤
 */
router.post('/', authAndRefresh, createOrderReport);

/**
 * @swagger
 * /order-reports:
 *   get:
 *     summary: 獲取訂單報告列表（支援篩選、分頁、搜尋）
 *     tags: [Order Reports]
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
 *         description: 搜尋關鍵字（標題、描述）
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: 報告狀態篩選
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, title, status]
 *           default: createdAt
 *         description: 排序欄位
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: 排序方向
 *     responses:
 *       200:
 *         description: 成功獲取訂單報告列表
 *       401:
 *         description: 未授權
 *       500:
 *         description: 伺服器錯誤
 */
router.get('/', authAndRefresh, getOrderReports);

/**
 * @swagger
 * /order-reports/{id}:
 *   get:
 *     summary: 獲取單個訂單報告詳情
 *     tags: [Order Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 報告 ID
 *     responses:
 *       200:
 *         description: 成功獲取訂單報告詳情
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
 *       404:
 *         description: 報告不存在
 *       500:
 *         description: 伺服器錯誤
 */
router.get('/:id', authAndRefresh, getOrderReportById);

/**
 * @swagger
 * /order-reports/{id}/status:
 *   patch:
 *     summary: 更新訂單報告狀態
 *     tags: [Order Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 報告 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *                 description: 新狀態
 *               comment:
 *                 type: string
 *                 description: 可選的評論
 *     responses:
 *       200:
 *         description: 狀態更新成功
 *       400:
 *         description: 請求參數錯誤
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
 *       404:
 *         description: 報告不存在
 *       500:
 *         description: 伺服器錯誤
 */
router.patch('/:id/status', authAndRefresh, updateOrderReportStatus);

/**
 * @swagger
 * /order-reports/{id}:
 *   delete:
 *     summary: 刪除訂單報告
 *     tags: [Order Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 報告 ID
 *     responses:
 *       200:
 *         description: 訂單報告刪除成功
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
 *       404:
 *         description: 報告不存在
 *       500:
 *         description: 伺服器錯誤
 */
router.delete('/:id', authAndRefresh, deleteOrderReport);

export default router; 
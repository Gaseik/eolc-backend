import { Router } from 'express';
import { createModelReport, getModelReports, getModelReportById, updateModelReportStatus, deleteModelReport } from '../controllers/modelReportController';
import { authAndRefresh } from '../utils/jwt';

const router = Router();

/**
 * @swagger
 * /model-reports:
 *   post:
 *     summary: 創建模型報告
 *     tags: [Model Reports]
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
 *               - modelId
 *               - assignedTo
 *             properties:
 *               title:
 *                 type: string
 *                 description: 報告標題
 *               description:
 *                 type: string
 *                 description: 報告描述
 *               modelId:
 *                 type: string
 *                 description: 模型 ID
 *               assignedTo:
 *                 type: string
 *                 description: 指派的 regulatory 用戶 ID
 *     responses:
 *       201:
 *         description: 模型報告創建成功
 *       400:
 *         description: 請求參數錯誤
 *       401:
 *         description: 未授權
 *       500:
 *         description: 伺服器錯誤
 */
router.post('/', authAndRefresh, createModelReport);

/**
 * @swagger
 * /model-reports:
 *   get:
 *     summary: 獲取模型報告列表（支援篩選、分頁、搜尋）
 *     tags: [Model Reports]
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
 *         description: 成功獲取模型報告列表
 *       401:
 *         description: 未授權
 *       500:
 *         description: 伺服器錯誤
 */
router.get('/', authAndRefresh, getModelReports);

/**
 * @swagger
 * /model-reports/{id}:
 *   get:
 *     summary: 獲取單個模型報告詳情
 *     tags: [Model Reports]
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
 *         description: 成功獲取模型報告詳情
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
 *       404:
 *         description: 報告不存在
 *       500:
 *         description: 伺服器錯誤
 */
router.get('/:id', authAndRefresh, getModelReportById);

/**
 * @swagger
 * /model-reports/{id}/status:
 *   patch:
 *     summary: 更新模型報告狀態
 *     tags: [Model Reports]
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
router.patch('/:id/status', authAndRefresh, updateModelReportStatus);

/**
 * @swagger
 * /model-reports/{id}:
 *   delete:
 *     summary: 刪除模型報告
 *     tags: [Model Reports]
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
 *         description: 模型報告刪除成功
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
 *       404:
 *         description: 報告不存在
 *       500:
 *         description: 伺服器錯誤
 */
router.delete('/:id', authAndRefresh, deleteModelReport);

export default router; 
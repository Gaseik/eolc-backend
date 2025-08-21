import { Router } from 'express';
import { createModelReport, getModelReports, getModelReportById, updateModelReportStatus, deleteModelReport } from '../controllers/modelReportController';
import { authAndRefresh } from '../utils/jwt';

const router = Router();

/**
 * @swagger
 * /model-reports:
 *   post:
 *     summary: Create Model Report
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
 *                 description: Report title
 *               description:
 *                 type: string
 *                 description: Report description
 *               modelId:
 *                 type: string
 *                 description: Model ID
 *               assignedTo:
 *                 type: string
 *                 description: Assigned regulatory user ID
 *     responses:
 *       201:
 *         description: Model report created successfully
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', authAndRefresh, createModelReport);

/**
 * @swagger
 * /model-reports:
 *   get:
 *     summary: Get Model Reports List (with filtering, pagination, search)
 *     tags: [Model Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search keywords (title, description)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: Report status filter
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, title, status]
 *           default: createdAt
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Successfully retrieved model reports list
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
 *         description: Report ID
 *     responses:
 *       200:
 *         description: Successfully retrieved model report details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Report not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authAndRefresh, getModelReportById);

/**
 * @swagger
 * /model-reports/{id}/status:
 *   patch:
 *     summary: Update Model Report Status
 *     tags: [Model Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
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
 *                 description: New status
 *               comment:
 *                 type: string
 *                 description: Optional comment
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Report not found
 *       500:
 *         description: Server error
 */
router.patch('/:id/status', authAndRefresh, updateModelReportStatus);

/**
 * @swagger
 * /model-reports/{id}:
 *   delete:
 *     summary: Delete Model Report
 *     tags: [Model Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *     responses:
 *       200:
 *         description: Model report deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Report not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authAndRefresh, deleteModelReport);

export default router; 
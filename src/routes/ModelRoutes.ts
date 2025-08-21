import { Router } from 'express';
import * as modelController from '../controllers/modelController';
import { authAndRefresh } from '../utils/jwt';

const router = Router();

/**
 * @swagger
 * /models/approvers:
 *   get:
 *     summary: Get Available Approvers List
 *     tags: [Models]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved approvers list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: User ID
 *                       name:
 *                         type: string
 *                         description: User name
 *                       email:
 *                         type: string
 *                         description: User email
 *                       role:
 *                         type: string
 *                         description: User role
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: User does not belong to any organization
 */
router.get('/approvers', authAndRefresh, modelController.getAvailableApprovers);



/**
 * @swagger
 * /models:
 *   post:
 *     summary: Create Device Model
 *     tags: [Models]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - modelName
 *               - modelNumber
 *               - standards
 *               - classes
 *               - intendedUseCategories
 *               - approvers
 *             properties:
 *               modelName:
 *                 type: string
 *                 description: Model name
 *               modelNumber:
 *                 type: string
 *                 description: Model number
 *               description:
 *                 type: string
 *                 description: Model description
 *               quantity:
 *                 type: number
 *                 description: Quantity
 *               manufactureDate:
 *                 type: string
 *                 format: date
 *                 description: Manufacture date (YYYY-MM-DD)
 *               expirationDate:
 *                 type: string
 *                 format: date
 *                 description: Expiration date (YYYY-MM-DD)
 *               standards:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Related standards
 *               classes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Categories
 *               intendedUseCategories:
 *                 type: string
 *                 description: Intended use categories
 *               intendedUse:
 *                 type: string
 *                 description: Intended use description
 *               materialComposition:
 *                 type: object
 *                 properties:
 *                   materials:
 *                     type: array
 *                     items:
 *                       type: string
 *                   hazardousSubstances:
 *                     type: array
 *                     items:
 *                       type: string
 *               wasteManagement:
 *                 type: object
 *                 properties:
 *                   wasteStreamClassification:
 *                     type: array
 *                     items:
 *                       type: string
 *                   labellingAndPackaging:
 *                     type: array
 *                     items:
 *                       type: string
 *                   transportationAndStorage:
 *                     type: string
 *               disclaimer:
 *                 type: string
 *                 description: Disclaimer
 *               approvers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - id
 *                     - permission
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Approver ID
 *                     permission:
 *                       type: string
 *                       enum: [Full Access, Can Edit, Read Only]
 *                       description: Permission level
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *                 default: draft
 *                 description: Model status
 *     responses:
 *       201:
 *         description: Model created successfully
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
 *                     _id:
 *                       type: string
 *                     modelName:
 *                       type: string
 *                     modelNumber:
 *                       type: string
 *                     batchNumber:
 *                       type: string
 *                       description: Auto-generated batch number
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.post('/', authAndRefresh, modelController.createModel);

/**
 * @swagger
 * /models:
 *   get:
 *     summary: Get All Models (Paginated)
 *     tags: [Models]
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
 *         description: 搜尋關鍵字（模型名稱、編號、描述）
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published]
 *         description: 模型狀態篩選
 *     responses:
 *       200:
 *         description: 成功獲取模型列表
 *       401:
 *         description: 未授權
 */
router.get('/', authAndRefresh, modelController.getModels);

/**
 * @swagger
 * /models/{id}:
 *   get:
 *     summary: 獲取單一模型
 *     tags: [Models]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 模型 ID
 *     responses:
 *       200:
 *         description: 成功獲取模型
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
 *       404:
 *         description: Model not found
 */
router.get('/:id', authAndRefresh, modelController.getModelById);

/**
 * @swagger
 * /models/{id}:
 *   put:
 *     summary: 更新模型
 *     tags: [Models]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 模型 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               modelName:
 *                 type: string
 *               modelNumber:
 *                 type: string
 *               description:
 *                 type: string
 *               quantity:
 *                 type: number
 *               manufactureDate:
 *                 type: string
 *                 format: date
 *               expirationDate:
 *                 type: string
 *                 format: date
 *               standards:
 *                 type: array
 *                 items:
 *                   type: string
 *               classes:
 *                 type: array
 *                 items:
 *                   type: string
 *               intendedUseCategories:
 *                 type: string
 *               intendedUse:
 *                 type: string
 *               materialComposition:
 *                 type: object
 *               wasteManagement:
 *                 type: object
 *               disclaimer:
 *                 type: string
 *               approvers:
 *                 type: array
 *                 items:
 *                   type: object
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *     responses:
 *       200:
 *         description: 模型更新成功
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
 *       404:
 *         description: 模型不存在
 */
router.put('/:id', authAndRefresh, modelController.updateModel);

/**
 * @swagger
 * /models/{id}:
 *   delete:
 *     summary: 刪除模型
 *     tags: [Models]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 模型 ID
 *     responses:
 *       200:
 *         description: 模型刪除成功
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
 *       404:
 *         description: 模型不存在
 */
router.delete('/:id', authAndRefresh, modelController.deleteModel);

export default router; 
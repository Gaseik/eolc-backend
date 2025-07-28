import { Router } from 'express';
import * as modelController from '../controllers/modelController';
import { authAndRefresh } from '../utils/jwt';

const router = Router();

/**
 * @swagger
 * /models/approvers:
 *   get:
 *     summary: 獲取可用的審核者列表
 *     tags: [Models]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功獲取審核者列表
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
 *                         description: 用戶 ID
 *                       name:
 *                         type: string
 *                         description: 用戶姓名
 *                       email:
 *                         type: string
 *                         description: 用戶郵箱
 *                       role:
 *                         type: string
 *                         description: 用戶角色
 *       401:
 *         description: 未授權
 *       400:
 *         description: 用戶不屬於任何組織
 */
router.get('/approvers', authAndRefresh, modelController.getAvailableApprovers);



/**
 * @swagger
 * /models:
 *   post:
 *     summary: 創建設備模型
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
 *                 description: 模型名稱
 *               modelNumber:
 *                 type: string
 *                 description: 模型編號
 *               description:
 *                 type: string
 *                 description: 模型描述
 *               quantity:
 *                 type: number
 *                 description: 數量
 *               manufactureDate:
 *                 type: string
 *                 format: date
 *                 description: 製造日期 (YYYY-MM-DD)
 *               expirationDate:
 *                 type: string
 *                 format: date
 *                 description: 過期日期 (YYYY-MM-DD)
 *               standards:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 相關標準
 *               classes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 分類
 *               intendedUseCategories:
 *                 type: string
 *                 description: 預期用途類別
 *               intendedUse:
 *                 type: string
 *                 description: 預期用途描述
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
 *                 description: 免責聲明
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
 *                       description: 審核者 ID
 *                     permission:
 *                       type: string
 *                       enum: [Full Access, Can Edit, Read Only]
 *                       description: 權限級別
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *                 default: draft
 *                 description: 模型狀態
 *     responses:
 *       201:
 *         description: 模型創建成功
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
 *                       description: 自動產生的批次號
 *       400:
 *         description: 請求參數錯誤
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
 */
router.post('/', authAndRefresh, modelController.createModel);

/**
 * @swagger
 * /models:
 *   get:
 *     summary: 獲取所有模型（分頁）
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
 *         description: 模型不存在
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
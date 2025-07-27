import { Request, Response } from 'express';
import { ModelService } from '../services/ModelService';

interface RequestWithUser extends Request {
  user?: { _id: any };
}

/**
 * @swagger
 * tags:
 *   name: Models
 *   description: 產品模型管理 API
 */

/**
 * @swagger
 * /models:
 *   post:
 *     summary: 創建新的產品模型
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
 *               - manufacturingDate
 *               - expireDate
 *               - description
 *               - relevantStandard
 *               - class
 *               - intendedUse
 *               - materialBreakdown
 *             properties:
 *               modelName:
 *                 type: string
 *               modelNumber:
 *                 type: string
 *               manufacturingDate:
 *                 type: string
 *                 format: date
 *               expireDate:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *               relevantStandard:
 *                 type: string
 *                 enum: [ISO 10993, ISO 13485, ISO 14971, IEC 606901]
 *               class:
 *                 type: string
 *                 enum: [Non Invasive I, Non Invasive II A, Non Invasive II B, Invasive I, Invasive II A, Invasive II B]
 *               intendedUse:
 *                 type: string
 *               materialBreakdown:
 *                 type: string
 *               barcode:
 *                 type: string
 *               hazardousSubstances:
 *                 type: string
 *     responses:
 *       201:
 *         description: 模型創建成功
 *       400:
 *         description: 請求參數錯誤
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
 */
export const createModel = async (req: RequestWithUser, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const result = await ModelService.createModel(req.body, userId);
    res.status(201).json({
      success: true,
      data: {
        model: result.model,
        report: result.report
      }
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @swagger
 * /models:
 *   get:
 *     summary: 取得所有產品模型
 *     tags: [Models]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: 頁碼
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: 每頁數量
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜尋關鍵字
 *     responses:
 *       200:
 *         description: 成功取得模型列表
 */
export const getAllModels = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const result = await ModelService.getAllModels(+page, +limit, search as string);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @swagger
 * /models/{id}:
 *   get:
 *     summary: 根據 ID 取得產品模型
 *     tags: [Models]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功取得模型
 *       404:
 *         description: 模型不存在
 */
export const getModelById = async (req: Request, res: Response) => {
  try {
    const model = await ModelService.getModelById(req.params.id);
    if (!model) {
      return res.status(404).json({
        success: false,
        error: 'Model not found'
      });
    }

    res.json({
      success: true,
      data: model
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @swagger
 * /models/{id}:
 *   put:
 *     summary: 更新產品模型
 *     tags: [Models]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: 模型更新成功
 *       403:
 *         description: 權限不足
 *       404:
 *         description: 模型不存在
 */
export const updateModel = async (req: RequestWithUser, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const model = await ModelService.updateModel(req.params.id, req.body, userId);
    res.json({
      success: true,
      data: model
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @swagger
 * /models/{id}:
 *   delete:
 *     summary: 刪除產品模型
 *     tags: [Models]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 模型刪除成功
 *       403:
 *         description: 權限不足
 *       404:
 *         description: 模型不存在
 */
export const deleteModel = async (req: RequestWithUser, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    await ModelService.deleteModel(req.params.id, userId);
    res.json({
      success: true,
      message: 'Model deleted successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @swagger
 * /models/manufacturer/{manufacturerId}:
 *   get:
 *     summary: 取得指定製造商的產品模型
 *     tags: [Models]
 *     parameters:
 *       - in: path
 *         name: manufacturerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功取得製造商的模型列表
 */
export const getModelsByManufacturer = async (req: Request, res: Response) => {
  try {
    const models = await ModelService.getModelsByManufacturer(req.params.manufacturerId);
    res.json({
      success: true,
      data: models
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}; 
import { Request, Response } from 'express';
import { UserRole } from '../models/User';

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Role Management API
 */

/**
 * @swagger
 * /roles:
 *   get:
 *     summary: Get All Available Roles (excluding admin)
 *     tags: [Roles]
 *     responses:
 *       200:
 *         description: Successfully retrieved roles list
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
 *                       value:
 *                         type: string
 *                       label:
 *                         type: string
 *                       description:
 *                         type: string
 */
export const getRoles = async (req: Request, res: Response) => {
  try {
    // 定義角色選項，不包含 admin
    const roles = [
      {
        value: 'manufacturer',
        label: 'Manufacturer',
        description: '製造商 - 可以創建產品模型和訂單'
      },
      {
        value: 'regulator',
        label: 'Regulator', 
        description: '監管者 - 可以審核模型和報告'
      },
      {
        value: 'endUser',
        label: 'End User',
        description: '終端用戶 - 可以查看和使用產品'
      }
    ];

    res.json({
      success: true,
      data: roles
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
 * /roles/with-admin:
 *   get:
 *     summary: Get All Roles (including admin)
 *     tags: [Roles]
 *     responses:
 *       200:
 *         description: Successfully retrieved roles list
 */
export const getAllRoles = async (req: Request, res: Response) => {
  try {
    // 定義所有角色選項，包含 admin
    const roles = [
      {
        value: 'admin',
        label: 'Admin',
        description: '管理員 - 擁有所有權限'
      },
      {
        value: 'manufacturer',
        label: 'Manufacturer',
        description: '製造商 - 可以創建產品模型和訂單'
      },
      {
        value: 'regulator',
        label: 'Regulator', 
        description: '監管者 - 可以審核模型和報告'
      },
      {
        value: 'endUser',
        label: 'End User',
        description: '終端用戶 - 可以查看和使用產品'
      }
    ];

    res.json({
      success: true,
      data: roles
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}; 
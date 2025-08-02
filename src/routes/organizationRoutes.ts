import { Router } from 'express';
import * as organizationController from '../controllers/organizationController';
import { authAndRefresh } from '../utils/jwt';

const router = Router();

/**
 * @swagger
 * /organizations:
 *   get:
 *     summary: 取得組織列表
 *     tags: [Organizations]
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
 *         description: 每頁筆數
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜尋關鍵字
 *     responses:
 *       200:
 *         description: 組織列表
 */
router.get('/', authAndRefresh, organizationController.getOrganizations);

/**
 * @swagger
 * /organizations/{id}:
 *   get:
 *     summary: 取得單一組織
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 組織 ID
 *     responses:
 *       200:
 *         description: 組織資料
 *       401:
 *         description: 未授權
 *       404:
 *         description: 找不到組織
 */
/**
 * @swagger
 * /organizations/end-users:
 *   get:
 *     summary: 獲取所有終端用戶公司
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功獲取公司列表
 *       401:
 *         description: 未授權
 */
router.get('/end-users', authAndRefresh, organizationController.getAllEndUserCompanies);

/**
 * @swagger
 * /organizations/my:
 *   get:
 *     summary: 取得當前用戶的組織資訊
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 組織資料
 *       401:
 *         description: 未授權
 *       404:
 *         description: 找不到組織或用戶不屬於任何組織
 */
router.get('/my', authAndRefresh, organizationController.getMyOrganization);

router.get('/:id', authAndRefresh, organizationController.getOrganizationById);



/**
 * @swagger
 * /organizations/{id}:
 *   put:
 *     summary: 更新組織
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 組織 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 組織名稱
 *               address:
 *                 type: string
 *                 description: 組織地址（選填）
 *               taxId:
 *                 type: string
 *                 description: 稅號（選填）
 *               email:
 *                 type: string
 *                 description: 組織聯絡郵箱（選填）
 *               contactPhone:
 *                 type: string
 *                 description: 組織聯絡電話（選填）
 *               website:
 *                 type: string
 *                 description: 組織網站（選填）
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 description: 組織狀態
 *     responses:
 *       200:
 *         description: 更新成功
 *       401:
 *         description: 未授權
 *       404:
 *         description: 找不到組織
 */
router.put('/:id', authAndRefresh, organizationController.updateOrganization);

/**
 * @swagger
 * /organizations/{id}:
 *   delete:
 *     summary: 刪除組織
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 組織 ID
 *     responses:
 *       204:
 *         description: 刪除成功
 *       401:
 *         description: 未授權
 *       404:
 *         description: 找不到組織
 */
router.delete('/:id', authAndRefresh, organizationController.deleteOrganization);

/**
 * @swagger
 * /organizations/{id}/invite:
 *   post:
 *     summary: 邀請成員加入組織
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 組織 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: 邀請已送出
 *       401:
 *         description: 未授權
 *       404:
 *         description: 找不到組織
 */
router.post('/:id/invite', authAndRefresh, organizationController.inviteMember);

/**
 * @swagger
 * /organizations/{id}/invitations:
 *   get:
 *     summary: 查詢組織邀請列表
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 組織 ID
 *     responses:
 *       200:
 *         description: 邀請列表
 *       404:
 *         description: 找不到組織
 */
router.get('/:id/invitations', organizationController.getInvitations);

/**
 * @swagger
 * /organizations/{id}/accept-invitation:
 *   post:
 *     summary: 接受組織邀請
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 組織 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: 已加入組織
 *       404:
 *         description: 找不到組織或邀請
 */
router.post('/:id/accept-invitation', organizationController.acceptInvitation);

/**
 * @swagger
 * /organizations/{id}/members:
 *   get:
 *     summary: 查詢組織成員列表
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 組織 ID
 *     responses:
 *       200:
 *         description: 成員列表
 *       404:
 *         description: 找不到組織
 */
router.get('/:id/members', organizationController.getMembers);

/**
 * @swagger
 * /organizations/{id}/members/{userId}:
 *   delete:
 *     summary: 移除組織成員
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 組織 ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: 使用者 ID
 *     responses:
 *       200:
 *         description: 已移除成員
 *       404:
 *         description: 找不到組織或成員
 */
router.delete('/:id/members/:userId', organizationController.removeMember);

/**
 * @swagger
 * /organizations/{id}/members/{userId}/role:
 *   put:
 *     summary: 變更組織成員角色
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 組織 ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: 使用者 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orgRole:
 *                 type: string
 *                 enum: [admin, member]
 *     responses:
 *       200:
 *         description: 角色已更新
 *       404:
 *         description: 找不到組織或成員
 */
router.put('/:id/members/:userId/role', organizationController.updateMemberRole);

export default router; 
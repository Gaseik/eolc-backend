import express from 'express';
import {
  getRoles,
  getAllRoles
} from '../controllers/roleController';

const router = express.Router();

// 公開路由
router.get('/', getRoles);
router.get('/with-admin', getAllRoles);

export default router; 
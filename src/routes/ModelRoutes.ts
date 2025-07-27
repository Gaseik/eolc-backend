import express from 'express';
import {
  createModel,
  getAllModels,
  getModelById,
  updateModel,
  deleteModel,
  getModelsByManufacturer
} from '../controllers/modelController';
import { authAndRefresh } from '../utils/jwt';

const router = express.Router();

// 公開路由
router.get('/', getAllModels);
router.get('/:id', getModelById);
router.get('/manufacturer/:manufacturerId', getModelsByManufacturer);

// 需要認證的路由
router.post('/', authAndRefresh, createModel);
router.put('/:id', authAndRefresh, updateModel);
router.delete('/:id', authAndRefresh, deleteModel);

export default router; 
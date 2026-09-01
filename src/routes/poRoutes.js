import express from 'express';
import { getCreatePO, createPO, listPOs } from '../controllers/poController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/po/create', verifyToken, getCreatePO);
router.post('/po/create', verifyToken, createPO);
router.get('/po/list', verifyToken, listPOs);  // Fixed: changed to /po/list

export default router;
import express from 'express';
import { approveInvoice, rejectInvoice } from '../controllers/approvalController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/invoice/:id/approve', verifyToken, approveInvoice);
router.post('/invoice/:id/reject', verifyToken, rejectInvoice);

export default router;
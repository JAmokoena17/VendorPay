import express from 'express';
import {
    getCreateInvoice,
    createInvoice,
    listInvoices
} from '../controllers/invoiceController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/create', verifyToken, getCreateInvoice);
router.post('/create', verifyToken, createInvoice);
router.get('/list', verifyToken, listInvoices);

export default router;
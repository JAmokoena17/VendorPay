import express from 'express';
import {
  getLogin,
  getRegister,
  postLogin,
  postRegister,
  logout
} from '../controllers/authController.js';

const router = express.Router();

router.get('/login', getLogin);
router.get('/register', getRegister);
router.post('/login', postLogin);
router.post('/register', postRegister);
router.get('/logout', logout);

export default router;
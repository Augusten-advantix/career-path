import express from 'express';
import { register, login, createAdmin } from '../controllers/authController';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/create-admin', createAdmin);

export default router;

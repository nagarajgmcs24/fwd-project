
import express from 'express';
import * as authController from '../controllers/authController';

const router = express.Router();

router.post('/signup', authController.signup as any);
router.post('/login', authController.login as any);

export default router;

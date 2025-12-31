
import express from 'express';
import * as reportController from '../controllers/reportController';

const router = express.Router();

router.post('/', reportController.submitReport as any);
router.get('/', reportController.getReports as any);
router.patch('/:id/verify', reportController.verifyReport as any);

export default router;

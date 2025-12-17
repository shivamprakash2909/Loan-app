import express from 'express';
const router = express.Router();
import * as paymentController from '../controllers/paymentController.js';
import { paymentValidationRules, accountNumberValidationRules } from '../middleware/validator.js';

router.post('/payments', paymentValidationRules, paymentController.createPayment);
router.get('/payments/:account_number', accountNumberValidationRules, paymentController.getPaymentHistory);

export default router;
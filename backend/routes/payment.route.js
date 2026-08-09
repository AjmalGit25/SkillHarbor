import express from 'express';
import { orderData, stripeWebhook } from '../controllers/payment.controller.js';
import userMiddleware from '../middlewares/user.mid.js';

const router = express.Router();

router.post('/', userMiddleware, orderData);

// Stripe requires the raw body to validate webhook signatures
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

export default router;
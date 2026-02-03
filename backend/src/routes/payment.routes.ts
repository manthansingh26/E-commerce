import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

const paymentController = new PaymentController();

// All payment routes require authentication
router.use(authMiddleware.authenticate);

// Create Razorpay order
router.post('/razorpay/create-order', paymentController.createRazorpayOrder);

// Verify Razorpay payment
router.post('/razorpay/verify', paymentController.verifyRazorpayPayment);

// Get Razorpay key
router.get('/razorpay/key', paymentController.getRazorpayKey);

export default router;

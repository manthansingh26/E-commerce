import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { razorpayService } from '../services/razorpay.service';

export class PaymentController {
  /**
   * Create Razorpay order
   */
  createRazorpayOrder = async (req: AuthRequest, res: Response) => {
    try {
      const { amount, currency, receipt } = req.body;

      console.log('💳 Creating Razorpay order:', { amount, currency, receipt });

      if (!amount || amount <= 0) {
        res.status(400).json({
          success: false,
          message: 'Invalid amount',
        });
        return;
      }

      const order = await razorpayService.createOrder(amount, currency || 'INR', receipt);

      console.log('✅ Razorpay order created:', order.id);

      res.status(201).json({
        success: true,
        data: {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          keyId: razorpayService.getKeyId(),
        },
      });
    } catch (error: any) {
      console.error('❌ Create Razorpay order error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create payment order',
      });
    }
  };

  /**
   * Verify Razorpay payment
   */
  verifyRazorpayPayment = async (req: AuthRequest, res: Response) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      console.log('🔍 Verifying Razorpay payment:', razorpay_payment_id);

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        res.status(400).json({
          success: false,
          message: 'Missing payment verification parameters',
        });
        return;
      }

      const isValid = razorpayService.verifyPaymentSignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      );

      if (isValid) {
        console.log('✅ Payment verified successfully');
        res.status(200).json({
          success: true,
          message: 'Payment verified successfully',
          data: {
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
          },
        });
      } else {
        console.log('❌ Payment verification failed');
        res.status(400).json({
          success: false,
          message: 'Payment verification failed',
        });
      }
    } catch (error: any) {
      console.error('❌ Verify payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify payment',
      });
    }
  };

  /**
   * Get Razorpay Key ID
   */
  getRazorpayKey = async (_req: AuthRequest, res: Response) => {
    try {
      res.status(200).json({
        success: true,
        data: {
          keyId: razorpayService.getKeyId(),
        },
      });
    } catch (error: any) {
      console.error('❌ Get Razorpay key error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get Razorpay key',
      });
    }
  };
}

import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpayKeyId = process.env.RAZORPAY_KEY_ID || '';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || '';

// Initialize Razorpay instance
export const razorpayInstance = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret,
});

export class RazorpayService {
  /**
   * Create a Razorpay order
   */
  async createOrder(amount: number, currency: string = 'INR', receipt: string) {
    try {
      const options = {
        amount: Math.round(amount * 100), // Amount in paise (multiply by 100)
        currency,
        receipt,
        payment_capture: 1, // Auto capture payment
      };

      const order = await razorpayInstance.orders.create(options);
      return order;
    } catch (error: any) {
      console.error('Razorpay create order error:', error);
      throw new Error(`Failed to create Razorpay order: ${error.message}`);
    }
  }

  /**
   * Verify Razorpay payment signature
   */
  verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): boolean {
    try {
      const text = `${orderId}|${paymentId}`;
      const generated_signature = crypto
        .createHmac('sha256', razorpayKeySecret)
        .update(text)
        .digest('hex');

      return generated_signature === signature;
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }

  /**
   * Get Razorpay Key ID for frontend
   */
  getKeyId(): string {
    return razorpayKeyId;
  }
}

export const razorpayService = new RazorpayService();

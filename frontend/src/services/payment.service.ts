import api from '@/lib/api';

export interface RazorpayOrder {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export const paymentService = {
  async createRazorpayOrder(amount: number, receipt: string): Promise<RazorpayOrder> {
    const response = await api.post('/api/payments/razorpay/create-order', {
      amount,
      currency: 'INR',
      receipt,
    });
    return response.data.data;
  },

  async verifyRazorpayPayment(
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string
  ): Promise<boolean> {
    const response = await api.post('/api/payments/razorpay/verify', {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });
    return response.data.success;
  },

  async getRazorpayKey(): Promise<string> {
    const response = await api.get('/api/payments/razorpay/key');
    return response.data.data.keyId;
  },
};

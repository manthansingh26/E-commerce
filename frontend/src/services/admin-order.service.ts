import api from '@/lib/api';

export interface AdminOrder {
  id: string;
  userId: string;
  orderNumber: string;
  status: 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  shippingFullName: string;
  shippingEmail: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZipCode: string;
  shippingCountry: string;
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  items: AdminOrderItem[];
}

export interface AdminOrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage: string;
  productCategory: string;
  quantity: number;
  price: number;
  subtotal: number;
  createdAt: string;
}

export const adminOrderService = {
  async getAllOrders(): Promise<AdminOrder[]> {
    const response = await api.get('/api/admin/orders');
    return response.data.data;
  },

  async getOrderById(orderId: string): Promise<AdminOrder> {
    const response = await api.get(`/api/admin/orders/${orderId}`);
    return response.data.data;
  },

  async updateOrderStatus(orderId: string, status: string): Promise<AdminOrder> {
    const response = await api.patch(`/api/admin/orders/${orderId}/status`, { status });
    return response.data.data;
  },

  async getOrderStats(): Promise<any> {
    const response = await api.get('/api/admin/orders/stats');
    return response.data.data;
  }
};

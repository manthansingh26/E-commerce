import api from '@/lib/api';

export interface CreateOrderRequest {
  items: {
    productId: string;
    productName: string;
    productImage: string;
    productCategory: string;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  shippingInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentInfo: {
    method: string;
  };
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  status: 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
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
  items: OrderItem[];
}

export interface OrderItem {
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

export const orderService = {
  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    console.log('📡 orderService.createOrder called');
    console.log('API base URL:', api.defaults.baseURL);
    console.log('Request data:', orderData);
    
    try {
      const response = await api.post('/api/orders', orderData);
      console.log('✅ API response:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ API error:', error);
      throw error;
    }
  },

  async getUserOrders(): Promise<Order[]> {
    const response = await api.get('/api/orders');
    return response.data.data;
  },

  async getOrderById(orderId: string): Promise<Order> {
    const response = await api.get(`/api/orders/${orderId}`);
    return response.data.data;
  },

  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    const response = await api.patch(`/api/orders/${orderId}/status`, { status });
    return response.data.data;
  },

  async cancelOrder(orderId: string): Promise<Order> {
    const response = await api.patch(`/api/orders/${orderId}/cancel`);
    return response.data.data;
  },

  async returnOrder(orderId: string, reason: string, comments?: string): Promise<Order> {
    console.log('📡 orderService.returnOrder called');
    console.log('Order ID:', orderId);
    console.log('Reason:', reason);
    console.log('Comments:', comments);
    
    try {
      const response = await api.patch(`/api/orders/${orderId}/return`, { reason, comments });
      console.log('✅ Return API response:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Return API error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  }
};

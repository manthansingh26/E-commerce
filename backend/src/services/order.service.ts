import { OrderRepository } from '../repositories/order.repository';
import { CreateOrderDTO, OrderWithItems } from '../models/order.model';

export class OrderService {
  constructor(private orderRepository: OrderRepository) {}

  async createOrder(userId: string, orderData: CreateOrderDTO): Promise<OrderWithItems> {
    // Validate order data
    if (!orderData.items || orderData.items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    if (orderData.total <= 0) {
      throw new Error('Order total must be greater than zero');
    }

    // Create order
    const order = await this.orderRepository.createOrder(userId, orderData);

    return order;
  }

  async getUserOrders(userId: string): Promise<OrderWithItems[]> {
    return await this.orderRepository.getOrdersByUserId(userId);
  }

  async getOrderById(orderId: string, userId: string): Promise<OrderWithItems | null> {
    return await this.orderRepository.getOrderById(orderId, userId);
  }

  async updateOrderStatus(orderId: string, status: string) {
    const validStatuses = ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned'];
    
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid order status');
    }

    return await this.orderRepository.updateOrderStatus(orderId, status);
  }
}

import { Response } from 'express';
import { OrderService } from '../services/order.service';
import { OrderRepository } from '../repositories/order.repository';
import { NotificationService } from '../services/notification.service';
import { AuthRequest } from '../middleware/auth.middleware';

export class AdminOrderController {
  private notificationService: NotificationService;

  constructor(
    private orderService: OrderService,
    private orderRepository: OrderRepository
  ) {
    this.notificationService = new NotificationService();
  }

  getAllOrders = async (_req: AuthRequest, res: Response) => {
    try {
      console.log('📋 Admin: Fetching all orders');
      
      // In production, check if user has admin role here
      // if (!req.user!.isAdmin) {
      //   return res.status(403).json({
      //     success: false,
      //     message: 'Access denied. Admin privileges required.'
      //   });
      // }

      const orders = await this.orderRepository.getAllOrders();

      console.log(`✅ Admin: Retrieved ${orders.length} orders`);
      res.status(200).json({
        success: true,
        data: orders
      });
    } catch (error: any) {
      console.error('❌ Admin: Get all orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch orders'
      });
    }
  };

  getOrderById = async (req: AuthRequest, res: Response) => {
    try {
      const orderId = req.params.orderId as string;
      console.log('📋 Admin: Fetching order:', orderId);

      // In production, check if user has admin role here

      const order = await this.orderRepository.getOrderByIdAdmin(orderId);

      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Order not found'
        });
        return;
      }

      console.log('✅ Admin: Order retrieved:', order.orderNumber);
      res.status(200).json({
        success: true,
        data: order
      });
    } catch (error: any) {
      console.error('❌ Admin: Get order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch order'
      });
    }
  };

  updateOrderStatus = async (req: AuthRequest, res: Response) => {
    try {
      const orderId = req.params.orderId as string;
      const { status } = req.body;

      console.log('📝 Admin: Updating order status:', orderId, 'to', status);

      // In production, check if user has admin role here

      // Get current order before update to track old status
      const currentOrder = await this.orderRepository.getOrderByIdAdmin(orderId);
      const oldStatus = currentOrder?.status || 'unknown';

      const order = await this.orderService.updateOrderStatus(orderId, status);

      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Order not found'
        });
        return;
      }

      console.log('✅ Admin: Order status updated:', order.orderNumber, 'to', status);

      // Get full order with items for notification
      const fullOrder = await this.orderRepository.getOrderByIdAdmin(orderId);

      // Send status update notifications to customer
      if (fullOrder) {
        try {
          await this.notificationService.sendOrderStatusUpdateEmail(fullOrder, oldStatus);
          await this.notificationService.sendOrderSMS(
            fullOrder.shippingPhone,
            fullOrder.orderNumber,
            status
          );
        } catch (notifError) {
          console.error('⚠️ Failed to send notifications:', notifError);
        }
      }

      res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
        data: order
      });
    } catch (error: any) {
      console.error('❌ Admin: Update order status error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update order status'
      });
    }
  };

  getOrderStats = async (_req: AuthRequest, res: Response) => {
    try {
      console.log('📊 Admin: Fetching order statistics');

      // In production, check if user has admin role here

      const stats = await this.orderRepository.getOrderStats();

      console.log('✅ Admin: Statistics retrieved');
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      console.error('❌ Admin: Get stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch statistics'
      });
    }
  };
}

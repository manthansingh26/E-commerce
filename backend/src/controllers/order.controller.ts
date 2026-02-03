import { Response } from 'express';
import { OrderService } from '../services/order.service';
import { NotificationService } from '../services/notification.service';
import { AuthRequest } from '../middleware/auth.middleware';

export class OrderController {
  private notificationService: NotificationService;

  constructor(private orderService: OrderService) {
    this.notificationService = new NotificationService();
  }

  createOrder = async (req: AuthRequest, res: Response) => {
    try {
      console.log('📦 Order creation request received');
      console.log('User ID:', req.user!.userId);
      console.log('Order data:', JSON.stringify(req.body, null, 2));
      
      const userId = req.user!.userId;
      const orderData = req.body;

      const order = await this.orderService.createOrder(userId, orderData);

      console.log('✅ Order created successfully:', order.orderNumber);

      // Send order confirmation email and SMS
      try {
        await this.notificationService.sendOrderConfirmationEmail(order);
        await this.notificationService.sendOrderSMS(
          order.shippingPhone,
          order.orderNumber,
          'placed'
        );
      } catch (notifError) {
        console.error('⚠️ Failed to send notifications:', notifError);
        // Don't fail the order creation if notifications fail
      }

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: order
      });
    } catch (error: any) {
      console.error('❌ Create order error:', error);
      console.error('Error stack:', error.stack);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create order'
      });
    }
  };

  getUserOrders = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.userId;

      const orders = await this.orderService.getUserOrders(userId);

      res.status(200).json({
        success: true,
        data: orders
      });
    } catch (error: any) {
      console.error('Get user orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch orders'
      });
    }
  };

  getOrderById = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const orderId = req.params.orderId as string;

      const order = await this.orderService.getOrderById(orderId, userId);

      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Order not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: order
      });
    } catch (error: any) {
      console.error('Get order error:', error);
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

      // Get current order to check old status
      const currentOrder = await this.orderService.getOrderById(orderId, req.user!.userId);
      const oldStatus = currentOrder?.status || 'unknown';

      const order = await this.orderService.updateOrderStatus(orderId, status);

      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Order not found'
        });
        return;
      }

      // Get full order with items for notification
      const fullOrder = await this.orderService.getOrderById(orderId, req.user!.userId);

      // Send status update notifications
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
      console.error('Update order status error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update order status'
      });
    }
  };

  cancelOrder = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const orderId = req.params.orderId as string;

      console.log('🚫 User cancelling order:', orderId);

      // Get the order first to check ownership and status
      const order = await this.orderService.getOrderById(orderId, userId);

      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Order not found'
        });
        return;
      }

      // Check if order can be cancelled
      if (order.status === 'shipped' || order.status === 'delivered') {
        res.status(400).json({
          success: false,
          message: 'Cannot cancel order that has been shipped or delivered'
        });
        return;
      }

      if (order.status === 'cancelled') {
        res.status(400).json({
          success: false,
          message: 'Order is already cancelled'
        });
        return;
      }

      // Cancel the order
      const cancelledOrder = await this.orderService.updateOrderStatus(orderId, 'cancelled');

      if (!cancelledOrder) {
        res.status(500).json({
          success: false,
          message: 'Failed to cancel order'
        });
        return;
      }

      console.log('✅ Order cancelled:', orderId);

      // Get full order with items for notification
      const fullOrder = await this.orderService.getOrderById(orderId, userId);

      // Send cancellation notification
      if (fullOrder) {
        try {
          await this.notificationService.sendOrderStatusUpdateEmail(fullOrder, order.status);
          await this.notificationService.sendOrderSMS(
            fullOrder.shippingPhone,
            fullOrder.orderNumber,
            'cancelled'
          );
        } catch (notifError) {
          console.error('⚠️ Failed to send notifications:', notifError);
        }
      }

      res.status(200).json({
        success: true,
        message: 'Order cancelled successfully',
        data: cancelledOrder
      });
    } catch (error: any) {
      console.error('❌ Cancel order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel order'
      });
    }
  };

  returnOrder = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const orderId = req.params.orderId as string;
      const { reason, comments } = req.body;

      console.log('🔄 User requesting return for order:', orderId);

      // Get the order first to check ownership and status
      const order = await this.orderService.getOrderById(orderId, userId);

      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Order not found'
        });
        return;
      }

      // Check if order can be returned (only delivered orders within 7 days)
      if (order.status !== 'delivered') {
        res.status(400).json({
          success: false,
          message: 'Only delivered orders can be returned'
        });
        return;
      }

      // Check if order is within return window (7 days)
      const deliveryDate = new Date(order.updatedAt);
      const currentDate = new Date();
      const daysSinceDelivery = Math.floor((currentDate.getTime() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysSinceDelivery > 7) {
        res.status(400).json({
          success: false,
          message: 'Return window has expired. Orders can only be returned within 7 days of delivery'
        });
        return;
      }

      // Update order status to 'returned' (we'll need to add this status)
      // For now, we'll use 'cancelled' with a note
      const returnedOrder = await this.orderService.updateOrderStatus(orderId, 'returned');

      if (!returnedOrder) {
        res.status(500).json({
          success: false,
          message: 'Failed to update order status'
        });
        return;
      }

      console.log('✅ Return request processed:', orderId);
      console.log('Return reason:', reason);
      console.log('Comments:', comments);

      // Get full order with items for notification
      const fullOrder = await this.orderService.getOrderById(orderId, userId);

      // Send return confirmation notification
      if (fullOrder) {
        try {
          await this.notificationService.sendOrderStatusUpdateEmail(fullOrder, order.status);
          await this.notificationService.sendOrderSMS(
            fullOrder.shippingPhone,
            fullOrder.orderNumber,
            'return requested'
          );
        } catch (notifError) {
          console.error('⚠️ Failed to send notifications:', notifError);
        }
      }

      res.status(200).json({
        success: true,
        message: 'Return request submitted successfully. Refund will be processed within 5-7 business days.',
        data: returnedOrder
      });
    } catch (error: any) {
      console.error('❌ Return order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process return request'
      });
    }
  };
}

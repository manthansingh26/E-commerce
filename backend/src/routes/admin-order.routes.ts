import { Router } from 'express';
import { AdminOrderController } from '../controllers/admin-order.controller';
import { OrderService } from '../services/order.service';
import { OrderRepository } from '../repositories/order.repository';
import { authMiddleware } from '../middleware/auth.middleware';
import { pool } from '../config/database';

const router = Router();

// Initialize dependencies
const orderRepository = new OrderRepository(pool);
const orderService = new OrderService(orderRepository);
const adminOrderController = new AdminOrderController(orderService, orderRepository);

// All admin routes require authentication
// In production, add admin role check middleware here
router.use(authMiddleware.authenticate);

// Get order statistics (must be before /:orderId to avoid conflict)
router.get('/stats', adminOrderController.getOrderStats);

// Get all orders (admin only)
router.get('/', adminOrderController.getAllOrders);

// Update order status (admin only) - must be before /:orderId
router.patch('/:orderId/status', adminOrderController.updateOrderStatus);

// Get specific order by ID (admin only) - must be last
router.get('/:orderId', adminOrderController.getOrderById);

export default router;

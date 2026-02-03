import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { OrderService } from '../services/order.service';
import { OrderRepository } from '../repositories/order.repository';
import { authMiddleware } from '../middleware/auth.middleware';
import { pool } from '../config/database';

const router = Router();

// Initialize dependencies
const orderRepository = new OrderRepository(pool);
const orderService = new OrderService(orderRepository);
const orderController = new OrderController(orderService);

// All order routes require authentication
router.use(authMiddleware.authenticate);

// Create new order
router.post('/', orderController.createOrder);

// Get all orders for current user
router.get('/', orderController.getUserOrders);

// Get specific order by ID
router.get('/:orderId', orderController.getOrderById);

// Cancel order (user can cancel their own order)
router.patch('/:orderId/cancel', orderController.cancelOrder);

// Return order (user can return delivered orders)
router.patch('/:orderId/return', orderController.returnOrder);

// Update order status (admin only in production)
router.patch('/:orderId/status', orderController.updateOrderStatus);

export default router;

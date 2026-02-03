import express, { Application, Request, Response, NextFunction } from 'express';
import { corsMiddleware } from './middleware/cors.middleware';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import orderRoutes from './routes/order.routes';
import adminOrderRoutes from './routes/admin-order.routes';
import paymentRoutes from './routes/payment.routes';

/**
 * Express Application Configuration
 * Requirements: 14.1-14.3
 * 
 * Configures Express app with:
 * - CORS middleware
 * - Body parser middleware
 * - Route handlers
 * - Centralized error handling
 */

/**
 * Create and configure Express application
 */
export function createApp(): Application {
  const app: Application = express();

  // ===== Middleware Configuration =====

  /**
   * CORS Middleware
   * Requirements: 14.1-14.3
   * Restricts cross-origin requests to authorized frontend only
   */
  app.use(corsMiddleware);

  /**
   * Body Parser Middleware
   * Parse incoming JSON and URL-encoded request bodies
   */
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ===== Route Handlers =====

  /**
   * Health check endpoint
   * Used for monitoring and load balancer health checks
   */
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ 
      status: 'ok', 
      message: 'AuraExpress Authentication API is running',
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Mount authentication routes
   * Requirements: 1.1-6.6, 13.1-13.3
   * Base path: /api/auth
   */
  app.use('/api/auth', authRoutes);

  /**
   * Mount user routes
   * Requirements: 7.1-7.4, 8.1-10.5
   * Base path: /api/users
   */
  app.use('/api/users', userRoutes);

  /**
   * Mount order routes
   * Base path: /api/orders
   */
  app.use('/api/orders', orderRoutes);

  /**
   * Mount admin order routes
   * Base path: /api/admin/orders
   */
  app.use('/api/admin/orders', adminOrderRoutes);

  /**
   * Mount payment routes
   * Base path: /api/payments
   */
  app.use('/api/payments', paymentRoutes);

  // ===== Error Handling =====

  /**
   * 404 Not Found Handler
   * Catches requests to undefined routes
   */
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      error: {
        message: 'Not found',
        code: 'NOT_FOUND',
        details: 'The requested resource was not found'
      }
    });
  });

  /**
   * Centralized Error Handler
   * Catches all errors thrown in the application
   * Provides consistent error response format
   */
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    // Log error for debugging (in production, use proper logging service)
    console.error('Error:', err);

    // Handle CORS errors
    if (err.message === 'Not allowed by CORS') {
      res.status(403).json({
        error: {
          message: 'Access denied',
          code: 'FORBIDDEN',
          details: 'Cross-origin request from unauthorized origin'
        }
      });
      return;
    }

    // Handle validation errors from express-validator
    if (err.type === 'entity.parse.failed') {
      res.status(400).json({
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: 'Invalid JSON in request body'
        }
      });
      return;
    }

    // Default error response
    const statusCode = err.statusCode || err.status || 500;
    res.status(statusCode).json({
      error: {
        message: err.message || 'Internal server error',
        code: err.code || 'INTERNAL_ERROR',
        details: err.details || 'An unexpected error occurred'
      }
    });
  });

  return app;
}

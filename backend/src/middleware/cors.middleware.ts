import cors, { CorsOptions } from 'cors';
import { config } from '../config/env';

/**
 * CORS Middleware Configuration
 * Requirements: 14.1, 14.2, 14.3
 * 
 * Restricts cross-origin requests to only the authorized frontend origin
 * Configures credentials, methods, and headers for secure communication
 */

/**
 * CORS configuration options
 * 
 * Requirements:
 * - 14.1: Check if origin matches configured frontend origin
 * - 14.2: Allow requests from configured origin with appropriate headers
 * - 14.3: Reject requests from unauthorized origins
 */
const corsOptions: CorsOptions = {
  /**
   * Origin validation function
   * Checks if the request origin matches the configured frontend URL
   */
  origin: (origin, callback) => {
    const allowedOrigin = config.frontend.url;
    
    // Allow requests with no origin (like mobile apps, Postman, or same-origin requests)
    if (!origin) {
      callback(null, true);
      return;
    }
    
    // In development, allow localhost on any port
    if (config.server.nodeEnv === 'development' && origin.startsWith('http://localhost:')) {
      callback(null, true);
      return;
    }
    
    // Requirement 14.1, 14.2: Check if origin matches configured frontend origin
    if (origin === allowedOrigin) {
      callback(null, true);
    } else {
      // Requirement 14.3: Reject requests from unauthorized origins
      console.log('CORS blocked origin:', origin, 'Expected:', allowedOrigin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  
  /**
   * Allow credentials (cookies, authorization headers) to be sent
   * Required for JWT token authentication
   */
  credentials: true,
  
  /**
   * Allowed HTTP methods
   */
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  
  /**
   * Allowed headers
   */
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept'
  ],
  
  /**
   * Expose headers to the client
   */
  exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'],
  
  /**
   * Preflight request cache duration (in seconds)
   */
  maxAge: 86400, // 24 hours
};

/**
 * CORS middleware instance
 * Apply this middleware to the Express app to enable CORS with the configured options
 */
export const corsMiddleware = cors(corsOptions);

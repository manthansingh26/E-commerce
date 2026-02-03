import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../services/token.service';

/**
 * Extended Request interface with user information
 * Used by authentication middleware to attach user data to requests
 */
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

/**
 * JWT Authentication Middleware
 * Requirements: 7.1, 7.2, 7.3, 7.4
 * 
 * Extracts and verifies JWT token from Authorization header
 * Attaches user information to request object for downstream handlers
 * Handles missing, expired, and invalid tokens
 */
export class AuthMiddleware {
  private tokenService: TokenService;

  constructor() {
    this.tokenService = new TokenService();
  }

  /**
   * Middleware function to verify JWT token
   * 
   * Requirements:
   * - 7.1: Valid tokens grant access to protected endpoints
   * - 7.2: Expired tokens are rejected
   * - 7.3: Invalid/malformed tokens are rejected
   * - 7.4: Missing tokens are rejected
   */
  authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;

      // Requirement 7.4: Handle missing token
      if (!authHeader) {
        res.status(401).json({
          error: {
            message: 'Authentication failed',
            code: 'AUTH_ERROR',
            details: 'No authorization token provided'
          }
        });
        return;
      }

      // Check for Bearer token format
      if (!authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          error: {
            message: 'Authentication failed',
            code: 'AUTH_ERROR',
            details: 'Invalid authorization header format. Expected: Bearer <token>'
          }
        });
        return;
      }

      // Extract token (remove "Bearer " prefix)
      const token = authHeader.substring(7);

      if (!token) {
        res.status(401).json({
          error: {
            message: 'Authentication failed',
            code: 'AUTH_ERROR',
            details: 'No token provided'
          }
        });
        return;
      }

      // Requirement 7.1, 7.2, 7.3: Verify token using TokenService
      const payload = this.tokenService.verifyToken(token);

      // Attach user info to request object
      req.user = {
        userId: payload.userId,
        email: payload.email
      };

      // Continue to next middleware/handler
      next();
    } catch (error: any) {
      // Handle token verification errors
      if (error.name === 'TokenExpiredError') {
        // Requirement 7.2: Handle expired tokens
        res.status(401).json({
          error: {
            message: 'Authentication failed',
            code: 'AUTH_ERROR',
            details: 'Token has expired'
          }
        });
        return;
      }

      if (error.name === 'JsonWebTokenError') {
        // Requirement 7.3: Handle invalid/malformed tokens
        res.status(401).json({
          error: {
            message: 'Authentication failed',
            code: 'AUTH_ERROR',
            details: 'Invalid token'
          }
        });
        return;
      }

      // Handle other unexpected errors
      res.status(401).json({
        error: {
          message: 'Authentication failed',
          code: 'AUTH_ERROR',
          details: 'Token verification failed'
        }
      });
    }
  };
}

// Export singleton instance
export const authMiddleware = new AuthMiddleware();

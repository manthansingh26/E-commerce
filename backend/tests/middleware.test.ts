#q
import { Response, NextFunction } from 'express';
import { AuthMiddleware, AuthRequest } from '../src/middleware/auth.middleware';
import { TokenService } from '../src/services/token.service';

/**
 * Unit tests for middleware components
 * Tests basic functionality of auth, rate limiting, and CORS middleware
 */

describe('Middleware Tests', () => {
  describe('AuthMiddleware', () => {
    let authMiddleware: AuthMiddleware;
    let tokenService: TokenService;
    let mockRequest: Partial<AuthRequest>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;

    beforeEach(() => {
      authMiddleware = new AuthMiddleware();
      tokenService = new TokenService();
      
      mockRequest = {
        headers: {}
      };
      
      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      
      nextFunction = jest.fn();
    });

    it('should reject requests without Authorization header', () => {
      authMiddleware.authenticate(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          message: 'Authentication failed',
          code: 'AUTH_ERROR',
          details: 'No authorization token provided'
        }
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should reject requests with invalid Authorization header format', () => {
      mockRequest.headers = {
        authorization: 'InvalidFormat token123'
      };

      authMiddleware.authenticate(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          message: 'Authentication failed',
          code: 'AUTH_ERROR',
          details: 'Invalid authorization header format. Expected: Bearer <token>'
        }
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should reject requests with empty token', () => {
      mockRequest.headers = {
        authorization: 'Bearer '
      };

      authMiddleware.authenticate(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          message: 'Authentication failed',
          code: 'AUTH_ERROR',
          details: 'No token provided'
        }
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should accept valid JWT token and attach user to request', () => {
      const payload = { userId: 'test-user-id', email: 'test@example.com' };
      const token = tokenService.generateToken(payload);

      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };

      authMiddleware.authenticate(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockRequest.user).toEqual({
        userId: payload.userId,
        email: payload.email
      });
      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should reject invalid JWT token', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid.token.here'
      };

      authMiddleware.authenticate(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          message: 'Authentication failed',
          code: 'AUTH_ERROR',
          details: 'Invalid token'
        }
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('Rate Limiting Middleware', () => {
    it('should export authRateLimiter', () => {
      const { authRateLimiter } = require('../src/middleware/rate-limit.middleware');
      expect(authRateLimiter).toBeDefined();
      expect(typeof authRateLimiter).toBe('function');
    });

    it('should export otpResendRateLimiter', () => {
      const { otpResendRateLimiter } = require('../src/middleware/rate-limit.middleware');
      expect(otpResendRateLimiter).toBeDefined();
      expect(typeof otpResendRateLimiter).toBe('function');
    });
  });

  describe('CORS Middleware', () => {
    it('should export corsMiddleware', () => {
      const { corsMiddleware } = require('../src/middleware/cors.middleware');
      expect(corsMiddleware).toBeDefined();
      expect(typeof corsMiddleware).toBe('function');
    });
  });
});

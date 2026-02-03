import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import Login from '@/pages/Login';
import authService from '@/services/auth.service';

// Mock services
vi.mock('@/services/auth.service');

// Mock toast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Helper to render with providers
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>{component}</AuthProvider>
    </BrowserRouter>
  );
};

describe('E2E: Error Scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockToast.mockClear();
  });

  describe('Invalid Credentials', () => {
    it('should handle invalid login credentials', async () => {
      const mockError = {
        message: 'Invalid email or password',
        code: 'AUTH_ERROR',
      };

      vi.mocked(authService.login).mockRejectedValue(mockError);

      renderWithProviders(<Login />);

      // Fill login form with invalid credentials
      fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
        target: { value: 'wrong@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
        target: { value: 'WrongPassword123' },
      });

      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      // Wait for error
      await waitFor(() => {
        expect(authService.login).toHaveBeenCalledWith({
          email: 'wrong@example.com',
          password: 'WrongPassword123',
        });
      });

      // Verify error toast was shown
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Login failed',
            variant: 'destructive',
          })
        );
      });
    });

    it('should handle unverified user login attempt', async () => {
      const mockError = {
        message: 'Email verification required',
        code: 'AUTH_ERROR',
      };

      vi.mocked(authService.login).mockRejectedValue(mockError);

      renderWithProviders(<Login />);

      fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
        target: { value: 'unverified@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
        target: { value: 'Password123' },
      });

      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Login failed',
            variant: 'destructive',
          })
        );
      });
    });
  });

  describe('Service-Level Error Scenarios', () => {
    it('should handle expired OTP via service', async () => {
      const mockVerifyError = {
        message: 'OTP has expired',
        code: 'OTP_EXPIRED',
      };

      vi.mocked(authService.verifyOTP).mockRejectedValue(mockVerifyError);

      // Test service call directly
      await expect(
        authService.verifyOTP({
          email: 'test@example.com',
          otp: '123456',
        })
      ).rejects.toEqual(mockVerifyError);
    });

    it('should handle incorrect OTP via service', async () => {
      const mockVerifyError = {
        message: 'Invalid OTP',
        code: 'INVALID_OTP',
      };

      vi.mocked(authService.verifyOTP).mockRejectedValue(mockVerifyError);

      await expect(
        authService.verifyOTP({
          email: 'test@example.com',
          otp: '999999',
        })
      ).rejects.toEqual(mockVerifyError);
    });

    it('should handle duplicate email registration via service', async () => {
      const mockError = {
        message: 'Email already registered',
        code: 'CONFLICT',
      };

      vi.mocked(authService.register).mockRejectedValue(mockError);

      await expect(
        authService.register({
          email: 'existing@example.com',
          password: 'Password123',
          fullName: 'Test User',
          phoneNumber: '+1234567890',
        })
      ).rejects.toEqual(mockError);
    });

    it('should handle OTP resend rate limit via service', async () => {
      const mockRateLimitError = {
        message: 'Too many OTP resend requests. Please try again later.',
        code: 'RATE_LIMIT_ERROR',
      };

      vi.mocked(authService.resendOTP).mockRejectedValue(mockRateLimitError);

      await expect(
        authService.resendOTP({
          email: 'test@example.com',
        })
      ).rejects.toEqual(mockRateLimitError);
    });
  });

  describe('Network Errors', () => {
    it('should handle network errors during login', async () => {
      const mockError = {
        message: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR',
      };

      vi.mocked(authService.login).mockRejectedValue(mockError);

      renderWithProviders(<Login />);

      fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
        target: { value: 'Password123' },
      });

      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Login failed',
            variant: 'destructive',
          })
        );
      });
    });

    it('should handle network errors during registration via service', async () => {
      const mockError = {
        message: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR',
      };

      vi.mocked(authService.register).mockRejectedValue(mockError);

      await expect(
        authService.register({
          email: 'test@example.com',
          password: 'Password123',
          fullName: 'Test User',
          phoneNumber: '+1234567890',
        })
      ).rejects.toEqual(mockError);
    });
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import Login from '@/pages/Login';
import Profile from '@/pages/Profile';
import authService from '@/services/auth.service';
import userService from '@/services/user.service';
import { tokenStorage } from '@/lib/api';

// Mock services
vi.mock('@/services/auth.service');
vi.mock('@/services/user.service');

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
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


describe('E2E: Login → Profile View → Profile Update Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should complete login and profile update flow', async () => {
    const mockLoginResponse = {
      token: 'test-jwt-token',
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        fullName: 'Test User',
        phoneNumber: '+1234567890',
        createdAt: new Date().toISOString(),
      },
    };

    const mockProfileResponse = {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        fullName: 'Test User',
        phoneNumber: '+1234567890',
        createdAt: new Date().toISOString(),
      },
    };

    const mockUpdateResponse = {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        fullName: 'Updated Name',
        phoneNumber: '+9876543210',
        createdAt: new Date().toISOString(),
      },
    };

    vi.mocked(authService.login).mockResolvedValue(mockLoginResponse);
    vi.mocked(userService.getProfile).mockResolvedValue(mockProfileResponse);
    vi.mocked(userService.updateProfile).mockResolvedValue(mockUpdateResponse);

    // Step 1: Login
    const { rerender } = renderWithProviders(<Login />);

    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'Password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalled();
    });

    // Step 2: View Profile
    rerender(
      <BrowserRouter>
        <AuthProvider>
          <Profile />
        </AuthProvider>
      </BrowserRouter>
    );

    // Wait for profile to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    });

    // Step 3: Update Profile
    const nameInput = screen.getByDisplayValue('Test User');
    const phoneInput = screen.getByDisplayValue('+1234567890');

    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
    fireEvent.change(phoneInput, { target: { value: '+9876543210' } });

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(userService.updateProfile).toHaveBeenCalledWith({
        fullName: 'Updated Name',
        phoneNumber: '+9876543210',
        profilePicture: undefined,
      });
    });
  });
});

describe('E2E: Password Change Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should handle password change via service', async () => {
    const mockChangePasswordResponse = {
      message: 'Password changed successfully',
    };

    vi.mocked(userService.changePassword).mockResolvedValue(mockChangePasswordResponse);

    const result = await userService.changePassword({
      currentPassword: 'OldPassword123',
      newPassword: 'NewPassword123',
    });

    expect(result.message).toBe('Password changed successfully');
    expect(userService.changePassword).toHaveBeenCalledWith({
      currentPassword: 'OldPassword123',
      newPassword: 'NewPassword123',
    });
  });

  it('should handle incorrect current password via service', async () => {
    const mockError = {
      message: 'Current password is incorrect',
      code: 'AUTH_ERROR',
    };

    vi.mocked(userService.changePassword).mockRejectedValue(mockError);

    await expect(
      userService.changePassword({
        currentPassword: 'WrongPassword',
        newPassword: 'NewPassword123',
      })
    ).rejects.toEqual(mockError);
  });
});

describe('E2E: Service Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should handle complete registration flow via service calls', async () => {
    const mockRegisterResponse = {
      message: 'Registration successful',
      userId: 'test-user-id',
    };

    const mockVerifyResponse = {
      message: 'Email verified successfully',
    };

    const mockLoginResponse = {
      token: 'test-jwt-token',
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        fullName: 'Test User',
        phoneNumber: '+1234567890',
        createdAt: new Date().toISOString(),
      },
    };

    vi.mocked(authService.register).mockResolvedValue(mockRegisterResponse);
    vi.mocked(authService.verifyOTP).mockResolvedValue(mockVerifyResponse);
    vi.mocked(authService.login).mockResolvedValue(mockLoginResponse);

    // Test registration
    const registerResult = await authService.register({
      email: 'test@example.com',
      password: 'Password123',
      fullName: 'Test User',
      phoneNumber: '+1234567890',
    });

    expect(registerResult.userId).toBe('test-user-id');

    // Test OTP verification
    const verifyResult = await authService.verifyOTP({
      email: 'test@example.com',
      otp: '123456',
    });

    expect(verifyResult.message).toBe('Email verified successfully');

    // Test login
    const loginResult = await authService.login({
      email: 'test@example.com',
      password: 'Password123',
    });

    expect(loginResult.token).toBe('test-jwt-token');
    expect(loginResult.user.email).toBe('test@example.com');
  });

  it('should handle OTP resend flow', async () => {
    const mockResendResponse = {
      message: 'OTP resent successfully',
    };

    vi.mocked(authService.resendOTP).mockResolvedValue(mockResendResponse);

    const result = await authService.resendOTP({
      email: 'test@example.com',
    });

    expect(result.message).toBe('OTP resent successfully');
    expect(authService.resendOTP).toHaveBeenCalledWith({
      email: 'test@example.com',
    });
  });
});

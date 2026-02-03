import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { tokenStorage } from '@/lib/api';
import userService from '@/services/user.service';

// Mock services
vi.mock('@/services/user.service');

// Test component to access auth context
const TestComponent = () => {
  const { user, token, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div data-testid="authenticated">{isAuthenticated ? 'true' : 'false'}</div>
      <div data-testid="token">{token || 'no-token'}</div>
      <div data-testid="user-email">{user?.email || 'no-user'}</div>
      <div data-testid="user-name">{user?.fullName || 'no-name'}</div>
    </div>
  );
};

const renderWithProviders = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('E2E: Token Persistence Across Page Refreshes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should restore authentication state from localStorage on mount', async () => {
    const mockToken = 'test-jwt-token-12345';
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      fullName: 'Test User',
      phoneNumber: '+1234567890',
      createdAt: new Date().toISOString(),
    };

    // Simulate existing token in localStorage (from previous session)
    tokenStorage.setToken(mockToken);

    // Mock profile fetch
    vi.mocked(userService.getProfile).mockResolvedValue({ user: mockUser });

    renderWithProviders();

    // Initially should show loading
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Wait for auth to initialize
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Should fetch user profile with stored token
    expect(userService.getProfile).toHaveBeenCalled();

    // Should restore authentication state
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('token')).toHaveTextContent(mockToken);
    expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
  });

  it('should handle invalid token on page refresh', async () => {
    const mockToken = 'invalid-expired-token';

    // Simulate expired token in localStorage
    tokenStorage.setToken(mockToken);

    // Mock profile fetch to fail (token expired)
    vi.mocked(userService.getProfile).mockRejectedValue({
      message: 'Token expired',
      code: 'AUTH_ERROR',
      status: 401,
    });

    renderWithProviders();

    // Wait for auth to initialize
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Should attempt to fetch profile
    expect(userService.getProfile).toHaveBeenCalled();

    // Should clear invalid token
    expect(tokenStorage.getToken()).toBeNull();

    // Should not be authenticated
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('token')).toHaveTextContent('no-token');
    expect(screen.getByTestId('user-email')).toHaveTextContent('no-user');
  });

  it('should start with no authentication when no token exists', async () => {
    // No token in localStorage
    expect(tokenStorage.getToken()).toBeNull();

    renderWithProviders();

    // Wait for auth to initialize
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Should not fetch profile
    expect(userService.getProfile).not.toHaveBeenCalled();

    // Should not be authenticated
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('token')).toHaveTextContent('no-token');
    expect(screen.getByTestId('user-email')).toHaveTextContent('no-user');
  });

  it('should persist token after login and survive page refresh', async () => {
    const mockToken = 'new-login-token-67890';
    const mockUser = {
      id: 'test-user-id',
      email: 'newuser@example.com',
      fullName: 'New User',
      phoneNumber: '+9876543210',
      createdAt: new Date().toISOString(),
    };

    // Start with no token
    expect(tokenStorage.getToken()).toBeNull();

    // Simulate login by setting token
    tokenStorage.setToken(mockToken);

    // Mock profile fetch for the new token
    vi.mocked(userService.getProfile).mockResolvedValue({ user: mockUser });

    // Render (simulating page refresh after login)
    renderWithProviders();

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Should restore authentication state
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('token')).toHaveTextContent(mockToken);
    expect(screen.getByTestId('user-email')).toHaveTextContent('newuser@example.com');
    expect(screen.getByTestId('user-name')).toHaveTextContent('New User');

    // Verify token is still in localStorage
    expect(tokenStorage.getToken()).toBe(mockToken);
  });

  it('should clear token on logout and not restore on refresh', async () => {
    const mockToken = 'token-to-be-cleared';

    // Start with a token
    tokenStorage.setToken(mockToken);
    expect(tokenStorage.getToken()).toBe(mockToken);

    // Simulate logout by clearing token
    tokenStorage.removeToken();
    expect(tokenStorage.getToken()).toBeNull();

    // Render (simulating page refresh after logout)
    renderWithProviders();

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Should not be authenticated
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('token')).toHaveTextContent('no-token');
    expect(screen.getByTestId('user-email')).toHaveTextContent('no-user');

    // Should not attempt to fetch profile
    expect(userService.getProfile).not.toHaveBeenCalled();
  });

  it('should handle multiple page refreshes with valid token', async () => {
    const mockToken = 'persistent-token-abc123';
    const mockUser = {
      id: 'test-user-id',
      email: 'persistent@example.com',
      fullName: 'Persistent User',
      phoneNumber: '+1111111111',
      createdAt: new Date().toISOString(),
    };

    tokenStorage.setToken(mockToken);
    vi.mocked(userService.getProfile).mockResolvedValue({ user: mockUser });

    // First render (first page load)
    const { unmount } = renderWithProviders();

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    expect(userService.getProfile).toHaveBeenCalledTimes(1);

    // Unmount (simulate navigation away)
    unmount();

    // Second render (second page load - refresh)
    renderWithProviders();

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Should still be authenticated
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('token')).toHaveTextContent(mockToken);
    expect(screen.getByTestId('user-email')).toHaveTextContent('persistent@example.com');

    // Should fetch profile again on second mount
    expect(userService.getProfile).toHaveBeenCalledTimes(2);
  });

  it('should handle token expiry during session', async () => {
    const mockToken = 'token-that-will-expire';
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      fullName: 'Test User',
      phoneNumber: '+1234567890',
      createdAt: new Date().toISOString(),
    };

    tokenStorage.setToken(mockToken);

    // First call succeeds
    vi.mocked(userService.getProfile)
      .mockResolvedValueOnce({ user: mockUser })
      // Second call fails (token expired)
      .mockRejectedValueOnce({
        message: 'Token expired',
        code: 'AUTH_ERROR',
        status: 401,
      });

    // First render - token is valid
    const { unmount } = renderWithProviders();

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');

    unmount();

    // Second render - token has expired
    renderWithProviders();

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Should clear token and not be authenticated
    expect(tokenStorage.getToken()).toBeNull();
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('token')).toHaveTextContent('no-token');
  });
});

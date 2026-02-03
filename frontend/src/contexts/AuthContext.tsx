import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { LoginData, RegisterData, UserProfile } from '@/services/auth.service';
import { tokenStorage } from '@/lib/api';
import userService from '@/services/user.service';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<{ userId: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = tokenStorage.getToken();
      
      if (storedToken) {
        setToken(storedToken);
        
        // Try to fetch user profile
        try {
          const { user: userProfile } = await userService.getProfile();
          setUser(userProfile);
        } catch (error) {
          // Token is invalid, clear it
          tokenStorage.removeToken();
          setToken(null);
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (data: LoginData): Promise<void> => {
    const response = await authService.login(data);
    
    // Store token
    tokenStorage.setToken(response.token);
    setToken(response.token);
    setUser(response.user);
  };

  const register = async (data: RegisterData): Promise<{ userId: string }> => {
    const response = await authService.register(data);
    return { userId: response.userId };
  };

  const logout = (): void => {
    tokenStorage.removeToken();
    setToken(null);
    setUser(null);
  };

  const refreshUser = async (): Promise<void> => {
    if (token) {
      try {
        const { user: userProfile } = await userService.getProfile();
        setUser(userProfile);
      } catch (error) {
        // If refresh fails, logout
        logout();
      }
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

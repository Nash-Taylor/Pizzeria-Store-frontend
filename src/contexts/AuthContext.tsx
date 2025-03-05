import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, apiService } from '../services/api';

interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: Omit<User, 'id'> & { password: string }) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserDetails = async (token: string) => {
    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await apiService.getCurrentUser();
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
      // If there's an error, clear the invalid token
      localStorage.removeItem('auth_token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetchUserDetails(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.login(email, password);
      const { token, user } = response.data;
      
      localStorage.setItem('auth_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      setIsAuthenticated(true);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Login failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  const register = async (userData: Omit<User, 'id'> & { password: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.register(userData);
      const { token, user } = response.data;
      
      localStorage.setItem('auth_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      setIsAuthenticated(true);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated, 
        isLoading, 
        error,
        login, 
        logout, 
        register,
        clearError 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 
import axios from 'axios';
import { Ingredient, ValidationResponse } from '../types/types';

export const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to home if we're not already on the home page
    // and the error is not from a login/register attempt
    if (error.response?.status === 401 && 
        window.location.pathname !== '/' && 
        !error.config.url.includes('/auth/')) {
      localStorage.removeItem('auth_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Auth endpoints
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  
  register: (userData: any) => 
    api.post('/auth/register', userData),

  // Existing endpoints
  getAllIngredients: () => 
    api.get<Ingredient[]>('/ingredients'),
  
  validateSelection: (ingredientIds: number[]) => 
    api.post<ValidationResponse>('/ingredients/validate', { ingredientIds }),
}; 
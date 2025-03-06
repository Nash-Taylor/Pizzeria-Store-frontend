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

interface CartItemData {
  pizzaId: string;
  crustId: number;
  sauceIds: number[];
  toppingIds: number[];
  quantity: number;
}

export const apiService = {
  // Auth endpoints
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  
  register: (userData: any) => 
    api.post('/auth/register', userData),

  getCurrentUser: () => 
    api.get('/auth/me'),

  // Existing endpoints
  getAllIngredients: () => 
    api.get<Ingredient[]>('/ingredients'),
  
  validateSelection: (ingredientIds: number[]) => 
    api.post<ValidationResponse>('/ingredients/validate', { ingredientIds }),

  getOrders: async () => {
    try {
      console.log('Fetching orders...');
      const response = await api.get('/orders');
      console.log('Orders response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  // Cart methods
  getCartItems: async () => {
    const response = await api.get('/cart');
    return response;
  },

  addCartItem: async (data: CartItemData) => {
    const response = await api.post('/cart', data);
    return response;
  },

  removeCartItem: async (pizzaId: string) => {
    const response = await api.delete(`/cart/${pizzaId}`);
    return response;
  },

  updateCartItemQuantity: async (pizzaId: string, quantity: number) => {
    const response = await api.put(`/cart/${pizzaId}`, { quantity });
    return response;
  },

  clearCart: async () => {
    const response = await api.delete('/cart');
    return response;
  },

  // Order endpoints
  createOrder: (data: { orderId: string; cartItemId: number; ingredientId: number }) => {
    console.log('Creating order with data:', data);
    return api.post('/orders', data)
      .then(response => {
        console.log('Order creation response:', response.data);
        return response;
      })
      .catch(error => {
        console.error('Order creation error:', error.response?.data || error.message);
        throw error;
      });
  },
}; 
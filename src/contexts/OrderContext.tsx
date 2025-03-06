import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Ingredient } from '../types/types';
import { apiService } from '../services/api';
import { useAuth } from './AuthContext';

interface OrderPizza {
  cartItemId: number;
  crust: Ingredient | null;
  sauces: Ingredient[];
  toppings: Ingredient[];
}

interface Order {
  orderId: string;
  orderDate: string;
  pizzas: OrderPizza[];
}

interface OrderContextType {
  orders: Order[];
  createOrder: (orderId: string, cartItemId: number, ingredientId: number) => Promise<void>;
  isLoading: boolean;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getOrders();
      console.log('Raw orders from API:', response.data);
      setOrders(response.data);
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createOrder = async (orderId: string, cartItemId: number, ingredientId: number) => {
    try {
      await apiService.createOrder({
        orderId,
        cartItemId,
        ingredientId
      });
      await loadOrders(); // Reload orders after creating a new one
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error;
    }
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        createOrder,
        isLoading
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
}; 
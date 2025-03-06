import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Ingredient } from '../types/types';
import { apiService } from '../services/api';
import { useAuth } from './AuthContext';

interface CartPizza {
  id: string;
  crust: Ingredient | null;
  sauces: Ingredient[];
  toppings: Ingredient[];
  quantity: number;
  totalPrice: number;
}

interface CartContextType {
  items: CartPizza[];
  addPizza: (crust: Ingredient, sauces: Ingredient[], toppings: Ingredient[]) => Promise<void>;
  removePizza: (pizzaId: string) => Promise<void>;
  updateQuantity: (pizzaId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  showLoginPrompt: boolean;
  setShowLoginPrompt: (show: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartPizza[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadCartItems();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const calculatePizzaPrice = (pizza: CartPizza) => {
    if (!pizza.crust) return 0;
    const crustPrice = Number(pizza.crust.price) || 0;
    const saucePrice = (pizza.sauces || []).reduce((sum, sauce) => sum + (Number(sauce?.price) || 0), 0);
    const toppingPrice = (pizza.toppings || []).reduce((sum, topping) => sum + (Number(topping?.price) || 0), 0);
    return crustPrice + saucePrice + toppingPrice;
  };

  const loadCartItems = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getCartItems();
      const rawCartItems = response.data;
      
      // Process cart items
      const processedItems = rawCartItems
        .filter(pizza => pizza.crust !== null)
        .map(pizza => ({
          id: pizza.pizzaId || `PIZZA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          crust: pizza.crust,
          sauces: pizza.sauces || [],
          toppings: pizza.toppings || [],
          quantity: pizza.quantity || 1,
          totalPrice: calculatePizzaPrice(pizza)
        }));

      setItems(processedItems);
    } catch (error) {
      console.error('Error loading cart items:', error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addPizza = async (crust: Ingredient, sauces: Ingredient[], toppings: Ingredient[]) => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    try {
      // Save to database
      const response = await apiService.addCartItem({
        crustId: crust.id,
        sauceIds: sauces.map(s => s.id),
        toppingIds: toppings.map(t => t.id),
        quantity: 1
      });

      // Reload cart items from the database
      await loadCartItems();
    } catch (error) {
      console.error('Failed to add pizza to cart:', error);
      throw error;
    }
  };

  const removePizza = async (pizzaId: string) => {
    try {
      // Remove from database
      await apiService.removeCartItem(pizzaId);
      
      // Update local state
      setItems(currentItems => currentItems.filter(item => item.id !== pizzaId));
    } catch (error) {
      console.error('Failed to remove pizza from cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (pizzaId: string, quantity: number) => {
    if (quantity < 1) return;
    
    try {
      // Update in database
      await apiService.updateCartItemQuantity(pizzaId, quantity);
      
      // Update local state
      setItems(currentItems =>
        currentItems.map(item =>
          item.id === pizzaId ? { ...item, quantity } : item
        )
      );
    } catch (error) {
      console.error('Failed to update pizza quantity:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      // Clear from database
      await apiService.clearCart();
      
      // Update local state
      setItems([]);
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.totalPrice * item.quantity), 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addPizza,
        removePizza,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isLoading,
        showLoginPrompt,
        setShowLoginPrompt
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 
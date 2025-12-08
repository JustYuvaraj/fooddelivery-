import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/types/api.types';

export interface CartItem {
  product: Product;
  quantity: number;
  specialRequests?: string;
}

interface CartContextType {
  items: CartItem[];
  restaurantId: number | null;
  addItem: (product: Product, quantity: number, specialRequests?: string) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [restaurantId, setRestaurantId] = useState<number | null>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedRestaurantId = localStorage.getItem('cartRestaurantId');
    
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
    if (savedRestaurantId) {
      setRestaurantId(JSON.parse(savedRestaurantId));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
    if (restaurantId) {
      localStorage.setItem('cartRestaurantId', JSON.stringify(restaurantId));
    } else {
      localStorage.removeItem('cartRestaurantId');
    }
  }, [items, restaurantId]);

  const addItem = (product: Product, quantity: number, specialRequests?: string) => {
    setItems((prevItems) => {
      // If adding from a different restaurant, clear cart first
      if (restaurantId !== null && restaurantId !== product.restaurantId) {
        setRestaurantId(product.restaurantId);
        return [{ product, quantity, specialRequests }];
      }

      // Set restaurant ID if this is the first item
      if (restaurantId === null) {
        setRestaurantId(product.restaurantId);
      }

      // Check if item already exists
      const existingIndex = prevItems.findIndex((item) => item.product.id === product.id);
      
      if (existingIndex >= 0) {
        // Update existing item
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
          specialRequests: specialRequests || updated[existingIndex].specialRequests,
        };
        return updated;
      }

      // Add new item
      return [...prevItems, { product, quantity, specialRequests }];
    });
  };

  const removeItem = (productId: number) => {
    setItems((prevItems) => {
      const filtered = prevItems.filter((item) => item.product.id !== productId);
      if (filtered.length === 0) {
        setRestaurantId(null);
      }
      return filtered;
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setRestaurantId(null);
  };

  const getTotal = () => {
    return items.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);
  };

  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  const value: CartContextType = {
    items,
    restaurantId,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotal,
    getItemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};




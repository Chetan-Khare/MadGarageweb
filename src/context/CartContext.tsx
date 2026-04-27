import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface CartItem {
  id: number;
  partName: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  category?: string;
  brand?: string;
  quantity: number;
  condition?: string;
  wholesale?: boolean;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any, quantity?: number) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  savings: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('madgarage_cart');
    if (!saved) return [];
    try {
        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed)) return [];
        // Security validation for persisted cart data
        return parsed.filter(item => 
            typeof item.id === 'number' && item.id > 0 &&
            typeof item.quantity === 'number' && item.quantity >= 1 &&
            typeof item.price === 'number' && item.price >= 0
        );
    } catch (e) {
        console.error('Failed to load cart from storage:', e);
        return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('madgarage_cart', JSON.stringify(cart));
  }, [cart]);

  const { role } = useAuth();

  const addToCart = (product: any, quantity: number = 1) => {
    if (role === 'ROLE_SELLER') {
        alert('Seller accounts are not permitted to purchase parts.');
        return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      
      const isGarage = role === 'ROLE_GARAGE';
      const price = (isGarage && product.garagePrice) ? product.garagePrice : (product.price || 0);
      
      return [...prev, {
        id: product.id,
        partName: product.partName,
        price: price,
        originalPrice: product.originalPrice || (price / 0.9), // Estimate 10% markup if not provided
        imageUrl: product.imageUrl,
        category: product.category,
        brand: product.brand,
        condition: product.condition,
        wholesale: isGarage && product.wholesale,
        quantity
      }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) return;
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const savings = cart.reduce((acc, item) => {
    // Only show savings if there's an originalPrice > current price
    if (item.originalPrice && item.originalPrice > item.price) {
        return acc + (item.originalPrice - item.price) * item.quantity;
    }
    return acc;
  }, 0);

  return (
    <CartContext.Provider value={{ 
        cart, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart, 
        totalItems, 
        subtotal, 
        savings 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

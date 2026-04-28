import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../services/apiClient';
import { useAuth } from './AuthContext';

export interface WishlistItem {
  id: number;       // maps to productId from the API
  partName: string;
  price: number;
  imageUrl?: string;
  category?: string;
  brand?: string;
  condition?: string;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  loading: boolean;
  toggleWishlist: (product: any) => Promise<void>;
  removeFromWishlist: (id: number) => Promise<void>;
  isInWishlist: (id: number) => boolean;
  totalItems: number;
  reloadWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const GUEST_KEY = 'madgarage_wishlist_guest';

/** Returns true when the user has a valid JWT in localStorage */
// No longer using raw localStorage helper, using useAuth state instead

/** Maps a raw product object (from catalog click) to a WishlistItem */
const toWishlistItem = (product: any): WishlistItem => ({
  id: product.id,
  partName: product.partName || product.name || 'Unknown Part',
  price: product.garagePrice ?? product.price ?? 0,
  imageUrl: product.imageUrl,
  category: product.category,
  brand: product.brand,
  condition: product.condition || 'NEW',
});

/** Maps a WishlistItemResponse from the API to a WishlistItem */
const fromApiItem = (item: any): WishlistItem => ({
  id: item.productId,
  partName: item.name || item.partName,
  price: item.price,
  imageUrl: item.imageUrl,
  category: item.category,
  brand: item.brand,
  condition: item.condition || 'NEW',
});

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, role } = useAuth();

  // ── Load wishlist on mount ───────────────────────────────────────────────
  const reloadWishlist = useCallback(async () => {
    if (isAuthenticated) {
      if (role === 'ROLE_SELLER' || role === 'ROLE_WORKER') {
        setWishlist([]);
        return;
      }
      setLoading(true);
      try {
        const { data } = await apiClient.get('/wishlist');
        setWishlist(data.map(fromApiItem));
      } catch {
        // Silently fall back to empty — user will see empty state
        setWishlist([]);
      } finally {
        setLoading(false);
      }
    } else {
      // Guest: read from localStorage
      try {
        const saved = localStorage.getItem(GUEST_KEY);
        setWishlist(saved ? JSON.parse(saved) : []);
      } catch {
        setWishlist([]);
      }
    }
  }, [isAuthenticated, role]);

  useEffect(() => {
    reloadWishlist();
  }, [reloadWishlist, isAuthenticated]);

  // Persist guest wishlist to localStorage whenever it changes
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem(GUEST_KEY, JSON.stringify(wishlist));
    }
  }, [wishlist, isAuthenticated]);

  // ── Toggle ───────────────────────────────────────────────────────────────
  const toggleWishlist = async (product: any) => {
    if (isAuthenticated) {
      if (role === 'ROLE_SELLER' || role === 'ROLE_WORKER') {
        alert('Your role is not authorized to use the wishlist feature.');
        return;
      }
      try {
        const { data } = await apiClient.post(`/wishlist/${product.id}`);
        if (data.added) {
          setWishlist(prev => [...prev, toWishlistItem(product)]);
        } else {
          setWishlist(prev => prev.filter(item => item.id !== product.id));
        }
      } catch {
        // ignore — UI stays as-is
      }
    } else {
      // Guest: pure local toggle
      setWishlist(prev => {
        const exists = prev.find(item => item.id === product.id);
        if (exists) return prev.filter(item => item.id !== product.id);
        return [...prev, toWishlistItem(product)];
      });
    }
  };

  // ── Remove ───────────────────────────────────────────────────────────────
  const removeFromWishlist = async (id: number) => {
    if (isAuthenticated) {
      try {
        await apiClient.delete(`/wishlist/${id}`);
      } catch {
        // ignore — still remove locally
      }
    }
    setWishlist(prev => prev.filter(item => item.id !== id));
  };

  const isInWishlist = (id: number) => wishlist.some(item => item.id === id);

  return (
    <WishlistContext.Provider value={{
      wishlist,
      loading,
      toggleWishlist,
      removeFromWishlist,
      isInWishlist,
      totalItems: wishlist.length,
      reloadWishlist,
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};

'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import type { Product } from '@/lib/types';

interface UIContextType {
  // Theme
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
  // Modals
  showCart: boolean;
  openCart: () => void;
  closeCart: () => void;
  showWishlist: boolean;
  openWishlist: () => void;
  closeWishlist: () => void;
  showCheckout: boolean;
  openCheckout: () => void;
  closeCheckout: () => void;
  showRating: boolean;
  selectedProduct: Product | null;
  openRating: (product: Product) => void;
  closeRating: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [darkMode, setDarkMode] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('halim_darkMode');
      let isDark = false;
      
      if (saved) {
        isDark = JSON.parse(saved);
      } else {
        // Fallback to system preference if no saved setting
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      
      setDarkMode(isDark);
      // Synchronize DOM with state - the script already handled this for FOUC
      // but we ensure it matches the state accurately here.
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.error('Error loading darkMode from localStorage:', e);
    }
  }, []);

  // Save theme and apply class on change
  // We skip the first run to avoid fighting the initial mount sync
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (!mounted) {
      setMounted(true);
      return;
    }
    try {
      localStorage.setItem('halim_darkMode', JSON.stringify(darkMode));
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.error('Error saving darkMode to localStorage:', e);
    }
  }, [darkMode, mounted]);

  // Modal state
  const [showCart, setShowCart] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);


  const openCart = useCallback(() => setShowCart(true), []);
  const closeCart = useCallback(() => setShowCart(false), []);
  const openWishlist = useCallback(() => setShowWishlist(true), []);
  const closeWishlist = useCallback(() => setShowWishlist(false), []);
  const openCheckout = useCallback(() => setShowCheckout(true), []);
  const closeCheckout = useCallback(() => setShowCheckout(false), []);
  const openRating = useCallback((product: Product) => {
    setSelectedProduct(product);
    setShowRating(true);
  }, []);
  const closeRating = useCallback(() => {
    setShowRating(false);
    setSelectedProduct(null);
  }, []);

  const value = useMemo<UIContextType>(
    () => ({
      darkMode,
      setDarkMode,
      showCart,
      openCart,
      closeCart,
      showWishlist,
      openWishlist,
      closeWishlist,
      showCheckout,
      openCheckout,
      closeCheckout,
      showRating,
      selectedProduct,
      openRating,
      closeRating,
    }),
    [
      darkMode,
      showCart,
      openCart,
      closeCart,
      showWishlist,
      openWishlist,
      closeWishlist,
      showCheckout,
      openCheckout,
      closeCheckout,
      showRating,
      selectedProduct,
      openRating,
      closeRating,
    ]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI(): UIContextType {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}


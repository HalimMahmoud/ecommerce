'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Language } from '@/lib/types';
import type { Product } from '@/lib/types';

interface UIContextType {
  // Language
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
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
  const [language, setLanguage] = useState<Language>('en');
  const [darkMode, setDarkMode] = useState(false);

  // Modal state
  const [showCart, setShowCart] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const isRTL = language === 'ar';

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
      language,
      setLanguage,
      isRTL,
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
      language,
      isRTL,
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

'use client';

import React, { createContext, useContext, useState } from 'react';
import { Product } from '@/lib/types';

interface WishlistContextType {
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  removeFromWishlist: (id: number) => void;
  isInWishlist: (id: number) => boolean;
  moveToCartFromWishlist: (product: Product) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [wishlist, setWishlist] = useState<Product[]>([]);

  const toggleWishlist = (product: Product) => {
    setWishlist(prev => {
      const isInWishlist = prev.some(item => item.id === product.id);
      if (isInWishlist) {
        return prev.filter(item => item.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const removeFromWishlist = (id: number) => {
    setWishlist(prev => prev.filter(item => item.id !== id));
  };

  const isInWishlist = (id: number) => {
    return wishlist.some(item => item.id === id);
  };

  const moveToCartFromWishlist = (product: Product) => {
    // This will be handled by the composite provider
    removeFromWishlist(product.id);
  };

  const value: WishlistContextType = {
    wishlist,
    toggleWishlist,
    removeFromWishlist,
    isInWishlist,
    moveToCartFromWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextType {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}

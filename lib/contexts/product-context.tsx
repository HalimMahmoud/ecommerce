'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { Product } from '@/lib/types';

interface ProductContextType {
  /** Optimistic local ratings. Products themselves should come from server props. */
  ratedProducts: Record<number, { userRatings: number[]; rating: number; reviews: number }>;
  rateProduct: (productId: number, rating: number, currentProduct: Product) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [ratedProducts, setRatedProducts] = useState<
    Record<number, { userRatings: number[]; rating: number; reviews: number }>
  >({});

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('halim_ratings');
      if (saved) {
        setRatedProducts(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load ratings from localStorage:', error);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('halim_ratings', JSON.stringify(ratedProducts));
    } catch (error) {
      console.error('Failed to save ratings to localStorage:', error);
    }
  }, [ratedProducts]);

  const rateProduct = useCallback((productId: number, rating: number, currentProduct: Product) => {
    setRatedProducts(prev => {
      const existing = prev[productId] ?? {
        userRatings: currentProduct.userRatings,
        rating: currentProduct.rating,
        reviews: currentProduct.reviews,
      };
      const newUserRatings = [...existing.userRatings, rating];
      const avgRating = newUserRatings.reduce((a, b) => a + b, 0) / newUserRatings.length;
      return {
        ...prev,
        [productId]: {
          userRatings: newUserRatings,
          rating: avgRating,
          reviews: newUserRatings.length,
        },
      };
    });
  }, []);

  const value = useMemo<ProductContextType>(
    () => ({ ratedProducts, rateProduct }),
    [ratedProducts, rateProduct]
  );

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}

export function useProducts(): ProductContextType {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}


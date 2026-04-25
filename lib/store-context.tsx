'use client';

import { ProductProvider } from './contexts/product-context';
import { CartProvider } from './contexts/cart-context';
import { WishlistProvider } from './contexts/wishlist-context';
import { UIProvider } from './contexts/ui-context';
import { AuthProvider } from './contexts/auth-context';

// Re-export individual hooks — always import the specific hook you need
// to avoid unnecessary re-renders from unrelated context changes.
export { useProducts } from './contexts/product-context';
export { useCart } from './contexts/cart-context';
export { useWishlist } from './contexts/wishlist-context';
export { useUI } from './contexts/ui-context';
export { useAuth } from './contexts/auth-context';

// Re-export types
export type { Product, CartItem, CheckoutData, Language } from './types';

/**
 * Composite Store Provider that wraps all context providers.
 *
 * Usage in layout.tsx:
 *   <StoreProvider>
 *     <YourApp />
 *   </StoreProvider>
 *
 * In components, import specific hooks for precise re-render control:
 *   import { useCart } from '@/lib/store-context'    // only re-renders on cart changes
 *   import { useAuth } from '@/lib/store-context'    // only re-renders on auth changes
 */
export function StoreProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <AuthProvider>
      <UIProvider>
        <ProductProvider>
          <CartProvider>
            <WishlistProvider>{children}</WishlistProvider>
          </CartProvider>
        </ProductProvider>
      </UIProvider>
    </AuthProvider>
  );
}


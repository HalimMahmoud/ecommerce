'use client';

import React from 'react';
import Header from './header';
import Footer from './footer';
import CartModal from '@/components/features/cart/cart-modal';
import WishlistModal from '@/components/features/wishlist/wishlist-modal';
import CheckoutModal from '@/components/features/checkout/checkout-modal';
import RatingModal from '@/components/features/products/rating-modal';
import { useUI } from '@/lib/store-context';
import { Toaster } from '@/components/ui/sonner';

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const {
    showCart, openCart, closeCart,
    showWishlist, openWishlist, closeWishlist,
    showCheckout, openCheckout, closeCheckout,
    showRating, selectedProduct, closeRating,
  } = useUI();

  const handleCheckout = () => {
    closeCart();
    openCheckout();
  };

  return (
    <>
      <Header onCartClick={openCart} onWishlistClick={openWishlist} />
      {children}
      <Footer />

      <CartModal isOpen={showCart} onClose={closeCart} onCheckout={handleCheckout} />
      <WishlistModal isOpen={showWishlist} onClose={closeWishlist} />
      <CheckoutModal isOpen={showCheckout} onClose={closeCheckout} />
      <RatingModal
        product={selectedProduct}
        isOpen={showRating}
        onClose={closeRating}
      />
      <Toaster />
    </>
  );
}


'use client';

import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useCart } from '@/lib/store-context';
import { Product, CartItem } from '@/lib/types';

/**
 * Reusable actions and state for product-related UI (ProductCard, ProductPage).
 */
export function useProductActions(product: Product) {
  const { cart, addToCart } = useCart();
  const t = useTranslations();

  const currentItem = cart.find((i: CartItem) => i.id === product.id);
  const existingQty = currentItem?.quantity || 0;
  const remainingStock = Math.max(0, product.stock - existingQty);

  const handleAddToCart = (quantity: number = 1) => {
    if (remainingStock < quantity) {
      toast.error(t('cartLimitReached'), {
        description: `${t('maxStock')} ${product.stock}`
      });
      return false;
    } else {
      addToCart(product, quantity);
      toast.success(t('addedToCart'));
      return true;
    }
  };

  return {
    existingQty,
    remainingStock,
    handleAddToCart,
    hasInCart: existingQty > 0,
  };
}

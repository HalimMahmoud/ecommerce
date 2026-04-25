'use client';

import Image from 'next/image';
import { ShoppingCart, Heart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCart, useWishlist, useProducts } from '@/lib/store-context';
import { toast } from 'sonner';
import StarRating from './star-rating';
import type { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
  onRateClick: (product: Product) => void;
}

export default function ProductCard({ product, onRateClick }: ProductCardProps) {
  const t = useTranslations();
  const { addToCart, cart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { ratedProducts } = useProducts();
  const productName = product.name;


  // Merge optimistic local rating
  const localRating = ratedProducts[product.id];
  const displayRating = localRating ? localRating.rating : product.rating;
  const displayReviews = localRating ? localRating.reviews : product.reviews;

  const currentItem = cart.find(i => i.id === product.id);
  const existingQty = currentItem?.quantity || 0;
  const remainingStock = Math.max(0, product.stock - existingQty);

  const handleAddToCart = () => {
    if (remainingStock <= 0) {
      toast.error(t('cartLimitReached'), {
        description: `${t('maxStock')} ${product.stock}`
      });
    } else {
      addToCart(product, 1);
      toast.success(t('addedToCart'));
    }
  };

  return (
    <div className="bg-card rounded-lg overflow-hidden shadow-md hover:shadow-lg transition">
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden bg-muted">
        <a href={`/product/${product.slug}`} className="block absolute inset-0 z-0">
          <Image
            src={product.image || '/placeholder.svg'}
            alt={productName}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
          />
        </a>
        {/* Wishlist Button */}
        <button
          onClick={() => toggleWishlist(product)}
          className="absolute top-2 right-2 p-2 bg-background rounded-full shadow-md hover:bg-muted transition z-10"
          aria-label={isInWishlist(product.id) ? t('removeFromWishlist') : t('addToWishlist')}
        >
          <Heart
            size={20}
            className={
              isInWishlist(product.id)
                ? 'fill-destructive text-destructive'
                : 'text-muted-foreground'
            }
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-light text-sm md:text-base mb-2 line-clamp-2 text-card-foreground">
          <a href={`/product/${product.slug}`} className="hover:underline z-10 relative">
            {productName}
          </a>
        </h3>

        {/* Rating */}
        {displayReviews > 0 && (
          <div className="flex items-center gap-2 mb-2">
            <StarRating rating={displayRating} />
            <span className="text-xs text-muted-foreground">({displayReviews})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-light text-foreground">
            {product.price} <span className="text-xs">{t('currency')}</span>
          </div>
          {remainingStock < 5 && remainingStock > 0 && (
            <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
              {remainingStock} {t('remaining')}
            </span>
          )}
          {remainingStock === 0 && product.stock > 0 && (
            <span className="text-xs px-2 py-1 rounded bg-destructive/10 text-destructive">
              {t('limitReached')}
            </span>
          )}
          {product.stock === 0 && (
            <span className="text-xs px-2 py-1 rounded bg-destructive/10 text-destructive">
              {t('outOfStock')}
            </span>
          )}
        </div>

        {/* Rating Button */}
        {displayReviews === 0 && (
          <button
            onClick={() => onRateClick(product)}
            className="w-full py-1 text-xs mb-2 rounded transition bg-muted hover:bg-muted/80 text-muted-foreground"
          >
            {t('rateThisProduct')}
          </button>
        )}

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0 || remainingStock === 0}
          className={`w-full py-2 flex items-center justify-center gap-2 rounded font-light text-sm transition ${
            product.stock === 0 || remainingStock === 0
              ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
        >
          <ShoppingCart size={16} />
          {remainingStock === 0 && product.stock > 0 ? t('limitReached') : t('addToCart')}
        </button>
      </div>
    </div>
  );
}

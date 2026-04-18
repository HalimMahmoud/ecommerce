'use client';

import Image from 'next/image';
import { Heart, ShoppingCart } from 'lucide-react';
import { useUI, useCart, useWishlist } from '@/lib/store-context';
import { translations } from '@/lib/translations';
import StarRating from './star-rating';
import type { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
  onRateClick: (product: Product) => void;
}

export default function ProductCard({ product, onRateClick }: ProductCardProps) {
  const { language } = useUI();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const trans = translations[language];
  const productName = language === 'ar' ? product.nameAr : product.nameEn;

  return (
    <div className="bg-card rounded-lg overflow-hidden shadow-md hover:shadow-lg transition">
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden bg-muted">
        <a href={`/product/${product.id}`} className="block absolute inset-0 z-0">
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
          aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
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
          <a href={`/product/${product.id}`} className="hover:underline z-10 relative">
            {productName}
          </a>
        </h3>

        {/* Rating */}
        {product.reviews > 0 && (
          <div className="flex items-center gap-2 mb-2">
            <StarRating rating={product.rating} />
            <span className="text-xs text-muted-foreground">({product.reviews})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-light text-foreground">
            {product.price} <span className="text-xs">{trans.currency}</span>
          </div>
          {product.stock < 5 && product.stock > 0 && (
            <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
              {product.stock} {trans.remaining}
            </span>
          )}
          {product.stock === 0 && (
            <span className="text-xs px-2 py-1 rounded bg-destructive/10 text-destructive">
              Out of Stock
            </span>
          )}
        </div>

        {/* Rating Button */}
        {product.reviews === 0 && (
          <button
            onClick={() => onRateClick(product)}
            className="w-full py-1 text-xs mb-2 rounded transition bg-muted hover:bg-muted/80 text-muted-foreground"
          >
            {trans.rateThisProduct}
          </button>
        )}

        {/* Add to Cart Button */}
        <button
          onClick={() => addToCart(product)}
          disabled={product.stock === 0}
          className={`w-full py-2 flex items-center justify-center gap-2 rounded font-light text-sm transition ${
            product.stock === 0
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
        >
          <ShoppingCart size={16} />
          {trans.addToCart}
        </button>
      </div>
    </div>
  );
}

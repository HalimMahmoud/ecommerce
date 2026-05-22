'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Heart, Minus, Plus, ChevronLeft, Share2, ShieldCheck, Truck } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useWishlist, useProducts, useUI } from '@/lib/store-context';
import { useProductActions } from '@/lib/hooks';
import StarRating from './star-rating';
import ProductCard from './product-card';
import type { Product } from '@/lib/types';

interface ProductPageProps {
  id: number;
  products: Product[];
}

export default function ProductPage({ id, products }: ProductPageProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { ratedProducts } = useProducts();
  const { openRating } = useUI();

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  const product = products.find(p => p.id === id) as Product | undefined;

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center">
        <p className="text-lg">{t('product.notFound')}</p>
        <Link href="/" className="mt-4 inline-block text-primary">
          {t('product.backToShop')}
        </Link>
      </div>
    );
  }

  // Merge optimistic local rating
  const localRating = product ? ratedProducts[product.id] : null;
  const displayRating = localRating ? localRating.rating : (product?.rating || 0);
  const displayReviews = localRating ? localRating.reviews : (product?.reviews || 0);

  const related = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const { remainingStock, handleAddToCart: baseAddToCart } = useProductActions(product);
  
  const handleAddToCart = () => {
    if (baseAddToCart(quantity)) {
      setQuantity(1);
    }
  };

  return (
    <div className={`min-h-screen bg-background py-8 px-4 ${isRTL ? 'text-right' : 'text-left'}`}>
      <div className="max-w-7xl mx-auto">
        
        {/* Breadcrumbs */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">{t('product.home')}</Link>
          <ChevronLeft size={14} className={isRTL ? 'rotate-180' : ''} />
          <Link 
            href={`/?category=${product.category}`} 
            className="capitalize hover:text-primary transition-colors"
          >
            {product.category}
          </Link>
          <ChevronLeft size={14} className={isRTL ? 'rotate-180' : ''} />
          <span className="text-foreground font-medium line-clamp-1">{product.name}</span>
        </nav>

        <div className={`flex flex-col lg:flex-row gap-12 ${isRTL ? 'lg:flex-row-reverse' : ''}`}>
          
          {/* Left: Product Imagery */}
          <div className="lg:w-3/5 space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-muted/30 border border-border/50 group">
              <Image
                src={product.image || '/placeholder.svg'}
                alt={product.name}
                fill
                priority
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Right: Sticky Details Side */}
          <div className="lg:w-2/5">
            <div className="lg:sticky lg:top-24 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  {product.stock > 0 ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-semibold uppercase tracking-wider">
                      {t('inStock')}
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-semibold uppercase tracking-wider">
                      {t('outOfStock')}
                    </span>
                  )}
                  <button className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground">
                    <Share2 size={18} />
                  </button>
                </div>

                <h1 className="text-4xl font-bold tracking-tight text-foreground leading-tight">
                  {product.name}
                </h1>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <StarRating rating={displayRating} size={18} />
                    <span className="text-sm font-medium text-foreground">{displayRating.toFixed(1)}</span>
                  </div>
                  <div className="h-4 w-px bg-border" />
                  <span className="text-sm text-muted-foreground">{displayReviews} {t('reviews')}</span>
                </div>

                <div className="text-4xl font-light text-foreground">
                  {product.price} <span className="text-xl font-medium opacity-60">{t('currency')}</span>
                </div>
              </div>

              {/* Purchase Box */}
              <div className="p-6 rounded-3xl bg-card border border-border/50 shadow-xl shadow-black/5 space-y-6">
                <div className="space-y-4">
                  <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground block">
                    {t('quantity')}
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-border rounded-xl bg-background px-4 py-2 space-x-6">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={remainingStock === 0}
                        className="p-1 hover:text-primary transition-colors disabled:opacity-30"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-bold text-lg">{remainingStock === 0 ? 0 : quantity}</span>
                      <button 
                        onClick={() => setQuantity(Math.min(remainingStock, quantity + 1))}
                        disabled={remainingStock === 0 || quantity >= remainingStock}
                        className="p-1 hover:text-primary transition-colors disabled:opacity-30"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    {remainingStock < 10 && remainingStock > 0 && (
                      <span className="text-sm text-amber-500 font-medium">
                        {t('only')} {remainingStock} {t('left')}!
                      </span>
                    )}
                    {remainingStock === 0 && product.stock > 0 && (
                      <span className="text-sm text-destructive font-medium italic">
                        {t('maxInCart')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0 || remainingStock === 0}
                    className="flex-1 h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl flex items-center justify-center gap-3 font-bold transition-all active:scale-95 disabled:opacity-50 disabled:bg-muted disabled:text-muted-foreground"
                  >
                    <ShoppingCart size={20} />
                    {remainingStock === 0 && product.stock > 0 ? t('limitReached') : t('addToCart')}
                  </button>
                  <button
                    onClick={() => toggleWishlist(product)}
                    className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all active:scale-95 ${
                      isInWishlist(product.id) 
                        ? 'border-destructive/20 bg-destructive/5 text-destructive' 
                        : 'border-border hover:border-muted-foreground text-muted-foreground'
                    }`}
                  >
                    <Heart size={20} className={isInWishlist(product.id) ? 'fill-current' : ''} />
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="pt-6 border-t border-border/50 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <Truck size={18} className="text-primary" />
                    <span>{t('fastDelivery')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <ShieldCheck size={18} className="text-primary" />
                    <span>{t('secureCheckout')}</span>
                  </div>
                </div>
              </div>

              {/* Info Tabs */}
              <div className="space-y-6">
                <div className="flex gap-8 border-b border-border">
                  {['description', 'specs'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-4 text-sm font-semibold uppercase tracking-widest relative px-1 transition-colors ${
                        activeTab === tab ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {t(`product.${tab}`)}
                      {activeTab === tab && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full transition-all" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="text-muted-foreground leading-relaxed text-base min-h-[100px] animate-in fade-in duration-500">
                  {activeTab === 'description' ? (
                    product.description || t('product.descriptionPlaceholder')
                  ) : (
                    <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                      <div className="text-xs uppercase font-bold text-foreground/50">{t('category')}</div>
                      <div className="text-sm font-medium text-foreground">{product.category}</div>
                      <div className="text-xs uppercase font-bold text-foreground/50">{t('availability')}</div>
                      <div className="text-sm font-medium text-foreground">{product.stock > 0 ? t('inStock') : t('outOfStock')}</div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-32 pt-16 border-t border-border">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold tracking-tight">{t('product.related')}</h2>
              <Link href="/" className="text-primary font-semibold hover:underline flex items-center gap-2">
                {t('viewAll')} {isRTL ? '←' : '→'}
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              {related.map(p => (
                <ProductCard key={p.id} product={p} onRateClick={openRating} />
              ))}
            </div>
          </div>
        )}

        {/* Mobile Fixed Quick Action Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border z-50 animate-in slide-in-from-bottom duration-500">
          <div className="max-w-md mx-auto flex gap-4 items-center">
            <div className="flex-1">
              <div className="text-xs text-muted-foreground line-clamp-1">{product.name}</div>
              <div className="font-bold">{product.price} {t('currency')}</div>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="px-6 h-12 bg-primary text-primary-foreground rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              <ShoppingCart size={18} />
              {t('add')}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}


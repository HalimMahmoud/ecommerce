'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUI, useCart, useWishlist } from '@/lib/store-context';
import { translations } from '@/lib/translations';
import { productTranslations } from '@/lib/product-translations';
import StarRating from './star-rating';
import type { Product } from '@/lib/types';

interface ProductPageProps {
  id: string;
  products: Product[];
}

export default function ProductPage({ id, products }: ProductPageProps) {
  const { language, isRTL } = useUI();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const router = useRouter();
  const trans = translations[language];
  const pid = parseInt(id, 10);

  const pt = productTranslations[language];

  const product = products.find(p => p.id === pid) as Product | undefined;

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center">
        <p className="text-lg">{pt.notFound}</p>
        <Link href="/" className="mt-4 inline-block text-primary">
          {pt.backToShop}
        </Link>
      </div>
    );
  }

  const productName = language === 'ar' ? product.nameAr : product.nameEn;

  const related = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div
      className={`max-w-6xl mx-auto py-12 text-foreground ${isRTL ? 'text-right' : 'text-left'}`}
    >
      <div className={`flex flex-col lg:flex-row gap-8 ${isRTL ? 'lg:flex-row-reverse' : ''}`}>
        {/* Image */}
        <div className="lg:w-1/2 bg-muted rounded-lg overflow-hidden h-96 relative">
          <Image
            src={product.image || '/placeholder.svg'}
            alt={productName}
            fill
            className="object-cover"
          />
        </div>

        {/* Details */}
        <div className={`lg:w-1/2 ${isRTL ? 'text-right' : 'text-left'}`}>
          <div className="mb-4 flex items-center gap-4">
            <button onClick={() => router.back()} className="text-sm text-primary hover:underline">
              {isRTL ? `${pt.back} →` : `← ${pt.back}`}
            </button>
            <Link href="/" className="text-sm text-primary hover:underline">
              {pt.home}
            </Link>
          </div>
          <h1 className="text-2xl font-light mb-4">{productName}</h1>

          <div className="flex items-center gap-4 mb-4">
            <div className="text-2xl font-light">
              {product.price} <span className="text-sm">{trans.currency}</span>
            </div>
            <div className="flex items-center gap-2">
              <StarRating rating={product.rating} />
              <span className="text-sm text-muted-foreground">({product.reviews})</span>
            </div>
          </div>

          <div className="mb-4">
            <span className="inline-block px-3 py-1 text-sm rounded bg-muted text-muted-foreground">
              {product.category}
            </span>
          </div>

          <h4 className="mb-2 font-medium">{pt.descriptionTitle}</h4>
          <p className="mb-6 text-sm text-muted-foreground">
            {product.description || pt.descriptionPlaceholder}
          </p>

          <div className="flex gap-3 mb-6">
            <button
              onClick={() => addToCart(product)}
              className="py-2 px-4 rounded bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <ShoppingCart size={16} /> <span className="ml-2">{trans.addToCart}</span>
            </button>

            <button
              onClick={() => toggleWishlist(product)}
              className={`py-2 px-4 rounded border ${isInWishlist(product.id) ? 'border-primary text-primary' : 'border-border'}`}
            >
              <Heart size={16} />{' '}
              <span className="ml-2">
                {isInWishlist(product.id) ? trans.removedFromWishlist : trans.addedToWishlist}
              </span>
            </button>
          </div>

          <Link href="/" className="text-sm text-primary">
            {pt.backToShop}
          </Link>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-12">
          <h3 className="text-xl font-light mb-4">{pt.related}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map(p => (
              <Link
                key={p.id}
                href={`/product/${p.id}`}
                className="block bg-card rounded shadow-sm overflow-hidden"
              >
                <div className="relative h-40 bg-muted">
                  <Image src={p.image} alt={p.nameEn} fill className="object-cover" />
                </div>
                <div className="p-2 text-xs">{language === 'ar' ? p.nameAr : p.nameEn}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

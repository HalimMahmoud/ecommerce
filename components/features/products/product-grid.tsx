'use client';

import { useTranslations } from 'next-intl';
import { useUI } from '@/lib/store-context';
import ProductCard from './product-card';
import type { Product } from '@/lib/types';

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  const t = useTranslations();
  const { openRating } = useUI();

  return (
    <div>
      {/* Results Count */}
      <div className="mb-4 text-sm font-light text-muted-foreground">
        {t('showing')} {products.length} {t('products')}
      </div>

      {/* Product Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} onRateClick={openRating} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg font-light">{t('noResults')}</p>
        </div>
      )}
    </div>
  );
}


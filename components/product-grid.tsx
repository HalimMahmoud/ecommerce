'use client';

import { useMemo } from 'react';
import { useUI } from '@/lib/store-context';
import { useSearchParams } from '@/lib/use-search-params';
import { translations } from '@/lib/translations';
import ProductCard from './product-card';
import type { Product } from '@/lib/types';

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  const { language, openRating } = useUI();
  const { search, category, sort, priceRange, rating } = useSearchParams();

  const trans = translations[language];

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch =
        language === 'ar'
          ? product.nameAr.toLowerCase().includes(search.toLowerCase())
          : product.nameEn.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'all' || product.category === category;
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchesRating = product.rating >= rating;

      return matchesSearch && matchesCategory && matchesPrice && matchesRating;
    });

    // Sort
    if (sort === 'priceLowHigh') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sort === 'priceHighLow') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sort === 'name') {
      filtered.sort((a, b) => {
        const nameA = language === 'ar' ? a.nameAr : a.nameEn;
        const nameB = language === 'ar' ? b.nameAr : b.nameEn;
        return nameA.localeCompare(nameB);
      });
    }

    return filtered;
  }, [products, search, category, sort, priceRange, rating, language]);

  return (
    <div>
      {/* Results Count */}
      <div className="mb-4 text-sm font-light text-muted-foreground">
        {trans.showing} {filteredProducts.length} {trans.products}
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} onRateClick={openRating} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg font-light">No products found</p>
        </div>
      )}
    </div>
  );
}

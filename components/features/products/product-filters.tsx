'use client';

import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useQueryStates } from 'nuqs';
import { searchParamsSchema } from '@/lib/search-params';

interface ProductFiltersProps {
  categories: string[];
}

export default function ProductFilters({ categories }: ProductFiltersProps) {
  const t = useTranslations();
  const [params, setParams] = useQueryStates(searchParamsSchema, {
    shallow: false // Ensure we trigger a server-side re-render
  });

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-6">
      {/* Search */}
      <div>
        <label className="block text-sm font-light mb-2 text-card-foreground">{t('search')}</label>
        <div className="relative">
          <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder={t('search')}
            value={params.search ?? ''}
            onChange={e => setParams({ search: e.target.value || null })}
            className="w-full pl-10 pr-4 py-2 rounded border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            suppressHydrationWarning
          />

        </div>
      </div>

      {/* Categories */}
      <div>
        <label className="block text-sm font-light mb-2 text-card-foreground">
          {t('categories')}
        </label>
        <div className="space-y-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => {
                setParams({ category: cat });
              }}
              className={`w-full text-left px-3 py-2 rounded transition ${
                params.category === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat === 'all'
                ? t('all')
                : t.has(cat)
                  ? t(cat)
                  : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="block text-sm font-light mb-2 text-card-foreground">{t('sortBy')}</label>
        <select
          value={params.sort ?? 'featured'}
          onChange={e => setParams({ sort: e.target.value })}
          className="w-full px-3 py-2 rounded border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="featured">{t('featured')}</option>
          <option value="priceLowHigh">{t('priceLowHigh')}</option>
          <option value="priceHighLow">{t('priceHighLow')}</option>
          <option value="name">{t('name')}</option>
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-light mb-2 text-card-foreground">
          {t('priceRange')}: {params.minPrice} - {params.maxPrice}
        </label>
        <input
          type="range"
          min="0"
          max="5000"
          value={params.maxPrice ?? 5000}
          onChange={e => setParams({ maxPrice: parseInt(e.target.value) })}
          className="w-full"
          suppressHydrationWarning
        />

      </div>

      {/* Rating Filter */}
      <div>
        <label className="block text-sm font-light mb-2 text-card-foreground">
          {t('rating')}: {params.rating}+ {t('stars')}
        </label>
        <input
          type="range"
          min="0"
          max="5"
          value={params.rating ?? 0}
          onChange={e => setParams({ rating: parseInt(e.target.value) })}
          className="w-full"
          suppressHydrationWarning
        />

      </div>
    </div>
  );
}


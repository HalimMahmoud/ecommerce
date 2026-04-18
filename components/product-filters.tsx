'use client';

import { Search } from 'lucide-react';
import { useUI } from '@/lib/store-context';
import { useSearchParams } from '@/lib/use-search-params';
import { translations } from '@/lib/translations';

interface ProductFiltersProps {
  categories: string[];
}

export default function ProductFilters({ categories }: ProductFiltersProps) {
  const { language } = useUI();
  const {
    search,
    setSearch,
    category,
    setCategory,
    sort,
    setSort,
    priceRange,
    setPriceRange,
    rating,
    setRating,
  } = useSearchParams();

  const trans = translations[language];

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-6">
      {/* Search */}
      <div>
        <label className="block text-sm font-light mb-2 text-card-foreground">{trans.search}</label>
        <div className="relative">
          <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder={trans.search}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Categories */}
      <div>
        <label className="block text-sm font-light mb-2 text-card-foreground">
          {trans.categories}
        </label>
        <div className="space-y-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
              }}
              className={`w-full text-left px-3 py-2 rounded transition ${
                category === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat === 'all' ? trans.all : trans[cat as keyof typeof trans]}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="block text-sm font-light mb-2 text-card-foreground">{trans.sortBy}</label>
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="w-full px-3 py-2 rounded border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="featured">{trans.featured}</option>
          <option value="priceLowHigh">{trans.priceLowHigh}</option>
          <option value="priceHighLow">{trans.priceHighLow}</option>
          <option value="name">{trans.name}</option>
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-light mb-2 text-card-foreground">
          {trans.priceRange}: {priceRange[0]} - {priceRange[1]}
        </label>
        <input
          type="range"
          min="0"
          max="5000"
          value={priceRange[1]}
          onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value)])}
          className="w-full"
        />
      </div>

      {/* Rating Filter */}
      <div>
        <label className="block text-sm font-light mb-2 text-card-foreground">
          {trans.rating}: {rating}+ {trans.stars}
        </label>
        <input
          type="range"
          min="0"
          max="5"
          value={rating}
          onChange={e => setRating(parseInt(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
}

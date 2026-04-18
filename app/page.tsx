import { Suspense } from 'react';
import HeroSection from '@/components/hero-section';
import FeaturesSection from '@/components/features-section';
import ProductFilters from '@/components/product-filters';
import ProductGrid from '@/components/product-grid';
import { SAMPLE_PRODUCTS } from '@/lib/products-data';

/** Derive categories the same way the API route does */
function getCategories(): string[] {
  return ['all', ...new Set(SAMPLE_PRODUCTS.map(p => p.category))];
}

export default function Home() {
  // Server-side data — no useEffect, no client fetch needed
  const products = SAMPLE_PRODUCTS;
  const categories = getCategories();

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1">
            <Suspense fallback={<div className="h-64 bg-muted rounded-lg animate-pulse" />}>
              <ProductFilters categories={categories} />
            </Suspense>
          </aside>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <Suspense fallback={<div className="h-96 bg-muted rounded-lg animate-pulse" />}>
              <ProductGrid products={products} />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}

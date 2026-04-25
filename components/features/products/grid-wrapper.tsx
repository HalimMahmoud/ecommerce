import { getProducts } from '@/lib/products-data';
import ProductGrid from './product-grid';

interface GridWrapperProps {
  params: {
    search?: string | null;
    category?: string | null;
    sort?: string | null;
    minPrice?: number | null;
    maxPrice?: number | null;
    rating?: number | null;
  };
  locale?: string;
}

export default async function GridWrapper({ params, locale }: GridWrapperProps) {
  const products = await getProducts({
    ...params,
    ...(locale ? { locale } : {})
  });

  return <ProductGrid products={products} />;
}

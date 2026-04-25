import { getCategories } from '@/lib/products-data';
import ProductFilters from './product-filters';

interface FiltersWrapperProps {
  locale?: string;
}

export default async function FiltersWrapper({ locale }: FiltersWrapperProps) {
  const categories = await getCategories(locale);
  return <ProductFilters categories={categories} />;
}

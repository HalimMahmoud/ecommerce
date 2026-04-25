import type { Metadata } from 'next';
import ProductPage from "@/components/features/products/product-page";
import { getProducts, getProductBySlug } from "@/lib/products-data";
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return { title: 'Product Not Found' };

  return {
    title: `${product.name} | E-Store`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.image],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description,
      images: [product.image],
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  
  // Fetch specific product and all (for related list) in parallel
  const [product, allProducts] = await Promise.all([
    getProductBySlug(slug),
    getProducts()
  ]);

  if (!product) {
    notFound();
  }

  return <ProductPage id={product.id} products={allProducts} />;
}


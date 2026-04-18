import ProductPage from "@/components/product-page";
import { SAMPLE_PRODUCTS } from "@/lib/products-data";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolved = (await params) as { id: string };
  return <ProductPage id={resolved.id} products={SAMPLE_PRODUCTS} />;
}

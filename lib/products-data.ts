import type { Product, StrapiProduct, StrapiCollectionResponse } from '@/lib/types';
import strapi from './strapi';
import { strapiBaseUrl } from './strapi/strapi-base-url';

/**
 * Utility to resolve Strapi media URLs.
 * Handles both relative paths from Strapi and absolute external URLs.
 */
function resolveUrl(url: string | undefined): string {
  if (!url) return '/placeholder.svg'; // Local fallback

  if (url.startsWith('http')) return url;
  return `${strapiBaseUrl()}${url}`;
}

/**
 * Maps a Strapi v5 product object to our local Product type.
 * Ensures strict type safety and provides robust fallbacks.
 */
function mapStrapiProduct(data: StrapiProduct): Product {
  // Strapi v5 image handling: might be an array or a single object depending on populate
  const imageObj = Array.isArray(data.image) ? data.image[0] : data.image;
  const imageUrl = imageObj?.url;

  const categoryName = typeof data.category === 'string' 
    ? data.category 
    : data.category?.name || 'uncategorized';

  return {
    id: data.id,
    documentId: data.documentId,
    slug: data.slug,
    name: data.name || 'Untitled Product',
    price: data.price || 0,
    description: data.description || '',
    category: categoryName,
    image: resolveUrl(imageUrl),
    stock: data.stock || 0,
    rating: data.rating || 0,
    reviews: data.reviews || 0,
    userRatings: data.userRatings || [],
  };
}

/**
 * Fetches all products from Strapi.
 * Supports filtering by category, search, price range, rating, and sorting.
 */
export async function getProducts(options?: { 
  category?: string | null; 
  search?: string | null;
  sort?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  rating?: number | null;
  locale?: string;
}): Promise<Product[]> {
  try {
    const params: Record<string, string | number | boolean | null | undefined> = {
      populate: '*',
      locale: options?.locale || 'en',
    };

    // 1. Basic Filters
    if (options?.category && options.category !== 'all') {
      params['filters[category][name][$eq]'] = options.category;
    }

    if (options?.search) {
      params['filters[name][$containsi]'] = options.search;
    }

    if (options?.minPrice != null) {
      params['filters[price][$gte]'] = options.minPrice;
    }

    if (options?.maxPrice != null) {
      params['filters[price][$lte]'] = options.maxPrice;
    }

    if (options?.rating != null && options.rating > 0) {
      params['filters[rating][$gte]'] = options.rating;
    }

    // 2. Sorting
    // Map internal sort keys to Strapi sort syntax (e.g. price:asc)
    if (options?.sort) {
      const sortMap: Record<string, string> = {
        priceLowHigh: 'price:asc',
        priceHighLow: 'price:desc',
        name: 'name:asc',
        featured: 'updatedAt:desc', // Featured = Recently Updated
      };
      params['sort'] = sortMap[options.sort] || options.sort;
    }

    const response = await strapi.get<StrapiCollectionResponse<StrapiProduct>>('/api/products', { 
      params,
      requiresAuth: false 
    });

    return (response.data.data || []).map(mapStrapiProduct);
  } catch (error) {
    console.error('Error fetching products from Strapi:', error);
    return [];
  }
}

/**
 * Fetches a single product by its slug.
 */
export async function getProductBySlug(slug: string, locale: string = 'en'): Promise<Product | null> {
  try {
    const response = await strapi.get<StrapiCollectionResponse<StrapiProduct>>('/api/products', {
      params: { 
        'filters[slug][$eq]': slug,
        populate: '*', 
        locale 
      },
      requiresAuth: false
    });

    const productData = response.data.data[0];
    if (!productData) return null;
    return mapStrapiProduct(productData);
  } catch (error) {
    console.error(`Error fetching product with slug ${slug} from Strapi:`, error);
    return null;
  }
}

/**
 * Fetches active categories from Strapi.
 */
export async function getCategories(locale: string = 'en'): Promise<string[]> {
  try {
    const response = await strapi.get<StrapiCollectionResponse<{ name: string }>>('/api/categories', {
      params: { locale },
      requiresAuth: false
    });

    const categories = (response.data.data || []).map(cat => cat.name);
    return ['all', ...categories];
  } catch (error) {
    console.error('Error fetching categories from Strapi:', error);
    return ['all'];
  }
}


import { z } from "zod";
import { createParser, createSearchParamsCache } from "nuqs/server";

/**
 * A reusable, ultra-clean helper to bridge Zod and nuqs.
 * This combines the best of both worlds: Zod's powerful validation
 * and nuqs's type-safe URL synchronization.
 */
const parseAsZod = <T>(schema: z.ZodSchema<T>) => createParser({
  parse: (queryValue) => {
    const result = schema.safeParse(queryValue);
    return result.success ? result.data : null;
  },
  serialize: (value) => String(value)
});

// 1. Define the base Zod schema for your filters.
export const filtersSchema = z.object({
  search: z.string().default(""),
  category: z.string().default("all"),
  sort: z.string().default("featured"),
  minPrice: z.coerce.number().min(0).default(0),
  maxPrice: z.coerce.number().min(0).default(5000),
  rating: z.coerce.number().min(0).max(5).default(0),
});

// 2. Map the Zod schema fields to individual nuqs parsers.
// This is the "Creative" bridge that removes redundancy.
export const searchParamsSchema = {
  search: parseAsZod(filtersSchema.shape.search),
  category: parseAsZod(filtersSchema.shape.category),
  sort: parseAsZod(filtersSchema.shape.sort),
  minPrice: parseAsZod(filtersSchema.shape.minPrice),
  maxPrice: parseAsZod(filtersSchema.shape.maxPrice),
  rating: parseAsZod(filtersSchema.shape.rating),
};

export const SORT_OPTIONS = [
  { value: 'featured', label: 'featured' },
  { value: 'priceLowHigh', label: 'priceLowHigh', strapi: 'price:asc' },
  { value: 'priceHighLow', label: 'priceHighLow', strapi: 'price:desc' },
  { value: 'name', label: 'name', strapi: 'name:asc' },
] as const;

export type SortKey = typeof SORT_OPTIONS[number]['value'];
export type Filters = z.infer<typeof filtersSchema>;

// Universal Cache (Server Components use this to parse searchParams)
export const searchParamsCache = createSearchParamsCache(searchParamsSchema);

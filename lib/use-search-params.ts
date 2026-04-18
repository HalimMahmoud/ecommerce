"use client";

import { useCallback } from "react";
import { useQueryStates, parseAsString, parseAsInteger } from "nuqs";

export function useSearchParams() {
  const [params, setParams] = useQueryStates({
    search: parseAsString.withDefault(""),
    category: parseAsString.withDefault("all"),
    sort: parseAsString.withDefault("featured"),
    minPrice: parseAsInteger.withDefault(0),
    maxPrice: parseAsInteger.withDefault(5000),
    rating: parseAsInteger.withDefault(0),
  });

  const setSearch = useCallback(
    (value: string) => setParams({ search: value || null }),
    [setParams],
  );
  const setCategory = useCallback(
    (value: string) => setParams({ category: value }),
    [setParams],
  );
  const setSort = useCallback(
    (value: string) => setParams({ sort: value }),
    [setParams],
  );
  const setMinPrice = useCallback(
    (value: number) => setParams({ minPrice: value }),
    [setParams],
  );
  const setMaxPrice = useCallback(
    (value: number) => setParams({ maxPrice: value }),
    [setParams],
  );
  const setRating = useCallback(
    (value: number) => setParams({ rating: value }),
    [setParams],
  );
  const setPriceRange = useCallback(
    (range: [number, number]) =>
      setParams({ minPrice: range[0], maxPrice: range[1] }),
    [setParams],
  );

  return {
    search: params.search,
    setSearch,
    category: params.category,
    setCategory,
    sort: params.sort,
    setSort,
    minPrice: params.minPrice,
    setMinPrice,
    maxPrice: params.maxPrice,
    setMaxPrice,
    rating: params.rating,
    setRating,
    priceRange: [params.minPrice, params.maxPrice] as [number, number],
    setPriceRange,
  };
}

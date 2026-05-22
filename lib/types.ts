export interface Product {
  id: number;
  documentId?: string;
  slug: string;
  name: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  rating: number;
  reviews: number;
  userRatings: number[];
  description?: string;
}


export interface CartItem extends Product {
  quantity: number;
}


/** Raw Strapi Product shape from API */
export interface StrapiProduct {
  id: number;
  documentId: string;
  slug: string;
  name: string;
  price: number;
  category: string | { name: string };
  stock: number;
  rating: number;
  reviews: number;
  userRatings: number[];
  description?: string;
  image?: {
    url: string;
    formats?: {
      thumbnail?: { url: string };
      small?: { url: string };
      medium?: { url: string };
      large?: { url: string };
    };
  } | Array<{
    url: string;
    formats?: {
      thumbnail?: { url: string };
      small?: { url: string };
      medium?: { url: string };
      large?: { url: string };
    };
  }>;
}

/** Raw Strapi Collection response */
export interface StrapiCollectionResponse<T> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

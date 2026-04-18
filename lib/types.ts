export interface Product {
  id: number;
  nameAr: string;
  nameEn: string;
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

export interface CheckoutData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  paymentMethod: 'cash' | 'card';
}

export type Language = 'en' | 'ar';

/** Generic API response wrapper used by Next.js Route Handlers */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/** Strapi v5 error response shape for typed error parsing */
export interface StrapiErrorResponse {
  error: {
    status: number;
    name: string;
    message: string;
    details?: {
      errors?: Array<{ path: string[]; message: string; name: string }>;
    };
  };
}

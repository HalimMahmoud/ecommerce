import { NextResponse } from 'next/server';
import { SAMPLE_PRODUCTS } from '@/lib/products-data';
import type { ApiResponse, Product } from '@/lib/types';


export async function GET(): Promise<NextResponse<ApiResponse<Product[]>>> {
  try {
    return NextResponse.json({
      success: true,
      data: SAMPLE_PRODUCTS,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

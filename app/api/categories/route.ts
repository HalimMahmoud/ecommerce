import { NextResponse } from 'next/server';
import { SAMPLE_PRODUCTS } from '@/lib/products-data';
import type { ApiResponse } from '@/lib/types';


export async function GET(): Promise<NextResponse<ApiResponse<string[]>>> {
  try {
    const uniqueCategories = ['all', ...new Set(SAMPLE_PRODUCTS.map(p => p.category))];
    return NextResponse.json({
      success: true,
      data: uniqueCategories,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

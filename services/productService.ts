import type { ApiResponse } from '@/types/api'
import type { Product } from '@/types/product'
import type { SFPriceBook } from '@/types/salesforce'

const BASE = '/api'

export async function fetchProducts(region = 'USD', family?: string, search?: string, page: number = 1): Promise<Record<string, Product[]>> {
  const params = new URLSearchParams({ region, page: page.toString() })
  if (family) params.set('family', family)
  if (search) params.set('search', search)
  const res = await fetch(`${BASE}/products?${params}`)
  const json: ApiResponse<Record<string, Product[]>> = await res.json()
  if (!json.success) throw new Error(json.error || 'Failed to fetch products')
  return json.data || {}
}

export async function fetchPriceBooks(): Promise<SFPriceBook[]> {
  const res = await fetch(`${BASE}/price-books`)
  const json: ApiResponse<SFPriceBook[]> = await res.json()
  if (!json.success) throw new Error(json.error || 'Failed to fetch price books')
  return json.data || []
}

export async function fetchFamilies(): Promise<string[]> {
  const res = await fetch(`${BASE}/products/families`)
  const json: ApiResponse<string[]> = await res.json()
  if (!json.success) throw new Error(json.error || 'Failed to fetch product families')
  return json.data || []
}

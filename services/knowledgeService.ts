import type { ApiResponse } from '@/types/api'
import type { SFKnowledgeArticle } from '@/types/salesforce'

const BASE = '/api'

export interface KnowledgeCategory {
  label: string
  name: string
}

export async function fetchKnowledgeCategories(): Promise<KnowledgeCategory[]> {
  const res = await fetch(`${BASE}/knowledge/categories`)
  const json: ApiResponse<KnowledgeCategory[]> = await res.json()
  if (!json.success) throw new Error(json.error || 'Failed to fetch categories')
  return json.data || []
}

export async function fetchKnowledgeArticles(search?: string, category?: string): Promise<SFKnowledgeArticle[]> {
  const p = new URLSearchParams()
  if (search) p.set('search', search)
  if (category) p.set('category', category)
  const res = await fetch(`${BASE}/knowledge?${p}`)
  const json: ApiResponse<SFKnowledgeArticle[]> = await res.json()
  if (!json.success) throw new Error(json.error || 'Failed to fetch articles')
  return json.data || []
}

export async function fetchFeaturedArticles(): Promise<SFKnowledgeArticle[]> {
  const res = await fetch(`${BASE}/knowledge?featured=true`)
  const json: ApiResponse<SFKnowledgeArticle[]> = await res.json()
  if (!json.success) throw new Error(json.error || 'Failed to fetch featured articles')
  return json.data || []
}

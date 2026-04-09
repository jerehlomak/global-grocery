import type { ApiResponse } from '@/types/api'
import type { SFQuote } from '@/types/salesforce'

const BASE = '/api'

export async function fetchQuotes(opportunityId?: string): Promise<SFQuote[]> {
  const p = new URLSearchParams()
  if (opportunityId) p.set('opportunityId', opportunityId)
  const res = await fetch(`${BASE}/quotes?${p}`)
  const json: ApiResponse<SFQuote[]> = await res.json()
  if (!json.success) throw new Error(json.error || 'Failed to fetch quotes')
  return json.data || []
}

export async function createQuote(data: { opportunityId: string; name: string; expirationDate?: string; discount?: number }): Promise<Partial<SFQuote>> {
  const res = await fetch(`${BASE}/quotes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  const json: ApiResponse<Partial<SFQuote>> = await res.json()
  if (!json.success) throw new Error(json.error || 'Failed to create quote')
  return json.data!
}

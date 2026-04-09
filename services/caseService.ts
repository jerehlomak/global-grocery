import type { ApiResponse } from '@/types/api'
import type { SFCase } from '@/types/salesforce'

const BASE = '/api'

export async function fetchCases(contactId?: string): Promise<SFCase[]> {
  const p = new URLSearchParams()
  if (contactId) p.set('contactId', contactId)
  const res = await fetch(`${BASE}/cases?${p}`)
  const json: ApiResponse<SFCase[]> = await res.json()
  if (!json.success) throw new Error(json.error || 'Failed to fetch cases')
  return json.data || []
}

export async function createCase(data: { subject: string; description?: string; priority?: string; origin?: string; type?: string; contactId?: string; accountId?: string }): Promise<Partial<SFCase>> {
  const res = await fetch(`${BASE}/cases`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  const json: ApiResponse<Partial<SFCase>> = await res.json()
  if (!json.success) throw new Error(json.error || 'Failed to create case')
  return json.data!
}

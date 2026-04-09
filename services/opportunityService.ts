import type { ApiResponse } from '@/types/api'
import type { SFOpportunity, SFOpportunityStage } from '@/types/salesforce'
import type { CartItem } from '@/types/cart'

const BASE = '/api'

export async function fetchOpportunities(params: { contactId?: string; accountId?: string } = {}): Promise<SFOpportunity[]> {
  const p = new URLSearchParams()
  if (params.contactId) p.set('contactId', params.contactId)
  if (params.accountId) p.set('accountId', params.accountId)
  const res = await fetch(`${BASE}/opportunities?${p}`)
  const json: ApiResponse<SFOpportunity[]> = await res.json()
  if (!json.success) throw new Error(json.error || 'Failed to fetch opportunities')
  return json.data || []
}

export async function fetchOpportunity(id: string): Promise<SFOpportunity> {
  const res = await fetch(`${BASE}/opportunities/${id}`)
  const json: ApiResponse<SFOpportunity> = await res.json()
  if (!json.success) throw new Error(json.error || 'Not found')
  return json.data!
}

export async function createOpportunity(data: {
  name: string; accountId?: string; contactId?: string; stageName?: string;
  closeDate: string; amount: number; priceBook2Id?: string; leadSource?: string;
  lineItems: CartItem[];
}): Promise<Partial<SFOpportunity>> {
  const res = await fetch(`${BASE}/opportunities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const json: ApiResponse<Partial<SFOpportunity>> = await res.json()
  if (!json.success) throw new Error(json.error || 'Failed to create opportunity')
  return json.data!
}

export async function updateOpportunity(id: string, data: Partial<SFOpportunity>): Promise<void> {
  const res = await fetch(`${BASE}/opportunities/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const json: ApiResponse = await res.json()
  if (!json.success) throw new Error(json.error || 'Failed to update opportunity')
}

export async function fetchStages(): Promise<SFOpportunityStage[]> {
  const res = await fetch(`${BASE}/stages`)
  const json: ApiResponse<SFOpportunityStage[]> = await res.json()
  if (!json.success) throw new Error(json.error)
  return json.data || []
}

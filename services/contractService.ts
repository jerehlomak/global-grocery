import type { ApiResponse } from '@/types/api'
import type { SFContract } from '@/types/salesforce'

const BASE = '/api'

export async function fetchContracts(accountId?: string): Promise<SFContract[]> {
  const p = new URLSearchParams()
  if (accountId) p.set('accountId', accountId)
  const res = await fetch(`${BASE}/contracts?${p}`)
  const json: ApiResponse<SFContract[]> = await res.json()
  if (!json.success) throw new Error(json.error || 'Failed to fetch contracts')
  return json.data || []
}

export async function createContract(data: { accountId: string; startDate: string; contractTerm?: number; description?: string }): Promise<Partial<SFContract>> {
  const res = await fetch(`${BASE}/contracts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  const json: ApiResponse<Partial<SFContract>> = await res.json()
  if (!json.success) throw new Error(json.error || 'Failed to create contract')
  return json.data!
}

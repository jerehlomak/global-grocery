import type { ApiResponse } from '@/types/api'
import type { SFOrder } from '@/types/salesforce'

const BASE = '/api'

export async function fetchOrders(accountId?: string): Promise<SFOrder[]> {
  const p = new URLSearchParams()
  if (accountId) p.set('accountId', accountId)
  const res = await fetch(`${BASE}/orders?${p}`)
  const json: ApiResponse<SFOrder[]> = await res.json()
  if (!json.success) throw new Error(json.error || 'Failed to fetch orders')
  return json.data || []
}

export async function createOrder(data: { accountId?: string; opportunityId?: string; effectiveDate: string; status?: string }): Promise<Partial<SFOrder>> {
  const res = await fetch(`${BASE}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  const json: ApiResponse<Partial<SFOrder>> = await res.json()
  if (!json.success) throw new Error(json.error || 'Failed to create order')
  return json.data!
}

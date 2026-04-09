import type { ApiResponse } from '@/types/api'
import type { SFCampaign } from '@/types/salesforce'

const BASE = '/api'

export async function fetchCampaigns(): Promise<SFCampaign[]> {
  const res = await fetch(`${BASE}/campaigns`)
  const json: ApiResponse<SFCampaign[]> = await res.json()
  if (!json.success) throw new Error(json.error || 'Failed to fetch campaigns')
  return json.data || []
}

import type { ApiResponse } from '@/types/api'
import type { SFLead } from '@/types/salesforce'

const BASE = '/api'

export async function createLead(data: {
  firstName: string; lastName: string; email: string;
  phone?: string; company?: string; leadSource?: string;
  campaignId?: string; country?: string;
}): Promise<Partial<SFLead>> {
  const res = await fetch(`${BASE}/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const json: ApiResponse<Partial<SFLead>> = await res.json()
  if (!json.success) throw new Error(json.error || 'Failed to create lead')
  return json.data!
}

export async function convertLead(leadId: string, options: {
  convertedStatus?: string; createOpportunity?: boolean; opportunityName?: string;
}): Promise<{ accountId: string; contactId: string; opportunityId?: string }> {
  const res = await fetch(`${BASE}/leads/${leadId}/convert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options),
  })
  const json: ApiResponse<{ accountId: string; contactId: string; opportunityId?: string }> = await res.json()
  if (!json.success) throw new Error(json.error || 'Failed to convert lead')
  return json.data!
}

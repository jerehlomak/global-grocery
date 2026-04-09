import { type NextRequest } from 'next/server'
import { apiSuccess, apiError, isMockMode } from '@/lib/api/helpers'
import { MOCK_OPPORTUNITY_STAGES } from '@/lib/salesforce/mock-data'
import { sfGetPicklistValues } from '@/lib/salesforce/client'

export async function GET(_request: NextRequest) {
  try {
    if (isMockMode()) {
      return apiSuccess(MOCK_OPPORTUNITY_STAGES, { source: 'mock' })
    }
    // LIVE SF: Get Opportunity picklist values for StageName field
    const stages = await sfGetPicklistValues('Opportunity', 'StageName')
    return apiSuccess(stages, { source: 'salesforce' })
  } catch (err) {
    console.error('[/api/stages]', err)
    return apiError('Failed to fetch stages', 500)
  }
}

import { type NextRequest } from 'next/server'
import { apiSuccess, apiError, isMockMode } from '@/lib/api/helpers'
import { MOCK_CAMPAIGNS } from '@/lib/salesforce/mock-data'
import { sfQuery } from '@/lib/salesforce/client'
import type { SFCampaign } from '@/types/salesforce'

export async function GET(_request: NextRequest) {
  try {
    if (isMockMode()) {
      return apiSuccess(MOCK_CAMPAIGNS, { total: MOCK_CAMPAIGNS.length, source: 'mock' })
    }
    const result = await sfQuery<SFCampaign>(
      'SELECT Id, Name, Type, Status, StartDate, EndDate, BudgetedCost, ActualCost, ExpectedRevenue, NumberOfLeads, NumberOfContacts, NumberOfConvertedLeads, IsActive, Description FROM Campaign ORDER BY StartDate DESC LIMIT 50'
    )
    return apiSuccess(result.records, { total: result.totalSize, source: 'salesforce' })
  } catch (err) { return apiError('Failed to fetch campaigns', 500) }
}

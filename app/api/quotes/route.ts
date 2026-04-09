import { type NextRequest } from 'next/server'
import { apiSuccess, apiError, isMockMode } from '@/lib/api/helpers'
import { MOCK_QUOTES } from '@/lib/salesforce/mock-data'
import { sfQuery, sfCreate } from '@/lib/salesforce/client'
import type { SFQuote } from '@/types/salesforce'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const opportunityId = searchParams.get('opportunityId')

    if (isMockMode()) {
      let quotes = MOCK_QUOTES
      if (opportunityId) quotes = quotes.filter((q) => q.OpportunityId === opportunityId)
      return apiSuccess(quotes, { total: quotes.length, source: 'mock' })
    }

    let soql = 'SELECT Id, Name, OpportunityId, Opportunity.Name, Opportunity.StageName, Status, ExpirationDate, TotalPrice, GrandTotal, Discount, IsSyncing, CreatedDate, LastModifiedDate FROM Quote ORDER BY CreatedDate DESC LIMIT 50'
    if (opportunityId) soql = soql.replace('FROM Quote', 'FROM Quote WHERE OpportunityId = \'' + opportunityId + '\'')
    const result = await sfQuery<SFQuote>(soql)
    return apiSuccess(result.records, { total: result.totalSize, source: 'salesforce' })
  } catch (err) { return apiError('Failed to fetch quotes', 500) }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { opportunityId, name, expirationDate, discount, description } = body
    if (!opportunityId || !name) return apiError('opportunityId and name are required')

    if (isMockMode()) {
      const quote: Partial<SFQuote> = {
        Id: '0Q0' + Date.now(), Name: name, OpportunityId: opportunityId,
        Status: 'Draft', ExpirationDate: expirationDate, Discount: discount,
        Description: description, IsSyncing: false,
        CreatedDate: new Date().toISOString(), LastModifiedDate: new Date().toISOString(),
      }
      return apiSuccess(quote, { source: 'mock' })
    }

    const result = await sfCreate('Quote', { Name: name, OpportunityId: opportunityId, ExpirationDate: expirationDate, Discount: discount, Description: description })
    return apiSuccess({ id: result.id, success: result.success }, { source: 'salesforce' })
  } catch (err) { return apiError('Failed to create quote', 500) }
}

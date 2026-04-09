import { type NextRequest } from 'next/server'
import { apiSuccess, apiError, isMockMode } from '@/lib/api/helpers'
import { MOCK_OPPORTUNITIES } from '@/lib/salesforce/mock-data'
import { sfQuery, sfCreate } from '@/lib/salesforce/client'
import type { SFOpportunity } from '@/types/salesforce'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const contactId = searchParams.get('contactId')
    const accountId = searchParams.get('accountId')

    if (isMockMode()) {
      let opps = MOCK_OPPORTUNITIES
      if (contactId) opps = opps.filter((o) => o.ContactId === contactId)
      if (accountId) opps = opps.filter((o) => o.AccountId === accountId)
      return apiSuccess(opps, { total: opps.length, source: 'mock' })
    }

    let soql = 'SELECT Id, Name, AccountId, Account.Name, StageName, CloseDate, Amount, Probability, LeadSource, PriceBook2Id, OwnerId, CreatedDate, LastModifiedDate FROM Opportunity ORDER BY CreatedDate DESC LIMIT 100'
    if (contactId) soql = soql.replace('FROM Opportunity', 'FROM Opportunity WHERE ContactId = \'' + contactId + '\'')

    const result = await sfQuery<SFOpportunity>(soql)
    return apiSuccess(result.records, { total: result.totalSize, source: 'salesforce' })
  } catch (err) { return apiError('Failed to fetch opportunities', 500) }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, accountId, contactId, stageName = 'Prospecting', closeDate, amount, priceBook2Id, leadSource, description, lineItems = [] } = body
    if (!name || !closeDate) return apiError('name and closeDate are required')

    if (isMockMode()) {
      const opp: Partial<SFOpportunity> = {
        Id: '006' + Date.now(), Name: name, AccountId: accountId, ContactId: contactId,
        StageName: stageName, CloseDate: closeDate, Amount: amount,
        Probability: 10, LeadSource: leadSource, PriceBook2Id: priceBook2Id,
        Description: description, OwnerId: '005000001',
        CreatedDate: new Date().toISOString(), LastModifiedDate: new Date().toISOString(),
      }
      return apiSuccess({ opportunity: opp, lineItems }, { source: 'mock' })
    }

    // LIVE SF: Create Opportunity then add OpportunityLineItems
    const result = await sfCreate('Opportunity', {
      Name: name, AccountId: accountId, StageName: stageName,
      CloseDate: closeDate, Amount: amount, LeadSource: leadSource,
      Pricebook2Id: priceBook2Id, Description: description,
    })
    return apiSuccess({ id: result.id, success: result.success }, { source: 'salesforce' })
  } catch (err) { return apiError('Failed to create opportunity', 500) }
}

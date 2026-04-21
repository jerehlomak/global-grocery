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

    const conditions: string[] = []
    if (contactId) conditions.push(`ContactId = '${contactId}'`)
    if (accountId) conditions.push(`AccountId = '${accountId}'`)

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const soql = `SELECT Id, Name, AccountId, Account.Name, StageName, CloseDate, Amount, Probability, LeadSource, PriceBook2Id, OwnerId, CreatedDate, LastModifiedDate FROM Opportunity ${whereClause} ORDER BY CreatedDate DESC LIMIT 100`
    const result = await sfQuery<SFOpportunity>(soql)
    return apiSuccess(result.records, { total: result.totalSize, source: 'salesforce' })
  } catch (err: any) {
    console.error('[GET /api/opportunities]', err)
    return apiError('Failed to fetch opportunities: ' + err.message, 500)
  }
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

    // LIVE SF: Resolve the active Standard Price Book first
    let resolvedPricebookId = (priceBook2Id && priceBook2Id.length >= 15) ? priceBook2Id : null

    if (!resolvedPricebookId) {
      try {
        const pbResult = await sfQuery<any>('SELECT Id FROM Pricebook2 WHERE IsStandard = true AND IsActive = true LIMIT 1')
        if (pbResult.totalSize > 0) resolvedPricebookId = pbResult.records[0].Id
      } catch (e) {
        console.error('Could not resolve Standard Price Book:', e)
      }
    }

    // LIVE SF: Create Opportunity
    const oppPayload: any = {
      Name: name, AccountId: accountId, StageName: stageName,
      CloseDate: closeDate, Amount: amount, LeadSource: leadSource,
      Description: description,
    }

    // Note: Do NOT set Pricebook2Id or CurrencyIsoCode here.
    // Salesforce will auto-assign the Standard Price Book.
    // Setting CurrencyIsoCode fails on orgs without multi-currency.

    const result = await sfCreate('Opportunity', oppPayload)

    // Add OpportunityLineItems — resolve PricebookEntry from SF using Product2Id
    if (result.success && lineItems && lineItems.length > 0) {
      const product2Ids = lineItems
        .map((i: any) => i.productId)
        .filter(Boolean)
        .map((id: string) => `'${id}'`)
        .join(',')

      let entryMap: Map<string, string> = new Map()
      if (product2Ids && resolvedPricebookId) {
        try {
          const entryResult = await sfQuery<any>(
            `SELECT Id, Product2Id FROM PricebookEntry WHERE Pricebook2Id = '${resolvedPricebookId}' AND Product2Id IN (${product2Ids}) AND IsActive = true`
          )
          entryResult.records.forEach((e: any) => entryMap.set(e.Product2Id, e.Id))
        } catch (e: any) {
          console.error('Could not resolve PricebookEntries:', e.message)
        }
      }

      for (const item of lineItems) {
        const pricebookEntryId = entryMap.get(item.productId) || item.priceBookEntryId
        if (!pricebookEntryId) {
          console.warn('Skipping line item, no PricebookEntry found for product:', item.productId)
          continue
        }
        try {
          await sfCreate('OpportunityLineItem', {
            OpportunityId: result.id,
            PricebookEntryId: pricebookEntryId,
            Quantity: item.quantity,
            UnitPrice: item.unitPrice
          })
        } catch (err: any) {
          console.error('Failed to add OpportunityLineItem:', err.message || err)
        }
      }
    }

    return apiSuccess({ id: result.id, success: result.success }, { source: 'salesforce' })
  } catch (err: any) {
    console.error('[POST /api/opportunities]', err)
    return apiError(err.message || 'Failed to create opportunity', 500)
  }
}

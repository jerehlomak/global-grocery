import { type NextRequest } from 'next/server'
import { apiSuccess, apiError, isMockMode } from '@/lib/api/helpers'
import { MOCK_QUOTES } from '@/lib/salesforce/mock-data'
import { sfQuery, sfCreate } from '@/lib/salesforce/client'
import type { SFQuote } from '@/types/salesforce'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const opportunityId = searchParams.get('opportunityId')
    const accountId = searchParams.get('accountId')

    if (isMockMode()) {
      let quotes = MOCK_QUOTES
      if (opportunityId) quotes = quotes.filter((q) => q.OpportunityId === opportunityId)
      return apiSuccess(quotes, { total: quotes.length, source: 'mock' })
    }

    const conditions: string[] = []
    if (opportunityId) conditions.push(`OpportunityId = '${opportunityId}'`)
    if (accountId) conditions.push(`Opportunity.AccountId = '${accountId}'`)

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const soql = `SELECT Id, Name, OpportunityId, Opportunity.Name, Opportunity.StageName, Opportunity.AccountId, Status, ExpirationDate, TotalPrice, GrandTotal, Discount, IsSyncing, CreatedDate, LastModifiedDate FROM Quote ${whereClause} ORDER BY CreatedDate DESC LIMIT 50`
    const result = await sfQuery<SFQuote>(soql)
    return apiSuccess(result.records, { total: result.totalSize, source: 'salesforce' })
  } catch (err: any) {
    console.error('[GET /api/quotes]', err)
    return apiError('Failed to fetch quotes: ' + err.message, 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { opportunityId, name, expirationDate, discount, description, lineItems = [] } = body
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

    // Fetch Pricebook2Id from the linked Opportunity so Quote inherits the same book
    let resolvedPricebookId: string | null = null
    try {
      const oppResult = await sfQuery<any>(`SELECT Pricebook2Id FROM Opportunity WHERE Id = '${opportunityId}' LIMIT 1`)
      if (oppResult.totalSize > 0) resolvedPricebookId = oppResult.records[0].Pricebook2Id
    } catch (e: any) {
      console.error('Could not fetch Opportunity Pricebook2Id:', e.message)
    }

    // Fallback: query Standard Price Book
    if (!resolvedPricebookId) {
      try {
        const pbResult = await sfQuery<any>('SELECT Id FROM Pricebook2 WHERE IsStandard = true AND IsActive = true LIMIT 1')
        if (pbResult.totalSize > 0) resolvedPricebookId = pbResult.records[0].Id
      } catch (e) {
        console.error('Could not resolve Standard Price Book:', e)
      }
    }

    const payload: any = { Name: name, OpportunityId: opportunityId, ExpirationDate: expirationDate, Discount: discount, Description: description }
    // Note: Do NOT set CurrencyIsoCode — fails on orgs without multi-currency enabled.

    const result = await sfCreate('Quote', payload)

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
          console.error('Could not resolve PricebookEntries for Quote:', e.message)
        }
      }

      for (const item of lineItems) {
        const pricebookEntryId = entryMap.get(item.productId) || item.priceBookEntryId
        if (!pricebookEntryId) {
          console.warn('Skipping QuoteLineItem, no PricebookEntry for product:', item.productId)
          continue
        }
        try {
          await sfCreate('QuoteLineItem', {
            QuoteId: result.id,
            PricebookEntryId: pricebookEntryId,
            Quantity: item.quantity,
            UnitPrice: item.unitPrice
          })
        } catch (err: any) {
          console.error('Failed to add QuoteLineItem:', err.message || err)
        }
      }
    }

    return apiSuccess({ id: result.id, success: result.success }, { source: 'salesforce' })
  } catch (err: any) {
    console.error('[POST /api/quotes]', err)
    return apiError(err.message || 'Failed to create quote', 500)
  }
}

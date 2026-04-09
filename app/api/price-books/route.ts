import { type NextRequest } from 'next/server'
import { apiSuccess, apiError, isMockMode } from '@/lib/api/helpers'
import { MOCK_PRICE_BOOKS } from '@/lib/salesforce/mock-data'
import { sfQuery } from '@/lib/salesforce/client'
import type { SFPriceBook } from '@/types/salesforce'

export async function GET(_request: NextRequest) {
  try {
    if (isMockMode()) {
      return apiSuccess(MOCK_PRICE_BOOKS, { source: 'mock' })
    }
    // LIVE SF: SELECT Id, Name, IsActive, IsStandard, Description FROM Pricebook2 WHERE IsActive = TRUE
    const result = await sfQuery<SFPriceBook>('SELECT Id, Name, IsActive, IsStandard, Description FROM Pricebook2 WHERE IsActive = TRUE')
    return apiSuccess(result.records, { total: result.totalSize, source: 'salesforce' })
  } catch (err) {
    console.error('[/api/price-books]', err)
    return apiError('Failed to fetch price books', 500)
  }
}

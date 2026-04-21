import { type NextRequest } from 'next/server'
import { apiSuccess, apiError, isMockMode } from '@/lib/api/helpers'
import { MOCK_PRICE_BOOKS } from '@/lib/salesforce/mock-data'
import { sfQuery } from '@/lib/salesforce/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const standardOnly = searchParams.get('standardOnly') === 'true'

    if (isMockMode()) {
      const books = standardOnly
        ? MOCK_PRICE_BOOKS.filter(pb => pb.IsStandard)
        : MOCK_PRICE_BOOKS
      return apiSuccess(books, { total: books.length, source: 'mock' })
    }

    const whereClause = standardOnly
      ? `WHERE IsStandard = true AND IsActive = true`
      : `WHERE IsActive = true`

    const result = await sfQuery<any>(`SELECT Id, Name, IsStandard, IsActive FROM Pricebook2 ${whereClause} LIMIT 50`)
    return apiSuccess(result.records, { total: result.totalSize, source: 'salesforce' })
  } catch (err: any) {
    console.error('[/api/price-books]', err)
    return apiError('Failed to fetch price books: ' + err.message, 500)
  }
}

import { type NextRequest } from 'next/server'
import { apiSuccess, apiError, isMockMode } from '@/lib/api/helpers'
import { getMockEntriesForPriceBook, getMockPriceBookByRegion } from '@/lib/salesforce/mock-data'
import { sfFetch } from '@/lib/salesforce/client'
import type { SFPriceBookEntry } from '@/types/salesforce'
import type { Product } from '@/types/product'

// const FAMILY_IMAGES: Record<string, string> = {
//   'Grains & Cereals': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80',
//   'Oils & Condiments': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80',
//   'Beverages': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80',
//   'Spreads & Sweeteners': 'https://images.unsplash.com/photo-1587049352847-81a56d773cee?w=400&q=80',
//   'Seafood': 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=400&q=80',
//   'Dairy': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&q=80',
//   'Fruits & Vegetables': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80',
//   'Bakery': 'https://images.unsplash.com/photo-1549931319-a545dcf3bc7b?w=400&q=80',
//   'default': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80',
// }

// function getImage(family: string): string {
//   return FAMILY_IMAGES[family] || FAMILY_IMAGES.default
// }

function entriesToProducts(entries: SFPriceBookEntry[]): Product[] {
  const image = ''
  return entries.map((entry) => {
    // Determine image from either Salesforce custom field or fallback
    const salesforceImage = entry.Product2.DisplayUrl as string | undefined
    return {
      id: entry.Product2Id,
      name: entry.Product2.Name,
      productCode: entry.Product2.ProductCode,
      description: entry.Product2.Description,
      family: entry.Product2.Family,
      imageUrl: salesforceImage || image as string,
      isActive: entry.Product2.IsActive,
      unitPrice: entry.UnitPrice,
      currency: entry.CurrencyIsoCode,
      priceBookEntryId: entry.Id,
      sfProduct: entry.Product2,
      sfPriceBookEntry: entry,
    }
  })
}

function groupProducts(products: Product[]): Record<string, Product[]> {
  return products.reduce((acc, product) => {
    const key = product.family || "Other"
    if (!acc[key]) acc[key] = []
    acc[key].push(product)
    return acc
  }, {} as Record<string, Product[]>)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const region = searchParams.get('region') || 'USD'
    const family = searchParams.get('family')
    const search = searchParams.get('search')
    const pageStr = searchParams.get('page') || '1'
    const page = parseInt(pageStr, 10)
    const limit = 10
    const offset = Math.max(0, (page - 1) * limit)

    // ================= MOCK MODE =================
    if (isMockMode()) {
      const priceBook = getMockPriceBookByRegion(region)
      if (!priceBook) return apiError('No price book for region', 404)

      const currency =
        priceBook.Id === '01s000002' ? 'EUR' :
          priceBook.Id === '01s000003' ? 'NGN' :
            'USD'

      let entries = getMockEntriesForPriceBook(priceBook.Id)

      if (family) {
        entries = entries.filter((e) => e.Product2.Family === family)
      }

      if (search) {
        const q = search.toLowerCase()
        entries = entries.filter(
          (e) =>
            e.Product2.Name.toLowerCase().includes(q) ||
            e.Product2.Description.toLowerCase().includes(q)
        )
      }

      const paginatedEntries = entries.slice(offset, offset + limit)
      const products = entriesToProducts(paginatedEntries)
      const grouped = groupProducts(products)

      return apiSuccess(grouped, {
        total: entries.length,
        region,
        source: 'mock',
      })
    }

    // ================= LIVE SALESFORCE =================

    // Filter strictly by the selected currency (USD, CAD, NGN)
    // We assume the org uses Standard Price Book entries designated by currency
    let whereClauses = [`IsActive = TRUE`, `CurrencyIsoCode = '${region}'`]

    if (family) {
      whereClauses.push(`Product2.Family = '${family}'`)
    }

    if (search) {
      const q = search.replace(/'/g, "\\'")
      whereClauses.push(
        `(Product2.Name LIKE '%${q}%' OR Product2.Description LIKE '%${q}%')`
      )
    }

    const soql = `
      SELECT 
        Id, 
        UnitPrice, 
        CurrencyIsoCode, 
        Product2Id, 
        Product2.Name, 
        Product2.ProductCode, 
        Product2.Description, 
        Product2.Family, 
        Product2.IsActive,
        Product2.DisplayUrl
      FROM PricebookEntry 
      WHERE ${whereClauses.join(' AND ')}
      ORDER BY Product2.Name ASC
    `

    const data = await sfFetch(
      `/services/data/v62.0/query?q=${encodeURIComponent(soql)}`
    )

    // Deduplicate by ProductCode as requested by the user to prevent duplicate display of the same product
    const uniqueRecordsMap = new Map()
    data.records.forEach((record: any) => {
      const pCode = record.Product2?.ProductCode
      if (pCode && !uniqueRecordsMap.has(pCode)) {
        uniqueRecordsMap.set(pCode, record)
      }
    })
    const deduplicatedRecords = Array.from(uniqueRecordsMap.values())

    // Apply limit and offset in JS since we had to deduplicate
    const paginatedRecords = deduplicatedRecords.slice(offset, offset + limit)

    const products = entriesToProducts(paginatedRecords)
    const grouped = groupProducts(products)

    return apiSuccess(grouped, {
      total: deduplicatedRecords.length,
      region,
      source: 'salesforce',
    })

  } catch (err: any) {
    console.error('[/api/products]', err)
    return apiError('Failed to fetch products: ' + err.message, 500)
  }
}
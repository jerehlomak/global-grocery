import { NextResponse } from 'next/server'
import { apiSuccess, apiError, isMockMode } from '@/lib/api/helpers'
import { sfFetch } from '@/lib/salesforce/client'

const MOCK_FAMILIES = ['Grains & Cereals', 'Fruits & Vegetables', 'Dairy', 'Seafood', 'Beverages', 'Bakery', 'Oils & Condiments', 'Spreads & Sweeteners']

export async function GET() {
  try {
    if (isMockMode()) {
      return apiSuccess(MOCK_FAMILIES, { source: 'mock' })
    }

    // Fetch the raw object metadata to retrieve ALL configured picklist categories
    const data = await sfFetch(`/services/data/v62.0/sobjects/Product2/describe`)
    
    // Find the 'Family' field
    const familyField = data.fields?.find((f: any) => f.name === 'Family')
    
    // Extract labels, ignoring the literal 'None' placeholder
    let families: string[] = []
    if (familyField && familyField.picklistValues) {
      families = familyField.picklistValues
        .map((pv: any) => pv.label)
        .filter((label: string) => label && label !== 'None')
    }

    return apiSuccess(families, { source: 'salesforce', total: families.length })
  } catch (err: any) {
    console.error('[/api/products/families]', err)
    return apiError('Failed to fetch product families: ' + err.message, 500)
  }
}

import { type NextRequest } from 'next/server'
import { apiSuccess, apiError, isMockMode } from '@/lib/api/helpers'
import { sfQuery } from '@/lib/salesforce/client'

export async function GET(request: NextRequest) {
  try {
    if (isMockMode()) {
      return apiSuccess([
        { Id: 'mock-camp-1', Name: 'Summer Grocery Expo', Description: 'Join us for exclusive summer deals.', StartDate: '2026-06-01', IsActive: true },
        { Id: 'mock-camp-2', Name: 'B2B Partner Onboarding', Description: 'Learn how to scale with our regional nodes.', StartDate: '2026-07-15', IsActive: true }
      ], { source: 'mock' })
    }

    const query = `
      SELECT Id, Name, Description, StartDate, EndDate, IsActive 
      FROM Campaign 
      WHERE IsActive = true 
      ORDER BY StartDate DESC NULLS LAST 
      LIMIT 12
    `
    const result = await sfQuery<any>(query)
    
    return apiSuccess(result.records, { source: 'salesforce' })
  } catch (err) {
    console.error('[/api/campaigns]', err)
    return apiError('Failed to fetch active campaigns', 500)
  }
}

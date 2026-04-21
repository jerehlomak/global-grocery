import { type NextRequest } from 'next/server'
import { apiSuccess, apiError, isMockMode } from '@/lib/api/helpers'
import { MOCK_ORDERS } from '@/lib/salesforce/mock-data'
import { sfQuery, sfCreate } from '@/lib/salesforce/client'
import type { SFOrder } from '@/types/salesforce'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const accountId = searchParams.get('accountId')

    if (isMockMode()) {
      let orders = MOCK_ORDERS
      if (accountId) orders = orders.filter((o) => o.AccountId === accountId)
      return apiSuccess(orders, { total: orders.length, source: 'mock' })
    }

    let soql = 'SELECT Id, AccountId, OpportunityId, ContractId, Status, EffectiveDate, OrderedDate, CreatedDate FROM Order'
    if (accountId) soql += ` WHERE AccountId = '${accountId}'`
    soql += ' ORDER BY CreatedDate DESC LIMIT 100'

    const result = await sfQuery<SFOrder>(soql)
    return apiSuccess(result.records, { total: result.totalSize, source: 'salesforce' })
  } catch (err: any) { 
    console.error('[GET /api/orders] Error:', err.message || err)
    return apiError('Failed to fetch orders: ' + (err.message || 'Unknown error'), 500) 
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { accountId, effectiveDate, status = 'Draft', description } = body
    if (!effectiveDate) return apiError('effectiveDate is required')
    if (!accountId) return apiError('accountId is required')

    if (isMockMode()) {
      const order: Partial<SFOrder> = {
        Id: '801' + Date.now(), AccountId: accountId, OpportunityId: '006' + Date.now(),
        Status: status, EffectiveDate: effectiveDate, Description: description,
        CreatedDate: new Date().toISOString(),
      }
      return apiSuccess(order, { source: 'mock' })
    }

    // Automatically generate an Opportunity for the Order funnel tracking
    const oppResult = await sfCreate('Opportunity', {
      Name: `New Order Pipeline - ${new Date().toLocaleDateString()}`,
      AccountId: accountId,
      StageName: 'Qualification', // Standard Salesforce sales stage
      CloseDate: effectiveDate
    })

    // Create the Order and directly link it to the generated Opportunity
    const result = await sfCreate('Order', { 
      AccountId: accountId, 
      OpportunityId: oppResult.id,
      Status: status, 
      EffectiveDate: effectiveDate, 
      Description: description 
    })
    
    return apiSuccess({ id: result.id, opportunityId: oppResult.id, success: result.success }, { source: 'salesforce' })
  } catch (err: any) { 
    console.error('[/api/orders] CREATE error:', err)
    return apiError('Failed to create order and opportunity: ' + (err.message || 'Unknown error'), 500) 
  }
}

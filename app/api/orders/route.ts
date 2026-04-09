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

    const soql = 'SELECT Id, AccountId, OpportunityId, ContractId, Status, TotalAmount, EffectiveDate, OrderedDate, CreatedDate FROM Order ORDER BY CreatedDate DESC LIMIT 100'
    const result = await sfQuery<SFOrder>(soql)
    return apiSuccess(result.records, { total: result.totalSize, source: 'salesforce' })
  } catch (err) { return apiError('Failed to fetch orders', 500) }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { accountId, opportunityId, effectiveDate, status = 'Draft', description } = body
    if (!effectiveDate) return apiError('effectiveDate is required')

    if (isMockMode()) {
      const order: Partial<SFOrder> = {
        Id: '801' + Date.now(), AccountId: accountId, OpportunityId: opportunityId,
        Status: status, EffectiveDate: effectiveDate, Description: description,
        CreatedDate: new Date().toISOString(),
      }
      return apiSuccess(order, { source: 'mock' })
    }

    const result = await sfCreate('Order', { AccountId: accountId, Status: status, EffectiveDate: effectiveDate, Description: description })
    return apiSuccess({ id: result.id, success: result.success }, { source: 'salesforce' })
  } catch (err) { return apiError('Failed to create order', 500) }
}

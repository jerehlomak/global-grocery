import { type NextRequest } from 'next/server'
import { apiSuccess, apiError, isMockMode } from '@/lib/api/helpers'
import { MOCK_CONTRACTS } from '@/lib/salesforce/mock-data'
import { sfQuery, sfCreate } from '@/lib/salesforce/client'
import type { SFContract } from '@/types/salesforce'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const accountId = searchParams.get('accountId')

    if (isMockMode()) {
      let contracts = MOCK_CONTRACTS
      if (accountId) contracts = contracts.filter((c) => c.AccountId === accountId)
      return apiSuccess(contracts, { total: contracts.length, source: 'mock' })
    }

    const soql = 'SELECT Id, AccountId, Status, StartDate, ContractTerm, EndDate, TotalAmount, Description, OwnerId, CreatedDate FROM Contract ORDER BY CreatedDate DESC LIMIT 50'
    const result = await sfQuery<SFContract>(soql)
    return apiSuccess(result.records, { total: result.totalSize, source: 'salesforce' })
  } catch (err) { return apiError('Failed to fetch contracts', 500) }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { accountId, startDate, contractTerm = 12, description } = body
    if (!accountId || !startDate) return apiError('accountId and startDate are required')

    if (isMockMode()) {
      const contract: Partial<SFContract> = {
        Id: '800' + Date.now(), AccountId: accountId, Status: 'Draft',
        StartDate: startDate, ContractTerm: contractTerm,
        Description: description, OwnerId: '005000001',
        CreatedDate: new Date().toISOString(), LastModifiedDate: new Date().toISOString(),
      }
      return apiSuccess(contract, { source: 'mock' })
    }

    const result = await sfCreate('Contract', { AccountId: accountId, StartDate: startDate, ContractTerm: contractTerm, Status: 'Draft', Description: description })
    return apiSuccess({ id: result.id, success: result.success }, { source: 'salesforce' })
  } catch (err) { return apiError('Failed to create contract', 500) }
}

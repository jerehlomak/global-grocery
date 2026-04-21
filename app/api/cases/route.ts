import { type NextRequest } from 'next/server'
import { apiSuccess, apiError, isMockMode } from '@/lib/api/helpers'
import { MOCK_CASES } from '@/lib/salesforce/mock-data'
import { sfQuery, sfCreate } from '@/lib/salesforce/client'
import type { SFCase } from '@/types/salesforce'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const contactId = searchParams.get('contactId')

    if (isMockMode()) {
      let cases = MOCK_CASES
      if (contactId) cases = cases.filter((c) => c.ContactId === contactId)
      return apiSuccess(cases, { total: cases.length, source: 'mock' })
    }

    let soql = 'SELECT Id, CaseNumber, AccountId, ContactId, Subject, Description, Status, Priority, Origin, Type, IsEscalated, CreatedDate, LastModifiedDate FROM Case'
    if (contactId) soql += ` WHERE ContactId = '${contactId}'`
    soql += ' ORDER BY CreatedDate DESC LIMIT 100'

    const result = await sfQuery<SFCase>(soql)
    return apiSuccess(result.records, { total: result.totalSize, source: 'salesforce' })
  } catch (err: any) { 
    console.error('[GET /api/cases] Error:', err.message || err)
    return apiError('Failed to fetch cases: ' + (err.message || 'Unknown error'), 500) 
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { subject, description, priority = 'Medium', origin = 'Web', type, contactId, accountId } = body
    if (!subject) return apiError('subject is required')

    if (isMockMode()) {
      const newCase: Partial<SFCase> = {
        Id: '500' + Date.now(), CaseNumber: '000' + Date.now(),
        Subject: subject, Description: description,
        Status: 'New', Priority: priority, Origin: origin,
        Type: type, ContactId: contactId, AccountId: accountId,
        CreatedDate: new Date().toISOString(), LastModifiedDate: new Date().toISOString(),
      }
      return apiSuccess(newCase, { source: 'mock' })
    }

    const result = await sfCreate('Case', { Subject: subject, Description: description, Priority: priority, Origin: origin, Type: type, ContactId: contactId, AccountId: accountId })
    return apiSuccess({ id: result.id, success: result.success }, { source: 'salesforce' })
  } catch (err) { return apiError('Failed to create case', 500) }
}

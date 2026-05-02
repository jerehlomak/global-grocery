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
    const { subject, description, priority = 'Medium', origin = 'Web', type, contactId, accountId, supportTier } = body
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

    const payload: any = { 
      Subject: subject, 
      Description: description, 
      Priority: priority, 
      Origin: origin, 
      Type: type, 
      ContactId: contactId, 
      AccountId: accountId 
    }

    // If support tier is explicitly passed, map it to a custom field so Salesforce logic can use it
    if (supportTier) {
      payload.Support_Tier__c = supportTier;
      payload.Support_Type__c = supportTier;
    }

    let result;
    
    // Helper to try creation and handle custom fields gracefully
    const attemptCreate = async (currentPayload: any) => {
      try {
        return await sfCreate('Case', currentPayload);
      } catch (err: any) {
        if (err.message && err.message.includes("No such column")) {
          const fallbackPayload = { ...currentPayload };
          delete fallbackPayload.Support_Tier__c;
          delete fallbackPayload.Support_Type__c;
          return await sfCreate('Case', fallbackPayload);
        }
        throw err;
      }
    };

    try {
      result = await attemptCreate(payload);
    } catch (createErr: any) {
      if (createErr.message && createErr.message.includes("INSUFFICIENT_ACCESS_ON_CROSS_REFERENCE_ENTITY")) {
        // Fallback: Remove ContactId and retry
        delete payload.ContactId;
        try {
          result = await attemptCreate(payload);
        } catch (retryErr: any) {
          if (retryErr.message && retryErr.message.includes("INSUFFICIENT_ACCESS_ON_CROSS_REFERENCE_ENTITY")) {
            // Fallback 2: Remove AccountId as well
            delete payload.AccountId;
            result = await attemptCreate(payload);
          } else {
            throw retryErr;
          }
        }
      } else {
        throw createErr;
      }
    }
    return apiSuccess({ id: result.id, success: result.success }, { source: 'salesforce' })
  } catch (err: any) { 
    console.error('[POST /api/cases] Error:', err.message || err)
    return apiError('Failed to create case: ' + (err.message || 'Unknown error'), 500) 
  }
}

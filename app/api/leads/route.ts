import { type NextRequest } from 'next/server'
import { apiSuccess, apiError, isMockMode } from '@/lib/api/helpers'
import { MOCK_LEADS } from '@/lib/salesforce/mock-data'
import { sfQuery, sfCreate } from '@/lib/salesforce/client'
import type { SFLead } from '@/types/salesforce'

export async function GET(_req: NextRequest) {
  try {
    if (isMockMode()) {
      return apiSuccess(MOCK_LEADS, { total: MOCK_LEADS.length, source: 'mock' })
    }
    const result = await sfQuery<SFLead>(
      'SELECT Id, FirstName, LastName, Email, Phone, Company, Status, LeadSource, Rating, Lead_Score__c, IsConverted, Country, CreatedDate FROM Lead ORDER BY CreatedDate DESC LIMIT 100'
    )
    return apiSuccess(result.records, { total: result.totalSize, source: 'salesforce' })
  } catch (err) { return apiError('Failed to fetch leads', 500) }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Accept both Web-to-Lead snake_case names AND camelCase names for flexibility
    const firstName = body.first_name ?? body.firstName ?? ''
    const lastName = body.last_name ?? body.lastName ?? ''
    const email = body.email ?? ''
    const phone = body.phone ?? ''
    const company = body.company ?? body.firstName + ' ' + body.lastName ?? ''
    const employees = body.employees ?? ''
    const industry = body.industry ?? body['00Nd200001xsj0r'] ?? ''
    const region = body.region ?? body['00Nd200001xgsHd'] ?? ''
    const productInterest = body.product_interest ?? body['00Nd200001sDrWz'] ?? ''

    if (!lastName || !email || !company) {
      return apiError('last_name, email, and company are required', 400)
    }

    if (isMockMode()) {
      const lead: Partial<SFLead> = {
        Id: '00Q' + Date.now(), FirstName: firstName, LastName: lastName, Email: email, Phone: phone,
        Company: company, Status: 'Open - Not Contacted', LeadSource: 'Web',
        IsConverted: false, CreatedDate: new Date().toISOString(),
      }
      return apiSuccess(lead, { source: 'mock' })
    }

    // Build the payload using the exact Salesforce field API names
    const leadPayload: Record<string, any> = {
      FirstName: firstName,
      LastName: lastName,
      Email: email,
      Phone: phone,
      Company: company,
      LeadSource: 'Web',
    }

    if (employees) {
      const parsed = parseInt(employees, 10)
      if (!isNaN(parsed)) leadPayload.NumberOfEmployees = parsed
    }
    if (industry)        leadPayload.Industry__c = industry
    if (region)          leadPayload.Region__c = region
    if (productInterest) leadPayload.ProductInterest__c = productInterest

    const result = await sfCreate('Lead', leadPayload)
    console.log('[POST /api/leads] Lead created:', result.id)
    return apiSuccess({ id: result.id, success: result.success }, { source: 'salesforce' })
  } catch (err: any) {
    console.error('[POST /api/leads]', err)
    return apiError('Failed to create lead: ' + (err.message || 'Unknown error'), 500)
  }
}

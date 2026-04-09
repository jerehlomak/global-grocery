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
    const { firstName, lastName, email, phone, company, leadSource, campaignId, country } = body
    if (!firstName || !lastName || !email) return apiError('firstName, lastName and email are required')
    if (isMockMode()) {
      const lead: Partial<SFLead> = {
        Id: '00Q' + Date.now(), FirstName: firstName, LastName: lastName, Email: email,
        Phone: phone, Company: company || firstName + ' ' + lastName,
        Status: 'Open - Not Contacted', LeadSource: leadSource || 'Web',
        Rating: 'Cold', Lead_Score__c: 10, IsConverted: false,
        Country: country, CampaignId: campaignId, CreatedDate: new Date().toISOString(),
      }
      return apiSuccess(lead, { source: 'mock' })
    }
    // LIVE SF: Create Lead record
    const result = await sfCreate('Lead', {
      FirstName: firstName, LastName: lastName, Email: email, Phone: phone,
      Company: company || firstName + ' ' + lastName,
      Status: 'Open - Not Contacted', LeadSource: leadSource || 'Web',
      Country: country,
    })
    return apiSuccess({ id: result.id, success: result.success }, { source: 'salesforce' })
  } catch (err) { return apiError('Failed to create lead', 500) }
}

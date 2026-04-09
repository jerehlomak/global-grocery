import { type NextRequest } from 'next/server'
import { apiSuccess, apiError, isMockMode } from '@/lib/api/helpers'
import { sfCreate, sfQuery } from '@/lib/salesforce/client'
import type { RegisterRequest, AuthUser } from '@/types/api'
import type { SFLead } from '@/types/salesforce'

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json()
    const { firstName, lastName, email, company, phone, region, campaignId, leadSource, accountType = 'b2c' } = body

    if (!firstName || !lastName || !email || !body.password) {
      return apiError('firstName, lastName, email and password are required')
    }

    if (isMockMode()) {
      const leadId = '00Q' + Date.now()
      const user: AuthUser = {
        id: leadId, email, firstName, lastName,
        company: company || (accountType === 'b2b' ? 'My Company' : undefined),
        leadId, isConverted: false, accountType, leadScore: 10,
        region: region || 'north-america',
      }
      // NOTE: In production, hash the password and store session
      return apiSuccess({ user, token: 'mock-jwt-token-' + leadId }, { source: 'mock' })
    }

    // LIVE SF: Check if lead/contact already exists
    const existing = await sfQuery<SFLead>('SELECT Id FROM Lead WHERE Email = \'' + email + '\' LIMIT 1')
    if (existing.totalSize > 0) return apiError('An account with this email already exists', 409)

    // Create Lead in Salesforce
    const result = await sfCreate('Lead', {
      FirstName: firstName, LastName: lastName, Email: email,
      Phone: phone, Company: company || firstName + ' ' + lastName,
      Status: 'Open - Not Contacted', LeadSource: leadSource || 'Web',
      Lead_Score__c: 10,
    })

    const user: AuthUser = {
      id: result.id, email, firstName, lastName, company,
      leadId: result.id, isConverted: false, accountType,
      region: region || 'north-america',
    }
    return apiSuccess({ user, token: 'sf-jwt-' + result.id }, { source: 'salesforce' })
  } catch (err) {
    console.error('[/api/auth/register]', err)
    return apiError('Registration failed', 500)
  }
}

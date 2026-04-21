import { type NextRequest } from 'next/server'
import { apiSuccess, apiError, isMockMode } from '@/lib/api/helpers'
import { sfCreate, sfQuery } from '@/lib/salesforce/client'
import type { RegisterRequest, AuthUser } from '@/types/api'
import type { SFAccount } from '@/types/salesforce'

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

    // LIVE SF: Look up if Account with this email already exists
    // (PersonEmail for B2C, but we check generically or assume B2C)
    const emailField = accountType === 'b2c' ? 'PersonEmail' : 'Email__c' // Use proper email field based on your org schema
    const checkQuery = accountType === 'b2c'
      ? `SELECT Id FROM Account WHERE PersonEmail = '${email}' LIMIT 1`
      : `SELECT Id FROM Account WHERE Name = '${company}' LIMIT 1` // Simplified check for B2B

    try {
      const existing = await sfQuery<SFAccount>(checkQuery)
      if (existing.totalSize > 0) return apiError('An account already exists', 409)
    } catch (e) {
      // Ignore query errors if fields don't exist yet
    }

    // Prepare Salesforce Account Payload (Standard Account fields only)
    let payload: any = {}

    if (accountType === 'b2b') {
      const b2bRecordTypeId = process.env.SF_B2B_RECORDTYPE_ID
      payload = {
        Name: company || `${firstName} ${lastName}`,
        Phone: phone,
      }
      if (b2bRecordTypeId) payload.RecordTypeId = b2bRecordTypeId
    } else {
      const b2cRecordTypeId = process.env.SF_B2C_RECORDTYPE_ID
      payload = {
        Name: `${firstName} ${lastName}`,
        Phone: phone,
      }
      if (b2cRecordTypeId) payload.RecordTypeId = b2cRecordTypeId
    }

    // Merge any dynamically provided custom Salesforce fields
    const { firstName: _f, lastName: _l, email: _e, password: _pw, company: _c, phone: _p, region: _t, campaignId: _ci, leadSource: _ls, accountType: _at, ...dynamicFields } = body
    Object.assign(payload, dynamicFields)

    let result;
    try {
      result = await sfCreate('Account', payload);
    } catch (createErr: any) {
      // Graceful fallback if the Dev Org doesn't have Record Types enabled for Account
      if (createErr.message && createErr.message.includes("No such column 'RecordTypeId'")) {
        delete payload.RecordTypeId;
        result = await sfCreate('Account', payload);
      } else {
        throw createErr;
      }
    }

    let finalContactId = undefined
    // Create an associated Contact to store the Email so the user can securely log in (for both B2B and B2C non-Person orgs)
    try {
      const contactPayload = {
        FirstName: firstName,
        LastName: lastName,
        Email: email,
        Phone: phone,
        AccountId: result.id
      }
      const contactResult = await sfCreate('Contact', contactPayload)
      finalContactId = contactResult.id
    } catch (err: any) {
      console.error('Failed to create proxy contact:', err)
      // We don't abort the entire registration here but ideally we should
    }

    const user: AuthUser = {
      id: result.id, email, firstName, lastName, company,
      accountId: result.id, contactId: finalContactId, isConverted: true, accountType,
      region: region || 'north-america',
    }
    return apiSuccess({ user, token: 'sf-jwt-' + result.id }, { source: 'salesforce' })
  } catch (err) {
    console.error('[/api/auth/register]', err)

    const message =
      err instanceof Error ? err.message : 'Registration failed'

    return apiError(message, 500)
  }
}

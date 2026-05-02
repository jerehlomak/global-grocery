import { type NextRequest } from 'next/server'
import { apiSuccess, apiError, isMockMode } from '@/lib/api/helpers'
import { MOCK_LEADS, MOCK_CONTACTS, MOCK_ACCOUNTS } from '@/lib/salesforce/mock-data'
import { sfQuery } from '@/lib/salesforce/client'
import type { AuthUser } from '@/types/api'
import type { SFContact } from '@/types/salesforce'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body
    if (!email || !password) return apiError('Email and password are required')

    if (isMockMode()) {
      // Mock: find in leads or contacts
      const lead = MOCK_LEADS.find((l) => l.Email === email)
      const contact = MOCK_CONTACTS.find((c) => c.Email === email)
      const account = contact ? MOCK_ACCOUNTS.find((a) => a.Id === contact.AccountId) : null

      if (!lead && !contact) {
        // Demo: auto-create a session for any email in mock mode
        const user: AuthUser = {
          id: 'demo-' + Date.now(), email, firstName: email.split('@')[0],
          lastName: 'User', isConverted: false, accountType: 'b2c',
          leadScore: 45, region: 'north-america',
        }
        return apiSuccess({ user, token: 'mock-jwt-demo' }, { source: 'mock' })
      }

      const user: AuthUser = contact ? {
        id: contact.Id, email: contact.Email, firstName: contact.FirstName,
        lastName: contact.LastName, company: account?.Name,
        contactId: contact.Id, accountId: contact.AccountId,
        isConverted: true, accountType: account?.Type === 'Customer - Channel' ? 'b2b' : 'b2c',
        leadScore: 75, region: 'europe',
      } : {
        id: lead!.Id, email: lead!.Email, firstName: lead!.FirstName,
        lastName: lead!.LastName, company: lead!.Company,
        leadId: lead!.Id, isConverted: false, accountType: 'b2c',
        leadScore: lead!.Lead_Score__c || 10, region: 'africa',
      }
      return apiSuccess({ user, token: 'mock-jwt-' + user.id }, { source: 'mock' })
    }

    // LIVE SF: Look up Contact by email (Works for B2B proxy contacts & B2C Person Contacts)
    let contactResult;
    try {
      contactResult = await sfQuery<any>(
        `SELECT Id, FirstName, LastName, Email, AccountId, Account.IsPersonAccount, Account.Name, Account.Support_Type__c, Account.Support_Tier__c FROM Contact WHERE Email = '${email}' LIMIT 1`
      )
    } catch (queryErr: any) {
      if (queryErr.message && queryErr.message.includes('INVALID_FIELD')) {
        contactResult = await sfQuery<any>(
          `SELECT Id, FirstName, LastName, Email, AccountId, Account.IsPersonAccount, Account.Name FROM Contact WHERE Email = '${email}' LIMIT 1`
        )
      } else {
        throw queryErr;
      }
    }

    if (contactResult.totalSize === 0) return apiError('Invalid credentials', 401)

    const contact = contactResult.records[0]
    const isB2C = !contact.Account?.Name || contact.Account?.IsPersonAccount
    
    const user: AuthUser = {
      id: contact.Id,
      email: contact.Email,
      firstName: contact.FirstName || '',
      lastName: contact.LastName || '',
      accountId: contact.AccountId,
      contactId: contact.Id,
      company: contact.Account?.Name || '',
      isConverted: true,
      accountType: isB2C ? 'b2c' : 'b2b',
      supportType: contact.Account?.Support_Type__c || contact.Account?.Support_Tier__c || 'Basic'
    }
    console.log('[Login] Resolved user:', { accountId: user.accountId, contactId: user.contactId, company: user.company })
    return apiSuccess({ user, token: 'sf-jwt-' + contact.Id }, { source: 'salesforce' })
  } catch (err) {
    console.error('[/api/auth/login]', err)
    return apiError('Login failed', 500)
  }
}

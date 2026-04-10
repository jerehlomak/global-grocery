import { type NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/lib/api/helpers'
import { sfQuery, sfCreate } from '@/lib/salesforce/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { campaignId, firstName, lastName, email, phone, company } = body

    if (!campaignId || !email || !lastName) {
      return apiError('Missing required fields: CampaignId, Email, and LastName are critical.', 400)
    }

    let contactId = null
    let leadId = null

    // 1. Search for existing Contact by Email
    const contactQuery = await sfQuery<any>(`SELECT Id FROM Contact WHERE Email = '${email}' LIMIT 1`)
    if (contactQuery.totalSize > 0) {
      contactId = contactQuery.records[0].Id
    } else {
      // 2. Search for existing Lead by Email
      const leadQuery = await sfQuery<any>(`SELECT Id FROM Lead WHERE Email = '${email}' AND IsConverted = false LIMIT 1`)
      if (leadQuery.totalSize > 0) {
        leadId = leadQuery.records[0].Id
      } else {
        // 3. Create a new Lead
        const fallbackCompany = company ? company : `${firstName || ''} ${lastName} (Subscriber)`
        const leadPayload = {
          FirstName: firstName,
          LastName: lastName,
          Email: email,
          Phone: phone,
          Company: fallbackCompany,
          LeadSource: 'Partner Referral' // A standard source, adjust appropriately
        }
        const createResult = await sfCreate('Lead', leadPayload)
        leadId = createResult.id
      }
    }

    // 4. Create CampaignMember
    try {
      const memberPayload: any = {
        CampaignId: campaignId,
        Status: 'Responded'
      }
      
      if (contactId) memberPayload.ContactId = contactId
      else if (leadId) memberPayload.LeadId = leadId

      await sfCreate('CampaignMember', memberPayload)
    } catch (memberErr: any) {
      // If they are already subscribed, Salesforce might throw an error like DUPLICATE_VALUE or generic failure.
      // We gracefully accept duplicates as success because they achieved their desired subscription state.
      if (memberErr.message && memberErr.message.includes('DUPLICATE')) {
         return apiSuccess({ message: 'Already subscribed!' })
      }
      throw memberErr // Reraise critical SF crashes
    }

    return apiSuccess({ message: 'Successfully subscribed to the campaign!' }, { source: 'salesforce' })
  } catch (err: any) {
    console.error('[/api/campaigns/subscribe]', err)
    return apiError('Failed to process campaign subscription: ' + (err.message || 'Unknown Error'), 500)
  }
}

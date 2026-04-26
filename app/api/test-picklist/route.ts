import { type NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/lib/api/helpers'
import { sfGetPicklistValues, sfFetch } from '@/lib/salesforce/client'

export async function GET(request: NextRequest) {
  try {
    const res = await sfGetPicklistValues('Lead', 'Region__c');
    // Return ALL Lead field names so we can find the right API name for custom fields
    const allFields = await sfFetch('/services/data/v62.0/sobjects/Lead/describe/');
    const customFields = allFields.fields
      .filter((f: any) => f.custom || f.name.includes('__c') || f.type === 'picklist')
      .map((f: any) => ({ name: f.name, label: f.label, type: f.type }));
    return apiSuccess({ region_picklist: res, custom_and_picklist_fields: customFields });
  } catch (err: any) {
    return apiSuccess({ error: err.message })
  }
}

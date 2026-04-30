import { NextResponse } from 'next/server'
import { sfFetch } from '@/lib/salesforce/client'

export async function GET() {
  try {
    const describe = await sfFetch('/services/data/v60.0/sobjects/Account/describe')
    
    // Extract labels, types, and required status
    const fields = describe.fields.map((f: any) => ({
      name: f.name,
      label: f.label,
      type: f.type,
      required: !f.nillable && f.createable && !f.defaultedOnCreate, // Strict SF required fields
      createable: f.createable,
      picklistValues: f.picklistValues?.filter((p: any) => p.active).map((p: any) => ({ label: p.label, value: p.value }))
    }))

    return NextResponse.json({ success: true, data: fields })
  } catch (err) {
    console.error('[/api/salesforce/account/describe]', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch account metadata' }, { status: 500 })
  }
}

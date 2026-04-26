import { type NextRequest, NextResponse } from 'next/server'
import { sfQuery } from '@/lib/salesforce/client'

export async function GET(request: NextRequest) {
  try {
    const result = await sfQuery("SELECT Id, Name, QuoteId, Document FROM QuoteDocument WHERE QuoteId = '0Q0d2000002A19lCAC' LIMIT 1")
    return NextResponse.json({ success: true, data: result.records })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

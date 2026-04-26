import { type NextRequest, NextResponse } from 'next/server'
import { sfQuery } from '@/lib/salesforce/client'
import { getSalesforceToken } from '@/lib/salesforce/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) return NextResponse.json({ error: 'Quote id is required' }, { status: 400 })

    // 1. Query for the latest QuoteDocument associated with this Quote
    const soql = `SELECT Id, Document FROM QuoteDocument WHERE QuoteId = '${id}' ORDER BY CreatedDate DESC LIMIT 1`
    const result = await sfQuery<{ Id: string; Document: string }>(soql)

    if (result.totalSize === 0) {
      return NextResponse.json({ error: 'No PDF document found for this quote' }, { status: 404 })
    }

    const documentUri = result.records[0].Document

    // 2. Fetch the binary data directly from Salesforce REST API
    const token = await getSalesforceToken()
    const instanceUrl = process.env.SALESFORCE_INSTANCE_URL || "https://wise-wolf-3sucf2-dev-ed.trailblaze.my.salesforce.com"
    
    const response = await fetch(`${instanceUrl}${documentUri}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Failed to fetch PDF binary:', err)
      return NextResponse.json({ error: 'Failed to fetch PDF document from Salesforce' }, { status: 500 })
    }

    // 3. Return the array buffer as a PDF stream
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="quote.pdf"',
        'Cache-Control': 'no-store, max-age=0'
      }
    })

  } catch (err: any) {
    console.error('[/api/quotes/[id]/pdf]', err)
    return NextResponse.json({ error: 'Failed to fetch Quote PDF: ' + err.message }, { status: 500 })
  }
}

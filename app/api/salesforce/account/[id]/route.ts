import { type NextRequest, NextResponse } from 'next/server'
import { sfFetch, sfUpdate } from '@/lib/salesforce/client'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = await sfFetch(`/services/data/v60.0/sobjects/Account/${id}`)
    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('[/api/salesforce/account/id]', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch account' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    // Strip empty values to prevent wiping data unintentionally
    Object.keys(body).forEach(k => body[k] === '' && delete body[k])

    await sfUpdate('Account', id, body)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[/api/salesforce/account/id]', err)
    return NextResponse.json({ success: false, error: 'Failed to update account' }, { status: 500 })
  }
}

import { type NextRequest } from 'next/server'
import { apiSuccess, apiError, isMockMode } from '@/lib/api/helpers'
import { sfUpdate } from '@/lib/salesforce/client'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) return apiError('Opportunity id is required')

    const body = await request.json()

    if (isMockMode()) {
      return apiSuccess({ id, success: true }, { source: 'mock' })
    }

    const res = await sfUpdate('Opportunity', id, body)
    if (res && !res.success) {
      return apiError(res.errors?.[0]?.message || 'Update opportunity failed')
    }

    return apiSuccess({ id, success: true }, { source: 'salesforce' })
  } catch (err: any) {
    console.error('[/api/opportunities/[id]]', err)
    return apiError('Failed to update opportunity', 500)
  }
}

import { type NextRequest } from 'next/server'
import { apiSuccess, apiError, isMockMode } from '@/lib/api/helpers'
import { sfCreate } from '@/lib/salesforce/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { subject, ownerId, whatId, whoId, description, status = 'Not Started', priority = 'Normal' } = body

    if (!subject) return apiError('subject is required')

    if (isMockMode()) {
      return apiSuccess({ id: '00T' + Date.now(), success: true }, { source: 'mock' })
    }

    const payload: any = {
      Subject: subject,
      Status: status,
      Priority: priority,
      Description: description
    }
    if (ownerId) payload.OwnerId = ownerId
    if (whatId) payload.WhatId = whatId
    if (whoId) payload.WhoId = whoId

    const result = await sfCreate('Task', payload)
    if (!result.success) return apiError(result.errors?.[0]?.message || 'Failed to create task')

    return apiSuccess({ id: result.id, success: true }, { source: 'salesforce' })
  } catch (err: any) {
    console.error('[/api/tasks]', err)
    return apiError('Failed to create task', 500)
  }
}

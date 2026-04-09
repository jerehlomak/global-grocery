import type { ApiResponse } from '@/types/api'

export function apiSuccess<T>(data: T, meta?: ApiResponse<T>['meta']): Response {
  const body: ApiResponse<T> = {
    success: true,
    data,
    meta: { lastSynced: new Date().toISOString(), ...meta },
  }
  return Response.json(body)
}

export function apiError(message: string, status = 400): Response {
  const body: ApiResponse = { success: false, error: message }
  return Response.json(body, { status })
}

export function isMockMode(): boolean {
  return process.env.SALESFORCE_MOCK === 'true'
}

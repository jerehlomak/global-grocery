import type { ApiResponse, AuthUser, LoginRequest, RegisterRequest } from '@/types/api'

const BASE = '/api/auth'

export async function login(data: LoginRequest): Promise<{ user: AuthUser; token: string }> {
  const res = await fetch(`${BASE}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  const json: ApiResponse<{ user: AuthUser; token: string }> = await res.json()
  if (!json.success) throw new Error(json.error || 'Login failed')
  return json.data!
}

export async function register(data: RegisterRequest): Promise<{ user: AuthUser; token: string }> {
  const res = await fetch(`${BASE}/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  const json: ApiResponse<{ user: AuthUser; token: string }> = await res.json()
  if (!json.success) throw new Error(json.error || 'Registration failed')
  return json.data!
}

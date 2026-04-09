// Standard API response envelope
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
  meta?: {
    total?: number
    page?: number
    pageSize?: number
    lastSynced?: string
    region?: string
    source?: "salesforce" | "mock"
  }
}

// Auth types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  password: string
  company?: string
  phone?: string
  region?: string
  campaignId?: string
  leadSource?: string
  accountType?: "b2c" | "b2b"
}

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  company?: string
  // SF record IDs
  leadId?: string
  accountId?: string
  contactId?: string
  // Lead conversion status
  isConverted: boolean
  accountType: "b2c" | "b2b"
  leadScore?: number
  region?: string
}

export interface SessionToken {
  userId: string
  email: string
  leadId?: string
  contactId?: string
  accountId?: string
  iat: number
  exp: number
}

// Lead score display
export type LeadScoreCategory = "hot" | "warm" | "cold"

export function getLeadScoreCategory(score: number): LeadScoreCategory {
  if (score >= 80) return "hot"
  if (score >= 50) return "warm"
  return "cold"
}

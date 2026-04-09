const fs = require('fs');

const services = {
  'services/productService.ts': `import type { ApiResponse } from '@/types/api'
import type { Product } from '@/types/product'
import type { SFPriceBook } from '@/types/salesforce'

const BASE = '/api'

export async function fetchProducts(region = 'north-america', family?: string, search?: string): Promise<Product[]> {
  const params = new URLSearchParams({ region })
  if (family) params.set('family', family)
  if (search) params.set('search', search)
  const res = await fetch(\`\${BASE}/products?\${params}\`)
  const json: ApiResponse<Product[]> = await res.json()
  if (!json.success) throw new Error(json.error || 'Failed to fetch products')
  return json.data || []
}

export async function fetchPriceBooks(): Promise<SFPriceBook[]> {
  const res = await fetch(\`\${BASE}/price-books\`)
  const json: ApiResponse<SFPriceBook[]> = await res.json()
  if (!json.success) throw new Error(json.error || 'Failed to fetch price books')
  return json.data || []
}
`,

  'services/leadService.ts': `import type { ApiResponse } from '@/types/api'
import type { SFLead } from '@/types/salesforce'

const BASE = '/api'

export async function createLead(data: {
  firstName: string; lastName: string; email: string;
  phone?: string; company?: string; leadSource?: string;
  campaignId?: string; country?: string;
}): Promise<Partial<SFLead>> {
  const res = await fetch(\`\${BASE}/leads\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const json: ApiResponse<Partial<SFLead>> = await res.json()
  if (!json.success) throw new Error(json.error || 'Failed to create lead')
  return json.data!
}

export async function convertLead(leadId: string, options: {
  convertedStatus?: string; createOpportunity?: boolean; opportunityName?: string;
}): Promise<{ accountId: string; contactId: string; opportunityId?: string }> {
  const res = await fetch(\`\${BASE}/leads/\${leadId}/convert\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options),
  })
  const json: ApiResponse<{ accountId: string; contactId: string; opportunityId?: string }> = await res.json()
  if (!json.success) throw new Error(json.error || 'Failed to convert lead')
  return json.data!
}
`,

  'services/opportunityService.ts': `import type { ApiResponse } from '@/types/api'
import type { SFOpportunity, SFOpportunityStage } from '@/types/salesforce'
import type { CartItem } from '@/types/cart'

const BASE = '/api'

export async function fetchOpportunities(params: { contactId?: string; accountId?: string } = {}): Promise<SFOpportunity[]> {
  const p = new URLSearchParams()
  if (params.contactId) p.set('contactId', params.contactId)
  if (params.accountId) p.set('accountId', params.accountId)
  const res = await fetch(\`\${BASE}/opportunities?\${p}\`)
  const json: ApiResponse<SFOpportunity[]> = await res.json()
  if (!json.success) throw new Error(json.error || 'Failed to fetch opportunities')
  return json.data || []
}

export async function fetchOpportunity(id: string): Promise<SFOpportunity> {
  const res = await fetch(\`\${BASE}/opportunities/\${id}\`)
  const json: ApiResponse<SFOpportunity> = await res.json()
  if (!json.success) throw new Error(json.error || 'Not found')
  return json.data!
}

export async function createOpportunity(data: {
  name: string; accountId?: string; contactId?: string; stageName?: string;
  closeDate: string; amount: number; priceBook2Id?: string; leadSource?: string;
  lineItems: CartItem[];
}): Promise<Partial<SFOpportunity>> {
  const res = await fetch(\`\${BASE}/opportunities\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const json: ApiResponse<Partial<SFOpportunity>> = await res.json()
  if (!json.success) throw new Error(json.error || 'Failed to create opportunity')
  return json.data!
}

export async function updateOpportunity(id: string, data: Partial<SFOpportunity>): Promise<void> {
  const res = await fetch(\`\${BASE}/opportunities/\${id}\`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const json: ApiResponse = await res.json()
  if (!json.success) throw new Error(json.error || 'Failed to update opportunity')
}

export async function fetchStages(): Promise<SFOpportunityStage[]> {
  const res = await fetch(\`\${BASE}/stages\`)
  const json: ApiResponse<SFOpportunityStage[]> = await res.json()
  if (!json.success) throw new Error(json.error)
  return json.data || []
}
`,

  'services/quoteService.ts': `import type { ApiResponse } from '@/types/api'
import type { SFQuote } from '@/types/salesforce'

const BASE = '/api'

export async function fetchQuotes(opportunityId?: string): Promise<SFQuote[]> {
  const p = new URLSearchParams()
  if (opportunityId) p.set('opportunityId', opportunityId)
  const res = await fetch(\`\${BASE}/quotes?\${p}\`)
  const json: ApiResponse<SFQuote[]> = await res.json()
  if (!json.success) throw new Error(json.error || 'Failed to fetch quotes')
  return json.data || []
}

export async function createQuote(data: { opportunityId: string; name: string; expirationDate?: string; discount?: number }): Promise<Partial<SFQuote>> {
  const res = await fetch(\`\${BASE}/quotes\`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  const json: ApiResponse<Partial<SFQuote>> = await res.json()
  if (!json.success) throw new Error(json.error || 'Failed to create quote')
  return json.data!
}
`,

  'services/orderService.ts': `import type { ApiResponse } from '@/types/api'
import type { SFOrder } from '@/types/salesforce'

const BASE = '/api'

export async function fetchOrders(accountId?: string): Promise<SFOrder[]> {
  const p = new URLSearchParams()
  if (accountId) p.set('accountId', accountId)
  const res = await fetch(\`\${BASE}/orders?\${p}\`)
  const json: ApiResponse<SFOrder[]> = await res.json()
  if (!json.success) throw new Error(json.error || 'Failed to fetch orders')
  return json.data || []
}

export async function createOrder(data: { accountId?: string; opportunityId?: string; effectiveDate: string; status?: string }): Promise<Partial<SFOrder>> {
  const res = await fetch(\`\${BASE}/orders\`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  const json: ApiResponse<Partial<SFOrder>> = await res.json()
  if (!json.success) throw new Error(json.error || 'Failed to create order')
  return json.data!
}
`,

  'services/contractService.ts': `import type { ApiResponse } from '@/types/api'
import type { SFContract } from '@/types/salesforce'

const BASE = '/api'

export async function fetchContracts(accountId?: string): Promise<SFContract[]> {
  const p = new URLSearchParams()
  if (accountId) p.set('accountId', accountId)
  const res = await fetch(\`\${BASE}/contracts?\${p}\`)
  const json: ApiResponse<SFContract[]> = await res.json()
  if (!json.success) throw new Error(json.error || 'Failed to fetch contracts')
  return json.data || []
}

export async function createContract(data: { accountId: string; startDate: string; contractTerm?: number; description?: string }): Promise<Partial<SFContract>> {
  const res = await fetch(\`\${BASE}/contracts\`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  const json: ApiResponse<Partial<SFContract>> = await res.json()
  if (!json.success) throw new Error(json.error || 'Failed to create contract')
  return json.data!
}
`,

  'services/caseService.ts': `import type { ApiResponse } from '@/types/api'
import type { SFCase } from '@/types/salesforce'

const BASE = '/api'

export async function fetchCases(contactId?: string): Promise<SFCase[]> {
  const p = new URLSearchParams()
  if (contactId) p.set('contactId', contactId)
  const res = await fetch(\`\${BASE}/cases?\${p}\`)
  const json: ApiResponse<SFCase[]> = await res.json()
  if (!json.success) throw new Error(json.error || 'Failed to fetch cases')
  return json.data || []
}

export async function createCase(data: { subject: string; description?: string; priority?: string; origin?: string; type?: string; contactId?: string; accountId?: string }): Promise<Partial<SFCase>> {
  const res = await fetch(\`\${BASE}/cases\`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  const json: ApiResponse<Partial<SFCase>> = await res.json()
  if (!json.success) throw new Error(json.error || 'Failed to create case')
  return json.data!
}
`,

  'services/campaignService.ts': `import type { ApiResponse } from '@/types/api'
import type { SFCampaign } from '@/types/salesforce'

const BASE = '/api'

export async function fetchCampaigns(): Promise<SFCampaign[]> {
  const res = await fetch(\`\${BASE}/campaigns\`)
  const json: ApiResponse<SFCampaign[]> = await res.json()
  if (!json.success) throw new Error(json.error || 'Failed to fetch campaigns')
  return json.data || []
}
`,

  'services/knowledgeService.ts': `import type { ApiResponse } from '@/types/api'
import type { SFKnowledgeArticle } from '@/types/salesforce'

const BASE = '/api'

export async function fetchKnowledgeArticles(search?: string, category?: string): Promise<SFKnowledgeArticle[]> {
  const p = new URLSearchParams()
  if (search) p.set('search', search)
  if (category) p.set('category', category)
  const res = await fetch(\`\${BASE}/knowledge?\${p}\`)
  const json: ApiResponse<SFKnowledgeArticle[]> = await res.json()
  if (!json.success) throw new Error(json.error || 'Failed to fetch articles')
  return json.data || []
}
`,

  'services/authService.ts': `import type { ApiResponse, AuthUser, LoginRequest, RegisterRequest } from '@/types/api'

const BASE = '/api/auth'

export async function login(data: LoginRequest): Promise<{ user: AuthUser; token: string }> {
  const res = await fetch(\`\${BASE}/login\`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  const json: ApiResponse<{ user: AuthUser; token: string }> = await res.json()
  if (!json.success) throw new Error(json.error || 'Login failed')
  return json.data!
}

export async function register(data: RegisterRequest): Promise<{ user: AuthUser; token: string }> {
  const res = await fetch(\`\${BASE}/register\`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  const json: ApiResponse<{ user: AuthUser; token: string }> = await res.json()
  if (!json.success) throw new Error(json.error || 'Registration failed')
  return json.data!
}
`
};

for (const [path, content] of Object.entries(services)) {
  fs.writeFileSync(path, content);
  console.log('Fixed: ' + path);
}
console.log('All service files fixed!');

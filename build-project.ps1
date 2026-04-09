Write-Host "=== GlobalGrocer Full Build ===" -ForegroundColor Cyan

function Write-File($path, $content) {
    $dir = Split-Path $path -Parent
    if ($dir -and !(Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
    Set-Content -Path $path -Value $content -Encoding UTF8
    Write-Host "  [OK] $path" -ForegroundColor Green
}

Write-Host "`n[Phase 1] API Routes..." -ForegroundColor Yellow

# /api/products
Write-File "app/api/products/route.ts" @"
import { type NextRequest } from 'next/server'
import { apiSuccess, apiError, isMockMode } from '@/lib/api/helpers'
import { getMockEntriesForPriceBook, getMockPriceBookByRegion } from '@/lib/salesforce/mock-data'
import { sfQuery } from '@/lib/salesforce/client'
import type { SFPriceBookEntry } from '@/types/salesforce'
import type { Product } from '@/types/product'

const FAMILY_IMAGES: Record<string, string> = {
  'Grains & Cereals': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80',
  'Oils & Condiments': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80',
  'Beverages': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80',
  'Spreads & Sweeteners': 'https://images.unsplash.com/photo-1587049352847-81a56d773cee?w=400&q=80',
  'Seafood': 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=400&q=80',
  'Dairy': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&q=80',
  'Fruits & Vegetables': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80',
  'Bakery': 'https://images.unsplash.com/photo-1549931319-a545dcf3bc7b?w=400&q=80',
  'default': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80',
}

function getImage(family: string): string {
  return FAMILY_IMAGES[family] || FAMILY_IMAGES.default
}

function entriesToProducts(entries: SFPriceBookEntry[], currency: string): Product[] {
  return entries.map((entry) => ({
    id: entry.Product2Id,
    name: entry.Product2.Name,
    productCode: entry.Product2.ProductCode,
    description: entry.Product2.Description,
    family: entry.Product2.Family,
    imageUrl: getImage(entry.Product2.Family),
    isActive: entry.Product2.IsActive,
    unitPrice: entry.UnitPrice,
    currency: entry.CurrencyIsoCode || currency,
    priceBookEntryId: entry.Id,
    sfProduct: entry.Product2,
    sfPriceBookEntry: entry,
  }))
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const region = searchParams.get('region') || 'north-america'
    const family = searchParams.get('family')
    const search = searchParams.get('search')

    if (isMockMode()) {
      const priceBook = getMockPriceBookByRegion(region)
      if (!priceBook) return apiError('No price book for region', 404)
      const currency = priceBook.Id === '01s000002' ? 'EUR' : 'USD'
      let entries = getMockEntriesForPriceBook(priceBook.Id)
      if (family) entries = entries.filter((e) => e.Product2.Family === family)
      if (search) {
        const q = search.toLowerCase()
        entries = entries.filter((e) => e.Product2.Name.toLowerCase().includes(q) || e.Product2.Description.toLowerCase().includes(q))
      }
      const products = entriesToProducts(entries, currency)
      return apiSuccess(products, { total: products.length, source: 'mock' })
    }

    // LIVE SF: fetch PricebookEntry with related Product2
    const soql = `SELECT Id, UnitPrice, CurrencyIsoCode, Product2Id, Product2.Name, Product2.ProductCode, Product2.Description, Product2.Family, Product2.IsActive FROM PricebookEntry WHERE IsActive = TRUE LIMIT 200`
    const result = await sfQuery<SFPriceBookEntry>(soql)
    const currency = region === 'europe' ? 'EUR' : 'USD'
    const products = entriesToProducts(result.records, currency)
    return apiSuccess(products, { total: result.totalSize, source: 'salesforce' })
  } catch (err) {
    console.error('[/api/products]', err)
    return apiError('Failed to fetch products', 500)
  }
}
"@

# /api/price-books
Write-File "app/api/price-books/route.ts" @"
import { type NextRequest } from 'next/server'
import { apiSuccess, apiError, isMockMode } from '@/lib/api/helpers'
import { MOCK_PRICE_BOOKS } from '@/lib/salesforce/mock-data'
import { sfQuery } from '@/lib/salesforce/client'
import type { SFPriceBook } from '@/types/salesforce'

export async function GET(_request: NextRequest) {
  try {
    if (isMockMode()) {
      return apiSuccess(MOCK_PRICE_BOOKS, { source: 'mock' })
    }
    // LIVE SF: SELECT Id, Name, IsActive, IsStandard, Description FROM Pricebook2 WHERE IsActive = TRUE
    const result = await sfQuery<SFPriceBook>('SELECT Id, Name, IsActive, IsStandard, Description FROM Pricebook2 WHERE IsActive = TRUE')
    return apiSuccess(result.records, { total: result.totalSize, source: 'salesforce' })
  } catch (err) {
    console.error('[/api/price-books]', err)
    return apiError('Failed to fetch price books', 500)
  }
}
"@

# /api/leads
Write-File "app/api/leads/route.ts" @"
import { type NextRequest } from 'next/server'
import { apiSuccess, apiError, isMockMode } from '@/lib/api/helpers'
import { MOCK_LEADS } from '@/lib/salesforce/mock-data'
import { sfQuery, sfCreate } from '@/lib/salesforce/client'
import type { SFLead } from '@/types/salesforce'

export async function GET(_req: NextRequest) {
  try {
    if (isMockMode()) {
      return apiSuccess(MOCK_LEADS, { total: MOCK_LEADS.length, source: 'mock' })
    }
    const result = await sfQuery<SFLead>(
      'SELECT Id, FirstName, LastName, Email, Phone, Company, Status, LeadSource, Rating, Lead_Score__c, IsConverted, Country, CreatedDate FROM Lead ORDER BY CreatedDate DESC LIMIT 100'
    )
    return apiSuccess(result.records, { total: result.totalSize, source: 'salesforce' })
  } catch (err) { return apiError('Failed to fetch leads', 500) }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, company, leadSource, campaignId, country } = body
    if (!firstName || !lastName || !email) return apiError('firstName, lastName and email are required')
    if (isMockMode()) {
      const lead: Partial<SFLead> = {
        Id: '00Q' + Date.now(), FirstName: firstName, LastName: lastName, Email: email,
        Phone: phone, Company: company || firstName + ' ' + lastName,
        Status: 'Open - Not Contacted', LeadSource: leadSource || 'Web',
        Rating: 'Cold', Lead_Score__c: 10, IsConverted: false,
        Country: country, CampaignId: campaignId, CreatedDate: new Date().toISOString(),
      }
      return apiSuccess(lead, { source: 'mock' })
    }
    // LIVE SF: Create Lead record
    const result = await sfCreate('Lead', {
      FirstName: firstName, LastName: lastName, Email: email, Phone: phone,
      Company: company || firstName + ' ' + lastName,
      Status: 'Open - Not Contacted', LeadSource: leadSource || 'Web',
      Country: country,
    })
    return apiSuccess({ id: result.id, success: result.success }, { source: 'salesforce' })
  } catch (err) { return apiError('Failed to create lead', 500) }
}
"@

# /api/leads/[id]/convert
Write-File "app/api/leads/[id]/convert/route.ts" @"
import { type NextRequest } from 'next/server'
import { apiSuccess, apiError, isMockMode } from '@/lib/api/helpers'
import { sfConvertLead } from '@/lib/salesforce/client'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { convertedStatus = 'Qualified', createOpportunity = true, opportunityName, accountId } = body

    if (isMockMode()) {
      // Mock: simulate conversion
      return apiSuccess({
        accountId: '001' + Date.now(),
        contactId: '003' + Date.now(),
        opportunityId: createOpportunity ? '006' + Date.now() : undefined,
        success: true,
      }, { source: 'mock' })
    }

    // LIVE SF: Convert Lead via composite API
    const result = await sfConvertLead(id, { convertedStatus, createOpportunity, opportunityName, accountId })
    return apiSuccess(result, { source: 'salesforce' })
  } catch (err) {
    console.error('[/api/leads/[id]/convert]', err)
    return apiError('Failed to convert lead', 500)
  }
}
"@

# /api/opportunities
Write-File "app/api/opportunities/route.ts" @"
import { type NextRequest } from 'next/server'
import { apiSuccess, apiError, isMockMode } from '@/lib/api/helpers'
import { MOCK_OPPORTUNITIES } from '@/lib/salesforce/mock-data'
import { sfQuery, sfCreate } from '@/lib/salesforce/client'
import type { SFOpportunity } from '@/types/salesforce'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const contactId = searchParams.get('contactId')
    const accountId = searchParams.get('accountId')

    if (isMockMode()) {
      let opps = MOCK_OPPORTUNITIES
      if (contactId) opps = opps.filter((o) => o.ContactId === contactId)
      if (accountId) opps = opps.filter((o) => o.AccountId === accountId)
      return apiSuccess(opps, { total: opps.length, source: 'mock' })
    }

    let soql = 'SELECT Id, Name, AccountId, Account.Name, StageName, CloseDate, Amount, Probability, LeadSource, PriceBook2Id, OwnerId, CreatedDate, LastModifiedDate FROM Opportunity ORDER BY CreatedDate DESC LIMIT 100'
    if (contactId) soql = soql.replace('FROM Opportunity', 'FROM Opportunity WHERE ContactId = \'' + contactId + '\'')

    const result = await sfQuery<SFOpportunity>(soql)
    return apiSuccess(result.records, { total: result.totalSize, source: 'salesforce' })
  } catch (err) { return apiError('Failed to fetch opportunities', 500) }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, accountId, contactId, stageName = 'Prospecting', closeDate, amount, priceBook2Id, leadSource, description, lineItems = [] } = body
    if (!name || !closeDate) return apiError('name and closeDate are required')

    if (isMockMode()) {
      const opp: Partial<SFOpportunity> = {
        Id: '006' + Date.now(), Name: name, AccountId: accountId, ContactId: contactId,
        StageName: stageName, CloseDate: closeDate, Amount: amount,
        Probability: 10, LeadSource: leadSource, PriceBook2Id: priceBook2Id,
        Description: description, OwnerId: '005000001',
        CreatedDate: new Date().toISOString(), LastModifiedDate: new Date().toISOString(),
      }
      return apiSuccess({ opportunity: opp, lineItems }, { source: 'mock' })
    }

    // LIVE SF: Create Opportunity then add OpportunityLineItems
    const result = await sfCreate('Opportunity', {
      Name: name, AccountId: accountId, StageName: stageName,
      CloseDate: closeDate, Amount: amount, LeadSource: leadSource,
      Pricebook2Id: priceBook2Id, Description: description,
    })
    return apiSuccess({ id: result.id, success: result.success }, { source: 'salesforce' })
  } catch (err) { return apiError('Failed to create opportunity', 500) }
}
"@

# /api/opportunities/[id]
Write-File "app/api/opportunities/[id]/route.ts" @"
import { type NextRequest } from 'next/server'
import { apiSuccess, apiError, isMockMode } from '@/lib/api/helpers'
import { MOCK_OPPORTUNITIES } from '@/lib/salesforce/mock-data'
import { sfQuery, sfUpdate } from '@/lib/salesforce/client'
import type { SFOpportunity } from '@/types/salesforce'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (isMockMode()) {
      const opp = MOCK_OPPORTUNITIES.find((o) => o.Id === id)
      if (!opp) return apiError('Opportunity not found', 404)
      return apiSuccess(opp, { source: 'mock' })
    }
    const result = await sfQuery<SFOpportunity>('SELECT Id, Name, AccountId, Account.Name, StageName, CloseDate, Amount, Probability, LeadSource, PriceBook2Id, OwnerId, CreatedDate, LastModifiedDate FROM Opportunity WHERE Id = \'' + id + '\'')
    if (!result.records[0]) return apiError('Opportunity not found', 404)
    return apiSuccess(result.records[0], { source: 'salesforce' })
  } catch (err) { return apiError('Failed to fetch opportunity', 500) }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    if (isMockMode()) {
      const opp = MOCK_OPPORTUNITIES.find((o) => o.Id === id)
      if (!opp) return apiError('Opportunity not found', 404)
      const updated = { ...opp, ...body, LastModifiedDate: new Date().toISOString() }
      return apiSuccess(updated, { source: 'mock' })
    }
    await sfUpdate('Opportunity', id, body)
    return apiSuccess({ id, success: true }, { source: 'salesforce' })
  } catch (err) { return apiError('Failed to update opportunity', 500) }
}
"@

# /api/stages
Write-File "app/api/stages/route.ts" @"
import { type NextRequest } from 'next/server'
import { apiSuccess, apiError, isMockMode } from '@/lib/api/helpers'
import { MOCK_OPPORTUNITY_STAGES } from '@/lib/salesforce/mock-data'
import { sfGetPicklistValues } from '@/lib/salesforce/client'

export async function GET(_request: NextRequest) {
  try {
    if (isMockMode()) {
      return apiSuccess(MOCK_OPPORTUNITY_STAGES, { source: 'mock' })
    }
    // LIVE SF: Get Opportunity picklist values for StageName field
    const stages = await sfGetPicklistValues('Opportunity', 'StageName')
    return apiSuccess(stages, { source: 'salesforce' })
  } catch (err) {
    console.error('[/api/stages]', err)
    return apiError('Failed to fetch stages', 500)
  }
}
"@

Write-Host "`n[Phase 2] More API Routes..." -ForegroundColor Yellow

# /api/quotes
Write-File "app/api/quotes/route.ts" @"
import { type NextRequest } from 'next/server'
import { apiSuccess, apiError, isMockMode } from '@/lib/api/helpers'
import { MOCK_QUOTES } from '@/lib/salesforce/mock-data'
import { sfQuery, sfCreate } from '@/lib/salesforce/client'
import type { SFQuote } from '@/types/salesforce'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const opportunityId = searchParams.get('opportunityId')

    if (isMockMode()) {
      let quotes = MOCK_QUOTES
      if (opportunityId) quotes = quotes.filter((q) => q.OpportunityId === opportunityId)
      return apiSuccess(quotes, { total: quotes.length, source: 'mock' })
    }

    let soql = 'SELECT Id, Name, OpportunityId, Opportunity.Name, Opportunity.StageName, Status, ExpirationDate, TotalPrice, GrandTotal, Discount, IsSyncing, CreatedDate, LastModifiedDate FROM Quote ORDER BY CreatedDate DESC LIMIT 50'
    if (opportunityId) soql = soql.replace('FROM Quote', 'FROM Quote WHERE OpportunityId = \'' + opportunityId + '\'')
    const result = await sfQuery<SFQuote>(soql)
    return apiSuccess(result.records, { total: result.totalSize, source: 'salesforce' })
  } catch (err) { return apiError('Failed to fetch quotes', 500) }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { opportunityId, name, expirationDate, discount, description } = body
    if (!opportunityId || !name) return apiError('opportunityId and name are required')

    if (isMockMode()) {
      const quote: Partial<SFQuote> = {
        Id: '0Q0' + Date.now(), Name: name, OpportunityId: opportunityId,
        Status: 'Draft', ExpirationDate: expirationDate, Discount: discount,
        Description: description, IsSyncing: false,
        CreatedDate: new Date().toISOString(), LastModifiedDate: new Date().toISOString(),
      }
      return apiSuccess(quote, { source: 'mock' })
    }

    const result = await sfCreate('Quote', { Name: name, OpportunityId: opportunityId, ExpirationDate: expirationDate, Discount: discount, Description: description })
    return apiSuccess({ id: result.id, success: result.success }, { source: 'salesforce' })
  } catch (err) { return apiError('Failed to create quote', 500) }
}
"@

# /api/orders
Write-File "app/api/orders/route.ts" @"
import { type NextRequest } from 'next/server'
import { apiSuccess, apiError, isMockMode } from '@/lib/api/helpers'
import { MOCK_ORDERS } from '@/lib/salesforce/mock-data'
import { sfQuery, sfCreate } from '@/lib/salesforce/client'
import type { SFOrder } from '@/types/salesforce'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const accountId = searchParams.get('accountId')

    if (isMockMode()) {
      let orders = MOCK_ORDERS
      if (accountId) orders = orders.filter((o) => o.AccountId === accountId)
      return apiSuccess(orders, { total: orders.length, source: 'mock' })
    }

    const soql = 'SELECT Id, AccountId, OpportunityId, ContractId, Status, TotalAmount, EffectiveDate, OrderedDate, CreatedDate FROM Order ORDER BY CreatedDate DESC LIMIT 100'
    const result = await sfQuery<SFOrder>(soql)
    return apiSuccess(result.records, { total: result.totalSize, source: 'salesforce' })
  } catch (err) { return apiError('Failed to fetch orders', 500) }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { accountId, opportunityId, effectiveDate, status = 'Draft', description } = body
    if (!effectiveDate) return apiError('effectiveDate is required')

    if (isMockMode()) {
      const order: Partial<SFOrder> = {
        Id: '801' + Date.now(), AccountId: accountId, OpportunityId: opportunityId,
        Status: status, EffectiveDate: effectiveDate, Description: description,
        CreatedDate: new Date().toISOString(),
      }
      return apiSuccess(order, { source: 'mock' })
    }

    const result = await sfCreate('Order', { AccountId: accountId, Status: status, EffectiveDate: effectiveDate, Description: description })
    return apiSuccess({ id: result.id, success: result.success }, { source: 'salesforce' })
  } catch (err) { return apiError('Failed to create order', 500) }
}
"@

# /api/contracts
Write-File "app/api/contracts/route.ts" @"
import { type NextRequest } from 'next/server'
import { apiSuccess, apiError, isMockMode } from '@/lib/api/helpers'
import { MOCK_CONTRACTS } from '@/lib/salesforce/mock-data'
import { sfQuery, sfCreate } from '@/lib/salesforce/client'
import type { SFContract } from '@/types/salesforce'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const accountId = searchParams.get('accountId')

    if (isMockMode()) {
      let contracts = MOCK_CONTRACTS
      if (accountId) contracts = contracts.filter((c) => c.AccountId === accountId)
      return apiSuccess(contracts, { total: contracts.length, source: 'mock' })
    }

    const soql = 'SELECT Id, AccountId, Status, StartDate, ContractTerm, EndDate, TotalAmount, Description, OwnerId, CreatedDate FROM Contract ORDER BY CreatedDate DESC LIMIT 50'
    const result = await sfQuery<SFContract>(soql)
    return apiSuccess(result.records, { total: result.totalSize, source: 'salesforce' })
  } catch (err) { return apiError('Failed to fetch contracts', 500) }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { accountId, startDate, contractTerm = 12, description } = body
    if (!accountId || !startDate) return apiError('accountId and startDate are required')

    if (isMockMode()) {
      const contract: Partial<SFContract> = {
        Id: '800' + Date.now(), AccountId: accountId, Status: 'Draft',
        StartDate: startDate, ContractTerm: contractTerm,
        Description: description, OwnerId: '005000001',
        CreatedDate: new Date().toISOString(), LastModifiedDate: new Date().toISOString(),
      }
      return apiSuccess(contract, { source: 'mock' })
    }

    const result = await sfCreate('Contract', { AccountId: accountId, StartDate: startDate, ContractTerm: contractTerm, Status: 'Draft', Description: description })
    return apiSuccess({ id: result.id, success: result.success }, { source: 'salesforce' })
  } catch (err) { return apiError('Failed to create contract', 500) }
}
"@

# /api/cases
Write-File "app/api/cases/route.ts" @"
import { type NextRequest } from 'next/server'
import { apiSuccess, apiError, isMockMode } from '@/lib/api/helpers'
import { MOCK_CASES } from '@/lib/salesforce/mock-data'
import { sfQuery, sfCreate } from '@/lib/salesforce/client'
import type { SFCase } from '@/types/salesforce'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const contactId = searchParams.get('contactId')

    if (isMockMode()) {
      let cases = MOCK_CASES
      if (contactId) cases = cases.filter((c) => c.ContactId === contactId)
      return apiSuccess(cases, { total: cases.length, source: 'mock' })
    }

    const soql = 'SELECT Id, CaseNumber, AccountId, ContactId, Subject, Description, Status, Priority, Origin, Type, IsEscalated, CreatedDate, LastModifiedDate FROM Case ORDER BY CreatedDate DESC LIMIT 100'
    const result = await sfQuery<SFCase>(soql)
    return apiSuccess(result.records, { total: result.totalSize, source: 'salesforce' })
  } catch (err) { return apiError('Failed to fetch cases', 500) }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { subject, description, priority = 'Medium', origin = 'Web', type, contactId, accountId } = body
    if (!subject) return apiError('subject is required')

    if (isMockMode()) {
      const newCase: Partial<SFCase> = {
        Id: '500' + Date.now(), CaseNumber: '000' + Date.now(),
        Subject: subject, Description: description,
        Status: 'New', Priority: priority, Origin: origin,
        Type: type, ContactId: contactId, AccountId: accountId,
        CreatedDate: new Date().toISOString(), LastModifiedDate: new Date().toISOString(),
      }
      return apiSuccess(newCase, { source: 'mock' })
    }

    const result = await sfCreate('Case', { Subject: subject, Description: description, Priority: priority, Origin: origin, Type: type, ContactId: contactId, AccountId: accountId })
    return apiSuccess({ id: result.id, success: result.success }, { source: 'salesforce' })
  } catch (err) { return apiError('Failed to create case', 500) }
}
"@

# /api/campaigns
Write-File "app/api/campaigns/route.ts" @"
import { type NextRequest } from 'next/server'
import { apiSuccess, apiError, isMockMode } from '@/lib/api/helpers'
import { MOCK_CAMPAIGNS } from '@/lib/salesforce/mock-data'
import { sfQuery } from '@/lib/salesforce/client'
import type { SFCampaign } from '@/types/salesforce'

export async function GET(_request: NextRequest) {
  try {
    if (isMockMode()) {
      return apiSuccess(MOCK_CAMPAIGNS, { total: MOCK_CAMPAIGNS.length, source: 'mock' })
    }
    const result = await sfQuery<SFCampaign>(
      'SELECT Id, Name, Type, Status, StartDate, EndDate, BudgetedCost, ActualCost, ExpectedRevenue, NumberOfLeads, NumberOfContacts, NumberOfConvertedLeads, IsActive, Description FROM Campaign ORDER BY StartDate DESC LIMIT 50'
    )
    return apiSuccess(result.records, { total: result.totalSize, source: 'salesforce' })
  } catch (err) { return apiError('Failed to fetch campaigns', 500) }
}
"@

# /api/knowledge
Write-File "app/api/knowledge/route.ts" @"
import { type NextRequest } from 'next/server'
import { apiSuccess, apiError, isMockMode } from '@/lib/api/helpers'
import { MOCK_KNOWLEDGE_ARTICLES } from '@/lib/salesforce/mock-data'
import { sfQuery } from '@/lib/salesforce/client'
import type { SFKnowledgeArticle } from '@/types/salesforce'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const search = searchParams.get('search')
    const category = searchParams.get('category')

    if (isMockMode()) {
      let articles = MOCK_KNOWLEDGE_ARTICLES
      if (search) {
        const q = search.toLowerCase()
        articles = articles.filter((a) => a.Title.toLowerCase().includes(q) || (a.Summary && a.Summary.toLowerCase().includes(q)))
      }
      if (category) articles = articles.filter((a) => a.Categories?.includes(category))
      return apiSuccess(articles, { total: articles.length, source: 'mock' })
    }

    // LIVE SF: Query KnowledgeArticleVersion (requires Knowledge feature enabled)
    const soql = 'SELECT Id, Title, Summary, UrlName, ArticleType, IsVisibleInPkb, CreatedDate FROM KnowledgeArticleVersion WHERE PublishStatus = \'Online\' AND Language = \'en_US\' ORDER BY Title LIMIT 100'
    const result = await sfQuery<SFKnowledgeArticle>(soql)
    return apiSuccess(result.records, { total: result.totalSize, source: 'salesforce' })
  } catch (err) { return apiError('Failed to fetch knowledge articles', 500) }
}
"@

# /api/auth/register
Write-File "app/api/auth/register/route.ts" @"
import { type NextRequest } from 'next/server'
import { apiSuccess, apiError, isMockMode } from '@/lib/api/helpers'
import { sfCreate, sfQuery } from '@/lib/salesforce/client'
import type { RegisterRequest, AuthUser } from '@/types/api'
import type { SFLead } from '@/types/salesforce'

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json()
    const { firstName, lastName, email, company, phone, region, campaignId, leadSource, accountType = 'b2c' } = body

    if (!firstName || !lastName || !email || !body.password) {
      return apiError('firstName, lastName, email and password are required')
    }

    if (isMockMode()) {
      const leadId = '00Q' + Date.now()
      const user: AuthUser = {
        id: leadId, email, firstName, lastName,
        company: company || (accountType === 'b2b' ? 'My Company' : undefined),
        leadId, isConverted: false, accountType, leadScore: 10,
        region: region || 'north-america',
      }
      // NOTE: In production, hash the password and store session
      return apiSuccess({ user, token: 'mock-jwt-token-' + leadId }, { source: 'mock' })
    }

    // LIVE SF: Check if lead/contact already exists
    const existing = await sfQuery<SFLead>('SELECT Id FROM Lead WHERE Email = \'' + email + '\' LIMIT 1')
    if (existing.totalSize > 0) return apiError('An account with this email already exists', 409)

    // Create Lead in Salesforce
    const result = await sfCreate('Lead', {
      FirstName: firstName, LastName: lastName, Email: email,
      Phone: phone, Company: company || firstName + ' ' + lastName,
      Status: 'Open - Not Contacted', LeadSource: leadSource || 'Web',
      Lead_Score__c: 10,
    })

    const user: AuthUser = {
      id: result.id, email, firstName, lastName, company,
      leadId: result.id, isConverted: false, accountType,
      region: region || 'north-america',
    }
    return apiSuccess({ user, token: 'sf-jwt-' + result.id }, { source: 'salesforce' })
  } catch (err) {
    console.error('[/api/auth/register]', err)
    return apiError('Registration failed', 500)
  }
}
"@

# /api/auth/login
Write-File "app/api/auth/login/route.ts" @"
import { type NextRequest } from 'next/server'
import { apiSuccess, apiError, isMockMode } from '@/lib/api/helpers'
import { MOCK_LEADS, MOCK_CONTACTS, MOCK_ACCOUNTS } from '@/lib/salesforce/mock-data'
import { sfQuery } from '@/lib/salesforce/client'
import type { AuthUser } from '@/types/api'
import type { SFContact } from '@/types/salesforce'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body
    if (!email || !password) return apiError('Email and password are required')

    if (isMockMode()) {
      // Mock: find in leads or contacts
      const lead = MOCK_LEADS.find((l) => l.Email === email)
      const contact = MOCK_CONTACTS.find((c) => c.Email === email)
      const account = contact ? MOCK_ACCOUNTS.find((a) => a.Id === contact.AccountId) : null

      if (!lead && !contact) {
        // Demo: auto-create a session for any email in mock mode
        const user: AuthUser = {
          id: 'demo-' + Date.now(), email, firstName: email.split('@')[0],
          lastName: 'User', isConverted: false, accountType: 'b2c',
          leadScore: 45, region: 'north-america',
        }
        return apiSuccess({ user, token: 'mock-jwt-demo' }, { source: 'mock' })
      }

      const user: AuthUser = contact ? {
        id: contact.Id, email: contact.Email, firstName: contact.FirstName,
        lastName: contact.LastName, company: account?.Name,
        contactId: contact.Id, accountId: contact.AccountId,
        isConverted: true, accountType: account?.Type === 'Customer - Channel' ? 'b2b' : 'b2c',
        leadScore: 75, region: 'europe',
      } : {
        id: lead!.Id, email: lead!.Email, firstName: lead!.FirstName,
        lastName: lead!.LastName, company: lead!.Company,
        leadId: lead!.Id, isConverted: false, accountType: 'b2c',
        leadScore: lead!.Lead_Score__c || 10, region: 'africa',
      }
      return apiSuccess({ user, token: 'mock-jwt-' + user.id }, { source: 'mock' })
    }

    // LIVE SF: Look up Contact by email, fall back to Lead
    const contactResult = await sfQuery<SFContact>(
      'SELECT Id, FirstName, LastName, Email, AccountId FROM Contact WHERE Email = \'' + email + '\' LIMIT 1'
    )
    if (contactResult.totalSize === 0) return apiError('Invalid credentials', 401)

    const contact = contactResult.records[0]
    const user: AuthUser = {
      id: contact.Id, email: contact.Email, firstName: contact.FirstName,
      lastName: contact.LastName, contactId: contact.Id, accountId: contact.AccountId,
      isConverted: true, accountType: 'b2c',
    }
    return apiSuccess({ user, token: 'sf-jwt-' + contact.Id }, { source: 'salesforce' })
  } catch (err) {
    console.error('[/api/auth/login]', err)
    return apiError('Login failed', 500)
  }
}
"@

Write-Host "`n  All API routes written!" -ForegroundColor Cyan

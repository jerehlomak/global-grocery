// ============================================================
// Salesforce Object Types - mirrors real SOQL response shapes
// ============================================================

export interface SalesforceRecord {
  Id: string
  attributes?: { type: string; url: string }
}

// Product2
export interface SFProduct {
  Id: string
  Name: string
  ProductCode: string
  Description: string
  Family: string
  IsActive: boolean
  DisplayUrl?: string | null
  attributes?: { type: string; url: string }
}

// PriceBook2
export interface SFPriceBook {
  Id: string
  Name: string
  IsActive: boolean
  IsStandard: boolean
  Description: string
}

// PriceBookEntry
export interface SFPriceBookEntry {
  Id: string
  Product2Id: string
  Product2: SFProduct
  PriceBook2Id: string
  UnitPrice: number
  IsActive: boolean
  CurrencyIsoCode: string
}

// Lead
export interface SFLead {
  Id: string
  FirstName: string
  LastName: string
  Email: string
  Phone?: string
  Company: string
  Status: string
  LeadSource?: string
  Rating?: string
  AnnualRevenue?: number
  NumberOfEmployees?: number
  Country?: string
  Description?: string
  CampaignId?: string
  Lead_Score__c?: number
  IsConverted: boolean
  ConvertedAccountId?: string
  ConvertedContactId?: string
  ConvertedOpportunityId?: string
  CreatedDate: string
}

// Account
export interface SFAccount {
  Id: string
  Name: string
  Type?: string
  Industry?: string
  BillingCity?: string
  BillingCountry?: string
  Phone?: string
  Website?: string
  AnnualRevenue?: number
  NumberOfEmployees?: number
  OwnerId: string
  CreatedDate: string
}

// Contact
export interface SFContact {
  Id: string
  FirstName: string
  LastName: string
  Email: string
  Phone?: string
  AccountId?: string
  LeadSource?: string
  Title?: string
  Department?: string
  OwnerId: string
  CreatedDate: string
}

// Opportunity
export interface SFOpportunity {
  Id: string
  Name: string
  AccountId?: string
  Account?: { Name: string }
  StageName: string
  CloseDate: string
  Amount: number
  Probability?: number
  LeadSource?: string
  PriceBook2Id?: string
  CampaignId?: string
  Description?: string
  Type?: string
  OwnerId: string
  ContactId?: string
  CreatedDate: string
  LastModifiedDate: string
  OpportunityLineItems?: {
    records: SFOpportunityLineItem[]
    totalSize: number
  }
}

// OpportunityLineItem
export interface SFOpportunityLineItem {
  Id: string
  OpportunityId: string
  Product2Id: string
  Product2?: { Name: string; ProductCode: string }
  PriceBookEntryId: string
  Quantity: number
  UnitPrice: number
  TotalPrice: number
  Description?: string
}

// Opportunity Stage (picklist metadata)
export interface SFOpportunityStage {
  ApiName: string
  Label: string
  IsActive: boolean
  SortOrder: number
  IsClosed: boolean
  IsWon: boolean
  DefaultProbability: number
}

// Quote
export interface SFQuote {
  Id: string
  Name: string
  OpportunityId: string
  Opportunity?: { Name: string; StageName: string }
  Status: string
  ExpirationDate?: string
  TotalPrice?: number
  GrandTotal?: number
  Discount?: number
  Description?: string
  IsSyncing: boolean
  CreatedDate: string
  LastModifiedDate: string
}

// Order
export interface SFOrder {
  Id: string
  AccountId?: string
  OpportunityId?: string
  ContractId?: string
  Status: string
  TotalAmount?: number
  OrderedDate?: string
  EffectiveDate: string
  EndDate?: string
  BillToContactId?: string
  ShipToContactId?: string
  Description?: string
  CreatedDate: string
}

// Contract
export interface SFContract {
  Id: string
  AccountId?: string
  OpportunityId__c?: string
  Status: string
  StartDate?: string
  ContractTerm?: number
  EndDate?: string
  TotalAmount?: number
  Description?: string
  OwnerId: string
  CreatedDate: string
  LastModifiedDate: string
}

// Case
export interface SFCase {
  Id: string
  CaseNumber?: string
  AccountId?: string
  ContactId?: string
  Subject: string
  Description?: string
  Status: string
  Priority: string
  Origin: string
  Type?: string
  Reason?: string
  IsEscalated?: boolean
  OwnerId?: string
  CreatedDate: string
  LastModifiedDate: string
}

// Campaign
export interface SFCampaign {
  Id: string
  Name: string
  Type?: string
  Status?: string
  StartDate?: string
  EndDate?: string
  BudgetedCost?: number
  ActualCost?: number
  ExpectedRevenue?: number
  NumberOfLeads?: number
  NumberOfContacts?: number
  NumberOfConvertedLeads?: number
  IsActive: boolean
  Description?: string
}

// Knowledge Article
export interface SFKnowledgeArticle {
  Id: string
  Title: string
  Summary?: string
  UrlName: string
  ArticleType?: string
  IsVisibleInPkb?: boolean
  IsVisibleInCsp?: boolean
  CreatedDate: string
  LastPublishedDate?: string
  Categories?: string[]
}

// Salesforce API Response wrappers
export interface SFQueryResult<T> {
  totalSize: number
  done: boolean
  records: T[]
}

export interface SFCreateResult {
  id: string
  success: boolean
  errors: string[]
}

export interface SFUpdateResult {
  success: boolean
  errors: string[]
}

export interface SFConvertLeadResult {
  accountId: string
  contactId: string
  opportunityId: string
  success: boolean
}

// Auth token cache
export interface SFTokenCache {
  accessToken: string
  instanceUrl: string
  expiresAt: number
}

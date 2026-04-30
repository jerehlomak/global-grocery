/**
 * Mock data that mirrors real Salesforce SOQL response shapes.
 * Used when SALESFORCE_MOCK=true (no live org needed).
 */
import type {
  SFProduct, SFPriceBook, SFPriceBookEntry, SFLead,
  SFOpportunity, SFOpportunityStage, SFQuote, SFOrder,
  SFContract, SFCase, SFCampaign, SFKnowledgeArticle, SFAccount, SFContact
} from "@/types/salesforce"

export const MOCK_PRODUCTS: SFProduct[] = [
  { Id:"01t000001",Name:"Organic Basmati Rice 5kg",ProductCode:"GRO-001",Description:"Premium long-grain organic basmati rice sourced from the Himalayan foothills.",Family:"Grains & Cereals",IsActive:true },
  { Id:"01t000002",Name:"Extra Virgin Olive Oil 1L",ProductCode:"GRO-002",Description:"Cold-pressed extra virgin olive oil from Mediterranean groves.",Family:"Oils & Condiments",IsActive:true },
  { Id:"01t000003",Name:"Dark Roast Coffee Beans 500g",ProductCode:"GRO-003",Description:"Rich, full-bodied dark roast coffee beans from Ethiopian highlands.",Family:"Beverages",IsActive:true },
  { Id:"01t000004",Name:"Organic Honey 500g",ProductCode:"GRO-004",Description:"Raw, unprocessed organic honey from wildflower meadows.",Family:"Spreads & Sweeteners",IsActive:true },
  { Id:"01t000005",Name:"Atlantic Salmon Fillet 400g",ProductCode:"GRO-005",Description:"Fresh-frozen wild-caught Atlantic salmon fillet, sustainably sourced.",Family:"Seafood",IsActive:true },
  { Id:"01t000006",Name:"Whole Milk Powder 1kg",ProductCode:"GRO-006",Description:"Full-cream whole milk powder, ideal for baking and beverages.",Family:"Dairy",IsActive:true },
  { Id:"01t000007",Name:"Free-Range Brown Eggs x12",ProductCode:"GRO-007",Description:"Farm-fresh free-range brown eggs, Grade A.",Family:"Dairy",IsActive:true },
  { Id:"01t000008",Name:"Quinoa 1kg",ProductCode:"GRO-008",Description:"Organic tri-colour quinoa, high in protein and gluten-free.",Family:"Grains & Cereals",IsActive:true },
  { Id:"01t000009",Name:"Coconut Milk 400ml x6",ProductCode:"GRO-009",Description:"Creamy organic coconut milk, perfect for curries and desserts.",Family:"Beverages",IsActive:true },
  { Id:"01t000010",Name:"Artisan Sourdough Bread",ProductCode:"GRO-010",Description:"Traditional long-fermented sourdough with crunchy crust.",Family:"Bakery",IsActive:true },
  { Id:"01t000011",Name:"Avocado x6",ProductCode:"GRO-011",Description:"Ready-to-eat ripe Hass avocados, rich in healthy fats.",Family:"Fruits & Vegetables",IsActive:true },
  { Id:"01t000012",Name:"Greek Yoghurt 500g",ProductCode:"GRO-012",Description:"Thick, creamy authentic Greek-style yoghurt, high in protein.",Family:"Dairy",IsActive:true },
]

export const MOCK_PRICE_BOOKS: SFPriceBook[] = [
  { Id:"01s000001",Name:"Standard Price Book",IsActive:true,IsStandard:true,Description:"Default price book for North America in USD" },
  { Id:"01s000002",Name:"Europe Price Book",IsActive:true,IsStandard:false,Description:"European market pricing in EUR" },
  { Id:"01s000003",Name:"Africa Price Book",IsActive:true,IsStandard:false,Description:"African market pricing in USD" },
  { Id:"01s000004",Name:"UK Price Book",IsActive:true,IsStandard:false,Description:"UK market pricing in GBP" },
]

export const MOCK_PRICE_BOOK_ENTRIES: SFPriceBookEntry[] = [
  { Id:"0u0NA001",Product2Id:"01t000001",Product2:MOCK_PRODUCTS[0],PriceBook2Id:"01s000001",UnitPrice:12.99,IsActive:true,CurrencyIsoCode:"USD" },
  { Id:"0u0NA002",Product2Id:"01t000002",Product2:MOCK_PRODUCTS[1],PriceBook2Id:"01s000001",UnitPrice:18.50,IsActive:true,CurrencyIsoCode:"USD" },
  { Id:"0u0NA003",Product2Id:"01t000003",Product2:MOCK_PRODUCTS[2],PriceBook2Id:"01s000001",UnitPrice:14.99,IsActive:true,CurrencyIsoCode:"USD" },
  { Id:"0u0NA004",Product2Id:"01t000004",Product2:MOCK_PRODUCTS[3],PriceBook2Id:"01s000001",UnitPrice:9.99,IsActive:true,CurrencyIsoCode:"USD" },
  { Id:"0u0NA005",Product2Id:"01t000005",Product2:MOCK_PRODUCTS[4],PriceBook2Id:"01s000001",UnitPrice:22.00,IsActive:true,CurrencyIsoCode:"USD" },
  { Id:"0u0NA006",Product2Id:"01t000006",Product2:MOCK_PRODUCTS[5],PriceBook2Id:"01s000001",UnitPrice:8.49,IsActive:true,CurrencyIsoCode:"USD" },
  { Id:"0u0NA007",Product2Id:"01t000007",Product2:MOCK_PRODUCTS[6],PriceBook2Id:"01s000001",UnitPrice:6.99,IsActive:true,CurrencyIsoCode:"USD" },
  { Id:"0u0NA008",Product2Id:"01t000008",Product2:MOCK_PRODUCTS[7],PriceBook2Id:"01s000001",UnitPrice:11.99,IsActive:true,CurrencyIsoCode:"USD" },
  { Id:"0u0NA009",Product2Id:"01t000009",Product2:MOCK_PRODUCTS[8],PriceBook2Id:"01s000001",UnitPrice:10.50,IsActive:true,CurrencyIsoCode:"USD" },
  { Id:"0u0NA010",Product2Id:"01t000010",Product2:MOCK_PRODUCTS[9],PriceBook2Id:"01s000001",UnitPrice:5.49,IsActive:true,CurrencyIsoCode:"USD" },
  { Id:"0u0NA011",Product2Id:"01t000011",Product2:MOCK_PRODUCTS[10],PriceBook2Id:"01s000001",UnitPrice:7.99,IsActive:true,CurrencyIsoCode:"USD" },
  { Id:"0u0NA012",Product2Id:"01t000012",Product2:MOCK_PRODUCTS[11],PriceBook2Id:"01s000001",UnitPrice:4.99,IsActive:true,CurrencyIsoCode:"USD" },
  { Id:"0u0EU001",Product2Id:"01t000001",Product2:MOCK_PRODUCTS[0],PriceBook2Id:"01s000002",UnitPrice:11.50,IsActive:true,CurrencyIsoCode:"EUR" },
  { Id:"0u0EU002",Product2Id:"01t000002",Product2:MOCK_PRODUCTS[1],PriceBook2Id:"01s000002",UnitPrice:16.90,IsActive:true,CurrencyIsoCode:"EUR" },
  { Id:"0u0EU003",Product2Id:"01t000003",Product2:MOCK_PRODUCTS[2],PriceBook2Id:"01s000002",UnitPrice:13.50,IsActive:true,CurrencyIsoCode:"EUR" },
  { Id:"0u0EU004",Product2Id:"01t000004",Product2:MOCK_PRODUCTS[3],PriceBook2Id:"01s000002",UnitPrice:8.90,IsActive:true,CurrencyIsoCode:"EUR" },
  { Id:"0u0EU005",Product2Id:"01t000005",Product2:MOCK_PRODUCTS[4],PriceBook2Id:"01s000002",UnitPrice:19.90,IsActive:true,CurrencyIsoCode:"EUR" },
  { Id:"0u0EU006",Product2Id:"01t000006",Product2:MOCK_PRODUCTS[5],PriceBook2Id:"01s000002",UnitPrice:7.50,IsActive:true,CurrencyIsoCode:"EUR" },
  { Id:"0u0EU007",Product2Id:"01t000007",Product2:MOCK_PRODUCTS[6],PriceBook2Id:"01s000002",UnitPrice:6.20,IsActive:true,CurrencyIsoCode:"EUR" },
  { Id:"0u0EU008",Product2Id:"01t000008",Product2:MOCK_PRODUCTS[7],PriceBook2Id:"01s000002",UnitPrice:10.50,IsActive:true,CurrencyIsoCode:"EUR" },
  { Id:"0u0EU009",Product2Id:"01t000009",Product2:MOCK_PRODUCTS[8],PriceBook2Id:"01s000002",UnitPrice:9.20,IsActive:true,CurrencyIsoCode:"EUR" },
  { Id:"0u0EU010",Product2Id:"01t000010",Product2:MOCK_PRODUCTS[9],PriceBook2Id:"01s000002",UnitPrice:4.80,IsActive:true,CurrencyIsoCode:"EUR" },
  { Id:"0u0EU011",Product2Id:"01t000011",Product2:MOCK_PRODUCTS[10],PriceBook2Id:"01s000002",UnitPrice:6.90,IsActive:true,CurrencyIsoCode:"EUR" },
  { Id:"0u0EU012",Product2Id:"01t000012",Product2:MOCK_PRODUCTS[11],PriceBook2Id:"01s000002",UnitPrice:4.40,IsActive:true,CurrencyIsoCode:"EUR" },
  { Id:"0u0AF001",Product2Id:"01t000001",Product2:MOCK_PRODUCTS[0],PriceBook2Id:"01s000003",UnitPrice:14985,IsActive:true,CurrencyIsoCode:"NGN" },
  { Id:"0u0AF002",Product2Id:"01t000002",Product2:MOCK_PRODUCTS[1],PriceBook2Id:"01s000003",UnitPrice:21750,IsActive:true,CurrencyIsoCode:"NGN" },
  { Id:"0u0AF003",Product2Id:"01t000003",Product2:MOCK_PRODUCTS[2],PriceBook2Id:"01s000003",UnitPrice:17985,IsActive:true,CurrencyIsoCode:"NGN" },
  { Id:"0u0AF004",Product2Id:"01t000004",Product2:MOCK_PRODUCTS[3],PriceBook2Id:"01s000003",UnitPrice:11250,IsActive:true,CurrencyIsoCode:"NGN" },
  { Id:"0u0AF005",Product2Id:"01t000005",Product2:MOCK_PRODUCTS[4],PriceBook2Id:"01s000003",UnitPrice:26250,IsActive:true,CurrencyIsoCode:"NGN" },
  { Id:"0u0AF006",Product2Id:"01t000006",Product2:MOCK_PRODUCTS[5],PriceBook2Id:"01s000003",UnitPrice:10485,IsActive:true,CurrencyIsoCode:"NGN" },
  { Id:"0u0AF007",Product2Id:"01t000007",Product2:MOCK_PRODUCTS[6],PriceBook2Id:"01s000003",UnitPrice:8235,IsActive:true,CurrencyIsoCode:"NGN" },
  { Id:"0u0AF008",Product2Id:"01t000008",Product2:MOCK_PRODUCTS[7],PriceBook2Id:"01s000003",UnitPrice:14250,IsActive:true,CurrencyIsoCode:"NGN" },
  { Id:"0u0AF009",Product2Id:"01t000009",Product2:MOCK_PRODUCTS[8],PriceBook2Id:"01s000003",UnitPrice:12300,IsActive:true,CurrencyIsoCode:"NGN" },
  { Id:"0u0AF010",Product2Id:"01t000010",Product2:MOCK_PRODUCTS[9],PriceBook2Id:"01s000003",UnitPrice:5985,IsActive:true,CurrencyIsoCode:"NGN" },
  { Id:"0u0AF011",Product2Id:"01t000011",Product2:MOCK_PRODUCTS[10],PriceBook2Id:"01s000003",UnitPrice:8985,IsActive:true,CurrencyIsoCode:"NGN" },
  { Id:"0u0AF012",Product2Id:"01t000012",Product2:MOCK_PRODUCTS[11],PriceBook2Id:"01s000003",UnitPrice:5625,IsActive:true,CurrencyIsoCode:"NGN" },
  { Id:"0u0UK001",Product2Id:"01t000001",Product2:MOCK_PRODUCTS[0],PriceBook2Id:"01s000004",UnitPrice:9.50,IsActive:true,CurrencyIsoCode:"GBP" },
  { Id:"0u0UK002",Product2Id:"01t000002",Product2:MOCK_PRODUCTS[1],PriceBook2Id:"01s000004",UnitPrice:14.00,IsActive:true,CurrencyIsoCode:"GBP" },
  { Id:"0u0UK003",Product2Id:"01t000003",Product2:MOCK_PRODUCTS[2],PriceBook2Id:"01s000004",UnitPrice:11.20,IsActive:true,CurrencyIsoCode:"GBP" },
]

export const MOCK_OPPORTUNITY_STAGES: SFOpportunityStage[] = [
  { ApiName:"Prospecting",Label:"Prospecting",IsActive:true,SortOrder:1,IsClosed:false,IsWon:false,DefaultProbability:10 },
  { ApiName:"Qualification",Label:"Qualification",IsActive:true,SortOrder:2,IsClosed:false,IsWon:false,DefaultProbability:20 },
  { ApiName:"Needs Analysis",Label:"Needs Analysis",IsActive:true,SortOrder:3,IsClosed:false,IsWon:false,DefaultProbability:30 },
  { ApiName:"Value Proposition",Label:"Value Proposition",IsActive:true,SortOrder:4,IsClosed:false,IsWon:false,DefaultProbability:50 },
  { ApiName:"Proposal/Price Quote",Label:"Proposal/Price Quote",IsActive:true,SortOrder:5,IsClosed:false,IsWon:false,DefaultProbability:75 },
  { ApiName:"Negotiation/Review",Label:"Negotiation/Review",IsActive:true,SortOrder:6,IsClosed:false,IsWon:false,DefaultProbability:90 },
  { ApiName:"Closed Won",Label:"Closed Won",IsActive:true,SortOrder:7,IsClosed:true,IsWon:true,DefaultProbability:100 },
  { ApiName:"Closed Lost",Label:"Closed Lost",IsActive:true,SortOrder:8,IsClosed:true,IsWon:false,DefaultProbability:0 },
]

export const MOCK_LEADS: SFLead[] = [
  { Id:"00Q000001",FirstName:"James",LastName:"Okafor",Email:"james.okafor@example.com",Phone:"+234-801-234-5678",Company:"Okafor Trading Co.",Status:"Working - Contacted",LeadSource:"Web",Rating:"Hot",Lead_Score__c:85,IsConverted:false,Country:"Nigeria",CreatedDate:"2026-03-01T10:00:00Z" },
  { Id:"00Q000002",FirstName:"Sophie",LastName:"Laurent",Email:"sophie.laurent@example.com",Phone:"+33-6-12-34-56-78",Company:"Laurent Epicerie",Status:"Open - Not Contacted",LeadSource:"Advertisement",Rating:"Warm",Lead_Score__c:62,IsConverted:false,Country:"France",CreatedDate:"2026-03-05T11:00:00Z" },
]

export const MOCK_ACCOUNTS: SFAccount[] = [
  { Id:"001000001",Name:"Okafor Trading Co.",Type:"Customer",Industry:"Retail",BillingCity:"Lagos",BillingCountry:"Nigeria",AnnualRevenue:500000,OwnerId:"005000001",CreatedDate:"2026-03-10T10:00:00Z", ...({ Support_Tier__c: 'Premium', Support_Type__c: 'Premium' } as any) },
  { Id:"001000002",Name:"Laurent Epicerie",Type:"Customer",Industry:"Food & Beverage",BillingCity:"Paris",BillingCountry:"France",AnnualRevenue:250000,OwnerId:"005000001",CreatedDate:"2026-03-12T10:00:00Z", ...({ Support_Tier__c: 'Basic', Support_Type__c: 'Basic' } as any) },
  { Id:"001000003",Name:"Meridian Foods Inc.",Type:"Customer",Industry:"Distribution",BillingCity:"New York",BillingCountry:"USA",AnnualRevenue:1200000,OwnerId:"005000001",CreatedDate:"2026-02-20T10:00:00Z", ...({ Support_Tier__c: 'Premium', Support_Type__c: 'Premium' } as any) },
]

export const MOCK_CONTACTS: SFContact[] = [
  { Id:"003000001",FirstName:"James",LastName:"Okafor",Email:"james.okafor@example.com",AccountId:"001000001",LeadSource:"Web",OwnerId:"005000001",CreatedDate:"2026-03-10T10:00:00Z" },
  { Id:"003000002",FirstName:"Sophie",LastName:"Laurent",Email:"sophie.laurent@example.com",AccountId:"001000002",LeadSource:"Advertisement",OwnerId:"005000001",CreatedDate:"2026-03-12T10:00:00Z" },
]

export const MOCK_OPPORTUNITIES: SFOpportunity[] = [
  { Id:"006000001",Name:"Okafor - Bulk Grain Order Q1",AccountId:"001000001",Account:{Name:"Okafor Trading Co."},StageName:"Proposal/Price Quote",CloseDate:"2026-04-30",Amount:4850.00,Probability:75,LeadSource:"Web",PriceBook2Id:"01s000003",OwnerId:"005000001",ContactId:"003000001",CreatedDate:"2026-03-15T09:00:00Z",LastModifiedDate:"2026-04-01T14:00:00Z" },
  { Id:"006000002",Name:"Laurent - Premium Oil & Dairy",AccountId:"001000002",Account:{Name:"Laurent Epicerie"},StageName:"Negotiation/Review",CloseDate:"2026-04-15",Amount:2340.00,Probability:90,LeadSource:"Advertisement",PriceBook2Id:"01s000002",OwnerId:"005000001",ContactId:"003000002",CreatedDate:"2026-03-20T10:00:00Z",LastModifiedDate:"2026-04-05T09:00:00Z" },
  { Id:"006000003",Name:"Meridian - Monthly Staples Subscription",AccountId:"001000003",Account:{Name:"Meridian Foods Inc."},StageName:"Closed Won",CloseDate:"2026-03-31",Amount:12400.00,Probability:100,LeadSource:"Partner",PriceBook2Id:"01s000001",OwnerId:"005000001",CreatedDate:"2026-03-01T08:00:00Z",LastModifiedDate:"2026-03-31T16:00:00Z" },
]

export const MOCK_QUOTES: SFQuote[] = [
  { Id:"0Q0000001",Name:"Q-2026-0001",OpportunityId:"006000001",Opportunity:{Name:"Okafor - Bulk Grain Order Q1",StageName:"Proposal/Price Quote"},Status:"Draft",ExpirationDate:"2026-05-01",TotalPrice:4850.00,GrandTotal:5238.00,Discount:0,IsSyncing:false,CreatedDate:"2026-03-16T09:00:00Z",LastModifiedDate:"2026-03-20T10:00:00Z" },
  { Id:"0Q0000002",Name:"Q-2026-0002",OpportunityId:"006000002",Opportunity:{Name:"Laurent - Premium Oil & Dairy",StageName:"Negotiation/Review"},Status:"Approved",ExpirationDate:"2026-04-20",TotalPrice:2340.00,GrandTotal:2527.20,Discount:5,IsSyncing:true,CreatedDate:"2026-03-22T10:00:00Z",LastModifiedDate:"2026-04-02T11:00:00Z" },
]

export const MOCK_ORDERS: SFOrder[] = [
  { Id:"801000001",OpportunityId:"006000003",Status:"Activated",TotalAmount:12400.00,EffectiveDate:"2026-03-31",CreatedDate:"2026-03-31T16:30:00Z" },
]

export const MOCK_CONTRACTS: SFContract[] = [
  { Id:"800000001",AccountId:"001000003",Status:"Activated",StartDate:"2026-04-01",ContractTerm:12,EndDate:"2027-03-31",TotalAmount:148800.00,Description:"Annual bulk grocery supply agreement.",OwnerId:"005000001",CreatedDate:"2026-04-01T09:00:00Z",LastModifiedDate:"2026-04-01T09:00:00Z" },
]

export const MOCK_CASES: SFCase[] = [
  { Id:"500000001",CaseNumber:"00001001",Subject:"Missing item in last delivery",Description:"My last order was missing 2 bags of basmati rice.",Status:"New",Priority:"High",Origin:"Web",ContactId:"003000001",CreatedDate:"2026-04-03T14:00:00Z",LastModifiedDate:"2026-04-03T14:00:00Z" },
  { Id:"500000002",CaseNumber:"00001002",Subject:"Request for bulk pricing quote",Description:"We would like a custom quote for ordering 50+ units of olive oil monthly.",Status:"In Progress",Priority:"Medium",Origin:"Email",ContactId:"003000002",CreatedDate:"2026-04-01T10:00:00Z",LastModifiedDate:"2026-04-04T11:00:00Z" },
]

export const MOCK_CAMPAIGNS: SFCampaign[] = [
  { Id:"701000001",Name:"Q2 2026 Global Launch",Type:"Email",Status:"Active",StartDate:"2026-04-01",EndDate:"2026-06-30",BudgetedCost:15000,ActualCost:3200,ExpectedRevenue:75000,NumberOfLeads:124,NumberOfContacts:89,NumberOfConvertedLeads:22,IsActive:true },
  { Id:"701000002",Name:"Africa Market Expansion",Type:"Other",Status:"Active",StartDate:"2026-03-01",EndDate:"2026-07-31",BudgetedCost:25000,ActualCost:8500,ExpectedRevenue:120000,NumberOfLeads:87,NumberOfContacts:45,NumberOfConvertedLeads:15,IsActive:true },
  { Id:"701000003",Name:"Europe Premium Collection",Type:"Advertisement",Status:"Planned",StartDate:"2026-05-01",EndDate:"2026-08-31",BudgetedCost:20000,ActualCost:0,ExpectedRevenue:90000,NumberOfLeads:0,NumberOfContacts:0,NumberOfConvertedLeads:0,IsActive:false },
]

export const MOCK_KNOWLEDGE_ARTICLES: SFKnowledgeArticle[] = [
  { Id:"ka0000001",Title:"How to Place a Bulk Order",Summary:"Step-by-step guide to placing large quantity orders through GlobalGrocer.",UrlName:"how-to-place-bulk-order",Categories:["Ordering","Getting Started"],CreatedDate:"2026-01-15T00:00:00Z" },
  { Id:"ka0000002",Title:"Understanding Regional Pricing",Summary:"Explains how our three-tier regional pricing system works across Africa, Europe, and North America.",UrlName:"regional-pricing-explained",Categories:["Pricing","Regions"],CreatedDate:"2026-01-20T00:00:00Z" },
  { Id:"ka0000003",Title:"Delivery Timeframes by Region",Summary:"Expected delivery windows for each region and how to track your order.",UrlName:"delivery-timeframes",Categories:["Shipping","Tracking"],CreatedDate:"2026-01-22T00:00:00Z" },
  { Id:"ka0000004",Title:"How to Submit a Support Case",Summary:"Learn how to raise a support case and what info to include for fastest resolution.",UrlName:"submit-support-case",Categories:["Support","Getting Started"],CreatedDate:"2026-02-01T00:00:00Z" },
  { Id:"ka0000005",Title:"B2B Account Setup & Contract Process",Summary:"Guide for businesses on setting up a corporate account and signing a supply contract.",UrlName:"b2b-account-setup",Categories:["B2B","Contracts"],CreatedDate:"2026-02-10T00:00:00Z" },
  { Id:"ka0000006",Title:"Payment Methods & Invoice Requests",Summary:"Accepted payment methods, how to request invoices, and payment terms.",UrlName:"payment-methods",Categories:["Payments","Billing"],CreatedDate:"2026-02-15T00:00:00Z" },
]

export const MOCK_KNOWLEDGE_CATEGORIES = [
  { label: 'Product Issues',     name: 'product_issues'      },
  { label: 'Shipping and Delivery', name: 'Shipping_and_Delivery' },
  { label: 'Returns and Refunds',   name: 'Returns_and_Refunds'   },
  { label: 'Account Management',    name: 'Account_Management'    },
  { label: 'General Enquiries',     name: 'General_Enquiries'     },
]

export function getMockEntriesForPriceBook(priceBookId: string) {
  return MOCK_PRICE_BOOK_ENTRIES.filter(e => e.PriceBook2Id === priceBookId)
}

export function getMockPriceBookByRegion(region: string) {
    const regionMap: Record<string, string> = {
      "africa": "01s000003",
      "europe": "01s000002",
      "GBP": "01s000004",
      "north-america": "01s000001",
    }
  return MOCK_PRICE_BOOKS.find(pb => pb.Id === regionMap[region])
}

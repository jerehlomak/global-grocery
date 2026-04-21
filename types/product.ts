import type { SFProduct, SFPriceBookEntry } from "./salesforce"

export type Region = "USD" | "EUR" | "NGN"

export interface RegionConfig {
  id: Region
  label: string
  currency: string
  currencySymbol: string
  flag: string
}

export const REGIONS: RegionConfig[] = [
  {
    id: "USD",
    label: "US Dollar",
    currency: "USD",
    currencySymbol: "$",
    flag: "🇺🇸",
  },
  {
    id: "EUR",
    label: "Euro",
    currency: "EUR",
    currencySymbol: "€",
    flag: "🇪🇺",
  },
  {
    id: "NGN",
    label: "Nigerian Naira",
    currency: "NGN",
    currencySymbol: "₦",
    flag: "🇳🇬",
  },
]

export interface Product {
  id: string
  name: string
  productCode: string
  description: string
  family: string
  imageUrl: string | null
  isActive: boolean
  // Pricing from PriceBookEntry for selected region
  unitPrice: number
  currency: string
  priceBookEntryId: string
  // Raw SF records
  sfProduct?: SFProduct
  sfPriceBookEntry?: SFPriceBookEntry
}

export interface ProductFamily {
  name: string
  slug: string
  icon: string
  count: number
}

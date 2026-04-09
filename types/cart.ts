export interface CartItem {
  productId: string
  priceBookEntryId: string
  name: string
  imageUrl: string
  unitPrice: number
  currency: string
  quantity: number
  productCode: string
  family: string
}

export interface Cart {
  items: CartItem[]
  region: string
  currency: string
}

export interface CartSummary {
  subtotal: number
  shipping: number
  tax: number
  total: number
  currency: string
  itemCount: number
}

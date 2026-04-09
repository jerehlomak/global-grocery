import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CartItem, CartSummary } from "@/types/cart"

interface CartState {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  getSummary: () => CartSummary
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            }
          }
          return { items: [...state.items, item] }
        })
      },

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getSummary: (): CartSummary => {
        const { items } = get()
        const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
        const shipping = subtotal > 100 ? 0 : 9.99
        const tax = subtotal * 0.08
        const currency = items[0]?.currency || "USD"
        return {
          subtotal,
          shipping,
          tax,
          total: subtotal + shipping + tax,
          currency,
          itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
        }
      },
    }),
    { name: "globalgrocer-cart" }
  )
)

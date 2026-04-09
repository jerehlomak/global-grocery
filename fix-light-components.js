const fs = require('fs');

//  PRODUCT CARD (light) --
fs.writeFileSync('components/products/ProductCard.tsx', `'use client'
import { motion } from 'framer-motion'
import { ShoppingCart } from 'lucide-react'
import type { Product } from '@/types/product'
import { useCartStore } from '@/lib/store/cartStore'
import Link from 'next/link'

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addItem, openCart } = useCartStore()

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem({ productId: product.id, priceBookEntryId: product.priceBookEntryId, name: product.name, imageUrl: product.imageUrl, unitPrice: product.unitPrice, currency: product.currency, quantity: 1, productCode: product.productCode, family: product.family })
    openCart()
  }

  const fmt = (p: number, c: string) => new Intl.NumberFormat('en-US', { style: 'currency', currency: c }).format(p)

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.04 }} whileHover={{ y: -4 }}>
      <Link href={'/products/' + product.id} style={{ textDecoration: 'none', display: 'block' }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(79,70,229,0.12)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)' }}
        >
          <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
            <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.06)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            />
            <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', borderRadius: 20, padding: '3px 10px', fontSize: 11, color: '#475569', border: '1px solid #e2e8f0' }}>
              {product.family}
            </div>
          </div>
          <div style={{ padding: 16 }}>
            <h3 style={{ color: '#0f172a', fontWeight: 600, fontSize: 14, marginBottom: 6, lineHeight: 1.4 }}>{product.name}</h3>
            <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 14, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {product.description}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ color: '#4f46e5', fontWeight: 700, fontSize: 18 }}>{fmt(product.unitPrice, product.currency)}</span>
                <div style={{ color: '#94a3b8', fontSize: 11 }}>{product.productCode}</div>
              </div>
              <button onClick={handleAdd}
                style={{ background: '#4f46e5', border: 'none', borderRadius: 10, padding: '8px 14px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, transition: 'background 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#4338ca')}
                onMouseLeave={e => (e.currentTarget.style.background = '#4f46e5')}
              >
                <ShoppingCart size={14} /> Add
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
`);
console.log('Fixed: ProductCard.tsx');

//  REGION TOGGLE (light) 
fs.writeFileSync('components/products/RegionPricingToggle.tsx', `'use client'
import { useRegionStore } from '@/lib/store/regionStore'
import { REGIONS } from '@/types/product'

export default function RegionPricingToggle() {
  const { region, setRegion } = useRegionStore()
  return (
    <div style={{ display: 'flex', background: '#f1f4f9', border: '1px solid #e2e8f0', borderRadius: 12, padding: 4, gap: 4 }}>
      {REGIONS.map((r) => (
        <button key={r.id} onClick={() => setRegion(r.id)}
          style={{ borderRadius: 8, padding: '6px 14px', border: 'none', cursor: 'pointer', background: region === r.id ? '#4f46e5' : 'transparent', color: region === r.id ? 'white' : '#475569', fontSize: 13, fontWeight: region === r.id ? 600 : 400, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>{r.flag}</span><span>{r.label}</span><span style={{ fontSize: 11, opacity: 0.7 }}>({r.currencySymbol})</span>
        </button>
      ))}
    </div>
  )
}
`);
console.log('Fixed: RegionPricingToggle.tsx');

//  CART DRAWER (light) 
fs.writeFileSync('components/cart/CartDrawer.tsx', `'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, ShoppingBag, ArrowRight, Plus, Minus } from 'lucide-react'
import { useCartStore } from '@/lib/store/cartStore'
import Link from 'next/link'

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getSummary } = useCartStore()
  const summary = getSummary()
  const fmt = (p: number, c: string) => new Intl.NumberFormat('en-US', { style: 'currency', currency: c }).format(p)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeCart}
            style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)', zIndex: 99 }}
          />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 420, background: '#ffffff', borderLeft: '1px solid #e2e8f0', zIndex: 100, display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 40px rgba(0,0,0,0.08)' }}>
            
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShoppingBag size={18} color="#4f46e5" />
                <h2 style={{ color: '#0f172a', fontWeight: 700, fontSize: 18 }}>Your Cart</h2>
                <span style={{ background: '#ede9fe', color: '#4f46e5', borderRadius: 20, padding: '2px 8px', fontSize: 12, fontWeight: 600 }}>{summary.itemCount}</span>
              </div>
              <button onClick={closeCart} style={{ background: '#f8f9fc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#475569' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
              {items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
                  <ShoppingBag size={48} style={{ margin: '0 auto 16px', opacity: 0.25 }} />
                  <p style={{ fontSize: 15, fontWeight: 500, color: '#475569' }}>Your cart is empty</p>
                  <p style={{ fontSize: 13, marginTop: 4 }}>Add some products to get started</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <AnimatePresence>
                    {items.map(item => (
                      <motion.div key={item.productId} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 20 }}
                        style={{ background: '#f8f9fc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 12, display: 'flex', gap: 12 }}>
                        <img src={item.imageUrl} alt={item.name} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <p style={{ color: '#0f172a', fontWeight: 500, fontSize: 13, marginBottom: 4 }}>{item.name}</p>
                          <p style={{ color: '#4f46e5', fontWeight: 700, fontSize: 14 }}>{fmt(item.unitPrice, item.currency)}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                            <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, width: 24, height: 24, cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={12} /></button>
                            <span style={{ color: '#0f172a', fontWeight: 600, fontSize: 14, minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, width: 24, height: 24, cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={12} /></button>
                          </div>
                        </div>
                        <button onClick={() => removeItem(item.productId)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', alignSelf: 'flex-start', padding: 4 }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#dc2626')}
                          onMouseLeave={e => (e.currentTarget.style.color = '#cbd5e1')}><Trash2 size={14} /></button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', flexShrink: 0, background: '#fafbfc' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                  {[['Subtotal', summary.subtotal], ['Shipping', summary.shipping], ['Tax (8%)', summary.tax]].map(([l, v]) => (
                    <div key={l as string} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#475569' }}>
                      <span>{l}</span><span>{l === 'Shipping' && v === 0 ? 'Free' : fmt(v as number, summary.currency)}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, color: '#0f172a', paddingTop: 8, borderTop: '1px solid #e2e8f0' }}>
                    <span>Total</span><span style={{ color: '#4f46e5' }}>{fmt(summary.total, summary.currency)}</span>
                  </div>
                </div>
                <Link href="/checkout" onClick={closeCart} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#4f46e5', color: 'white', borderRadius: 12, padding: '14px 24px', textDecoration: 'none', fontWeight: 600, fontSize: 15 }}>
                  Proceed to Checkout <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
`);
console.log('Fixed: CartDrawer.tsx');

//  SALES PATH (light) 
fs.writeFileSync('components/dashboard/SalesPath.tsx', `'use client'
import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import type { SFOpportunityStage } from '@/types/salesforce'

export default function SalesPath({ stages, currentStage }: { stages: SFOpportunityStage[]; currentStage: string }) {
  const activeStages = stages.filter(s => !s.IsClosed || s.ApiName === currentStage)
  const currentIdx = activeStages.findIndex(s => s.ApiName === currentStage)
  return (
    <div style={{ padding: '16px 0', overflowX: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', minWidth: 600 }}>
        {activeStages.map((stage, idx) => {
          const done = idx < currentIdx || (stage.IsWon && stage.ApiName === currentStage)
          const active = stage.ApiName === currentStage
          return (
            <div key={stage.ApiName} style={{ display: 'flex', alignItems: 'center', flex: idx < activeStages.length - 1 ? 1 : 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <motion.div animate={{ scale: active ? 1.1 : 1 }}
                  style={{ width: 32, height: 32, borderRadius: '50%', background: done ? '#059669' : active ? '#4f46e5' : '#f1f4f9', border: active ? '2px solid #4f46e5' : done ? '2px solid #059669' : '2px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: active ? '0 0 12px rgba(79,70,229,0.25)' : 'none', flexShrink: 0 }}>
                  {done ? <CheckCircle2 size={16} color="white" /> : <span style={{ color: active ? 'white' : '#94a3b8', fontSize: 11, fontWeight: 700 }}>{idx + 1}</span>}
                </motion.div>
                <span style={{ fontSize: 10, color: active ? '#4f46e5' : done ? '#059669' : '#94a3b8', fontWeight: active ? 600 : 400, textAlign: 'center', maxWidth: 70, lineHeight: 1.3 }}>{stage.Label}</span>
              </div>
              {idx < activeStages.length - 1 && <div style={{ flex: 1, height: 2, background: idx < currentIdx ? '#059669' : '#e2e8f0', margin: '0 4px', marginTop: -18 }} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
`);
console.log('Fixed: SalesPath.tsx');

//  LEAD SCORE (light) 
fs.writeFileSync('components/dashboard/LeadScoreBadge.tsx', `'use client'
import { Flame, Thermometer, Snowflake } from 'lucide-react'
import type { LeadScoreCategory } from '@/types/api'
import { getLeadScoreCategory } from '@/types/api'

export default function LeadScoreBadge({ score, showLabel = true }: { score: number; showLabel?: boolean }) {
  const cat = getLeadScoreCategory(score)
  const cfg: Record<LeadScoreCategory, { color: string; bg: string; icon: typeof Flame; label: string }> = {
    hot: { color: '#dc2626', bg: '#fee2e2', icon: Flame, label: 'Hot Lead' },
    warm: { color: '#d97706', bg: '#fef3c7', icon: Thermometer, label: 'Warm Lead' },
    cold: { color: '#2563eb', bg: '#dbeafe', icon: Snowflake, label: 'Cold Lead' },
  }
  const { color, bg, icon: Icon, label } = cfg[cat]
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: bg, border: '1px solid ' + color + '33', borderRadius: 20, padding: '4px 12px' }}>
      <Icon size={13} color={color} />
      <span style={{ color, fontWeight: 700, fontSize: 13 }}>{score}</span>
      {showLabel && <span style={{ color, fontSize: 12 }}>{label}</span>}
    </div>
  )
}
`);
console.log('Fixed: LeadScoreBadge.tsx');
console.log('\\nAll components converted to light mode!');

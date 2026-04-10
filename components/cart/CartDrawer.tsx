'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, ShoppingBag, ArrowRight, Plus, Minus } from 'lucide-react'
import { useCartStore } from '@/lib/store/cartStore'
import Link from 'next/link'

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getSummary } = useCartStore()
  const summary = getSummary()
  const fmt = (p: number, c: string) => new Intl.NumberFormat(c === 'NGN' ? 'en-NG' : 'en-US', { style: 'currency', currency: c }).format(p)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeCart}
            style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)', zIndex: 99 }}
          />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: 420, background: '#ffffff', borderLeft: '1px solid #e2e8f0', zIndex: 100, display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 40px rgba(0,0,0,0.08)' }}>
            
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
                        <img src={item.imageUrl || '/placeholder-product.png'} alt={item.name} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
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

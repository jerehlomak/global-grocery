'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ShoppingCart, ShieldCheck, Truck, Plus, Minus } from 'lucide-react'
import { motion } from 'framer-motion'
import { fetchProducts } from '@/services/productService'
import { useRegionStore } from '@/lib/store/regionStore'
import { useCartStore } from '@/lib/store/cartStore'
import type { Product } from '@/types/product'

export default function ProductDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { region } = useRegionStore()
  const { addItem, openCart } = useCartStore()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)

  useEffect(() => {
    fetchProducts(region).then(res => {
      const p = Object.values(res).flat().find(x => x.id === id)
      if (p) setProduct(p)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id, region])

  if (loading) return (
    <div style={{ maxWidth: 1000, margin: '60px auto', padding: '0 24px', display: 'flex', gap: 40 }}>
      <div className="skeleton" style={{ width: 450, height: 450, borderRadius: 20 }} />
      <div style={{ flex: 1, padding: '20px 0' }}>
        <div className="skeleton" style={{ width: '30%', height: 20, marginBottom: 16 }} />
        <div className="skeleton" style={{ width: '80%', height: 40, marginBottom: 24 }} />
        <div className="skeleton" style={{ width: '40%', height: 30, marginBottom: 32 }} />
        <div className="skeleton" style={{ width: '100%', height: 100 }} />
      </div>
    </div>
  )

  if (!product) return (
    <div style={{ textAlign: 'center', padding: '100px 24px', color: '#475569' }}>
      <h2>Product not found</h2>
      <button onClick={() => router.back()} style={{ marginTop: 16, background: '#e2e8f0', color: '#0f172a', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer' }}>Go Back</button>
    </div>
  )

  const fmt = (p: number, c: string) => new Intl.NumberFormat(c === 'NGN' ? 'en-NG' : 'en-US', { style: 'currency', currency: c }).format(p)

  const handleAdd = () => {
    addItem({ productId: product.id, priceBookEntryId: product.priceBookEntryId, name: product.name, imageUrl: product.imageUrl, unitPrice: product.unitPrice, currency: product.currency, quantity: qty, productCode: product.productCode, family: product.family })
    openCart()
  }

  return (
    <div style={{ maxWidth: 1100, margin: '40px auto 100px', padding: '0 24px' }}>
      <button onClick={() => router.back()} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: 32, fontSize: 14, fontWeight: 500 }}>
        <ArrowLeft size={16} /> Back to Products
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 450px) 1fr', gap: 60, alignItems: 'start' }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, overflow: 'hidden', padding: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: 'auto', aspectRatio: '1/1', objectFit: 'cover', borderRadius: 16 }} />
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <div style={{ display: 'inline-block', background: '#f1f5f9', color: '#475569', fontSize: 13, fontWeight: 600, padding: '4px 12px', borderRadius: 20, marginBottom: 16 }}>{product.family}</div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 36, fontWeight: 800, color: '#0f172a', marginBottom: 12, lineHeight: 1.2 }}>{product.name}</h1>
          <p style={{ color: '#64748b', fontSize: 13, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>Item Code:</span> <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, color: '#334155' }}>{product.productCode}</code>
          </p>

          <div style={{ margin: '32px 0' }}>
            <div style={{ fontSize: 40, fontWeight: 800, color: '#4f46e5', letterSpacing: '-0.02em', marginBottom: 8 }}>{fmt(product.unitPrice, product.currency)}</div>
            <div style={{ color: '#059669', fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}><ShieldCheck size={16} /> In Stock (Salesforce Live)</div>
          </div>

          <p style={{ color: '#475569', fontSize: 16, lineHeight: 1.7, marginBottom: 40 }}>{product.description}</p>

          <div style={{ background: '#f8f9fc', border: '1px solid #e2e8f0', borderRadius: 16, padding: '24px', display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-end' }}>
             <div>
               <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Quantity</label>
               <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #cbd5e1', borderRadius: 12, overflow: 'hidden' }}>
                 <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 44, height: 44, background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={16} /></button>
                 <div style={{ width: 48, textAlign: 'center', fontWeight: 600, color: '#0f172a', fontSize: 16 }}>{qty}</div>
                 <button onClick={() => setQty(qty + 1)} style={{ width: 44, height: 44, background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={16} /></button>
               </div>
             </div>
             
             <button onClick={handleAdd} style={{ flex: 1, background: '#4f46e5', color: 'white', border: 'none', borderRadius: 12, height: 44, fontSize: 16, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 12px rgba(79,70,229,0.25)', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#4338ca'} onMouseLeave={e => e.currentTarget.style.background = '#4f46e5'}>
               <ShoppingCart size={18} /> Add to Cart  {fmt(product.unitPrice * qty, product.currency)}
             </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 32 }}>
             <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
               <Truck color="#64748b" size={20} style={{ flexShrink: 0, marginTop: 2 }} />
               <div>
                 <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 14 }}>Global Shipping</div>
                 <div style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>Delivery times vary by region (2-5 business days average)</div>
               </div>
             </div>
             <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
               <ShieldCheck color="#64748b" size={20} style={{ flexShrink: 0, marginTop: 2 }} />
               <div>
                 <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 14 }}>Quality Guarantee</div>
                 <div style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>All products sourced from certified global suppliers</div>
               </div>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

'use client'
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

  const fmt = (p: number, c: string) => new Intl.NumberFormat(c === 'NGN' ? 'en-NG' : 'en-US', { style: 'currency', currency: c }).format(p)

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.04 }} whileHover={{ y: -4 }}>
      <Link href={'/products/' + product.id} style={{ textDecoration: 'none', display: 'block' }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(79,70,229,0.12)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)' }}
        >
          <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
            <img src={product.imageUrl || '/placeholder-product.png'} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
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

'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { fetchProducts, fetchFamilies } from '@/services/productService'
import { useRegionStore } from '@/lib/store/regionStore'
import type { Product } from '@/types/product'
import ProductCard from '@/components/products/ProductCard'
import RegionPricingToggle from '@/components/products/RegionPricingToggle'
import { SkeletonCard } from '@/components/shared/SkeletonLoader'
import LastSynced from '@/components/shared/LastSynced'

export default function ProductsPage() {
  const { region } = useRegionStore()
  const [products, setProducts] = useState<Record<string, Product[]>>({})
  const [filtered, setFiltered] = useState<Record<string, Product[]>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [family, setFamily] = useState('All')
  const [lastSynced, setLastSynced] = useState<string>()
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [familiesList, setFamiliesList] = useState<string[]>(['All'])

  useEffect(() => {
    fetchFamilies()
      .then(fams => setFamiliesList(['All', ...fams]))
      .catch(console.error)
  }, [])

  const load = async (pageNum = 1) => {
    if (pageNum === 1) setLoading(true)
    else setLoadingMore(true)
    
    try {
      const data = await fetchProducts(region, family === 'All' ? undefined : family, search || undefined, pageNum)
      if (pageNum === 1) {
        setProducts(data)
        setFiltered(data)
      } else {
        setProducts(prev => {
          const next = { ...prev }
          Object.keys(data).forEach(k => next[k] = [...(next[k]||[]), ...data[k]])
          return next
        })
        setFiltered(prev => {
          const next = { ...prev }
          Object.keys(data).forEach(k => next[k] = [...(next[k]||[]), ...data[k]])
          return next
        })
      }
      const dataSize = Object.values(data).flat().length
      setHasMore(dataSize === 10)
      setPage(pageNum)
      setLastSynced(new Date().toISOString())
    } finally { 
      setLoading(false) 
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      load(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [region, family, search])

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: 40 }}>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ fontFamily: 'Outfit, sans-serif', fontSize: 36, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
          Our Products
        </motion.h1>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <p style={{ color: '#64748b', fontSize: 16 }}>{Object.values(filtered).flat().length} products  Current pricing currency is selected below</p>
          <LastSynced timestamp={lastSynced} source="mock" onRefresh={load} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap', alignItems: 'center' }}>
        <RegionPricingToggle />
        <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products by name or category..."
            style={{ width: '100%', background: '#fff', border: '1px solid #cbd5e1', borderRadius: 12, padding: '12px 16px 12px 48px', color: '#0f172a', fontSize: 15, outline: 'none', boxSizing: 'border-box', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, marginBottom: 32, WebkitOverflowScrolling: 'touch' }}>
        {familiesList.map(f => (
          <button key={f} onClick={() => setFamily(f)}
            style={{ background: family === f ? '#4f46e5' : '#fff', border: '1px solid ' + (family === f ? '#4f46e5' : '#cbd5e1'), borderRadius: 24, padding: '8px 20px', color: family === f ? 'white' : '#475569', cursor: 'pointer', fontSize: 14, whiteSpace: 'nowrap', fontWeight: family === f ? 600 : 500, transition: 'all 0.2s', boxShadow: family === f ? '0 4px 12px rgba(79,70,229,0.2)' : '0 1px 2px rgba(0,0,0,0.03)' }}>
            {f}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        {loading && page === 1 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )
          : Object.keys(filtered).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#64748b' }}>
              <p style={{ fontSize: 18, fontWeight: 500, marginBottom: 8, color: '#475569' }}>No products found</p>
              <p style={{ fontSize: 15 }}>Try adjusting your search query or category filter</p>
            </div>
          ) : Object.entries(filtered).map(([category, items]) => (
            <div key={category}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>{category}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
                {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
            </div>
          ))
        }
      </div>

      {hasMore && Object.keys(filtered).length > 0 && !loading && (
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <button 
            onClick={() => load(page + 1)}
            disabled={loadingMore}
            style={{ 
              background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 24, 
              padding: '12px 32px', color: '#0f172a', fontWeight: 600, fontSize: 16, 
              cursor: loadingMore ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
              opacity: loadingMore ? 0.7 : 1 
            }}>
            {loadingMore ? 'Loading...' : 'Load More Products'}
          </button>
        </div>
      )}
    </div>
  )
}

'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, X, ChevronDown, ArrowUpDown } from 'lucide-react'
import { fetchProducts, fetchFamilies } from '@/services/productService'
import { useRegionStore } from '@/lib/store/regionStore'
import type { Product } from '@/types/product'
import ProductCard from '@/components/products/ProductCard'
import RegionPricingToggle from '@/components/products/RegionPricingToggle'
import { SkeletonCard } from '@/components/shared/SkeletonLoader'
import LastSynced from '@/components/shared/LastSynced'

type SortOption = 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc'

const SORT_LABELS: Record<SortOption, string> = {
  name_asc: 'Name: A → Z',
  name_desc: 'Name: Z → A',
  price_asc: 'Price: Low → High',
  price_desc: 'Price: High → Low',
}

function applyClientFilters(
  grouped: Record<string, Product[]>,
  minPrice: number,
  maxPrice: number,
  sort: SortOption
): Record<string, Product[]> {
  const result: Record<string, Product[]> = {}
  for (const [cat, items] of Object.entries(grouped)) {
    let filtered = items.filter(p => p.unitPrice >= minPrice && p.unitPrice <= maxPrice)
    filtered = [...filtered].sort((a, b) => {
      if (sort === 'name_asc') return a.name.localeCompare(b.name)
      if (sort === 'name_desc') return b.name.localeCompare(a.name)
      if (sort === 'price_asc') return a.unitPrice - b.unitPrice
      if (sort === 'price_desc') return b.unitPrice - a.unitPrice
      return 0
    })
    if (filtered.length > 0) result[cat] = filtered
  }
  return result
}

export default function ProductsPage() {
  const { region } = useRegionStore()
  const [mounted, setMounted] = useState(false)
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

  // Client-side filters
  const [sort, setSort] = useState<SortOption>('name_asc')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000])
  const [maxPriceCap, setMaxPriceCap] = useState(10000)
  const [showFilters, setShowFilters] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)

  // Hydration guard — only fetch after client mount so Zustand store is ready
  useEffect(() => { setMounted(true) }, [])

  // Close sort dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

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
      let merged: Record<string, Product[]>

      if (pageNum === 1) {
        merged = data
        setProducts(data)
        // Compute price cap from first page
        const allPrices = Object.values(data).flat().map(p => p.unitPrice)
        if (allPrices.length > 0) {
          const cap = Math.ceil(Math.max(...allPrices) * 1.1)
          setMaxPriceCap(cap)
          setPriceRange([0, cap])
        }
      } else {
        merged = { ...products }
        Object.keys(data).forEach(k => {
          merged[k] = [...(merged[k] || []), ...data[k]]
        })
        setProducts(merged)
      }

      const dataSize = Object.values(data).flat().length
      setHasMore(dataSize === 10)
      setPage(pageNum)
      setLastSynced(new Date().toISOString())
      setFiltered(applyClientFilters(merged, priceRange[0], priceRange[1], sort))
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // Re-apply client filters whenever filter state changes
  useEffect(() => {
    setFiltered(applyClientFilters(products, priceRange[0], priceRange[1], sort))
  }, [sort, priceRange, products])

  useEffect(() => {
    if (!mounted) return
    const timer = setTimeout(() => { load(1) }, 400)
    return () => clearTimeout(timer)
  }, [region, family, search, mounted])

  const totalVisible = Object.values(filtered).flat().length
  const totalAll = Object.values(products).flat().length

  const activeFilterCount =
    (sort !== 'name_asc' ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < maxPriceCap ? 1 : 0) +
    (search.trim() !== '' ? 1 : 0) +
    (family !== 'All' ? 1 : 0)

  const clearAllFilters = () => {
    setSearch('')
    setFamily('All')
    setSort('name_asc')
    setPriceRange([0, maxPriceCap])
    setShowFilters(false)
  }

  const fmt = (v: number) => new Intl.NumberFormat('en-US', {
    style: 'currency', currency: region === 'NGN' ? 'NGN' : region === 'EUR' ? 'EUR' : 'USD',
    maximumFractionDigits: 0
  }).format(v)

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>

      {/* Header */}
      <style>{`
        @media (max-width: 640px) {
          .products-heading { text-align: center !important; font-size: 28px !important; }
          .products-controls { flex-direction: column !important; }
          .products-controls > * { width: 100%; }
        }
      `}</style>
      <div style={{ marginBottom: 32 }}>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="products-heading"
          style={{ fontFamily: 'Outfit, sans-serif', fontSize: 36, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
          Our Products
        </motion.h1>
        <div className="mobile-col mobile-stack mobile-text-center"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <p style={{ color: '#64748b', fontSize: 15 }}>
            Showing <strong style={{ color: '#0f172a' }}>{totalVisible}</strong>
            {totalVisible !== totalAll && <span> of {totalAll}</span>} products
          </p>
          <LastSynced timestamp={lastSynced} source="salesforce" onRefresh={load} />
        </div>
      </div>

      {/* Controls Row */}
      <div className="products-controls" style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <RegionPricingToggle />

        {/* Search */}
        <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            style={{ width: '100%', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px 10px 40px', color: '#0f172a', fontSize: 14, outline: 'none', boxSizing: 'border-box', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }} />
        </div>

        {/* Sort dropdown */}
        <div ref={sortRef} style={{ position: 'relative' }}>
          <button onClick={() => setSortOpen(o => !o)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 16px', color: '#374151', fontSize: 14, fontWeight: 500, cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', whiteSpace: 'nowrap' }}>
            <ArrowUpDown size={15} color="#6366f1" />
            {SORT_LABELS[sort]}
            <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: sortOpen ? 'rotate(180deg)' : 'none' }} />
          </button>
          <AnimatePresence>
            {sortOpen && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 50, minWidth: 200, overflow: 'hidden' }}>
                {(Object.keys(SORT_LABELS) as SortOption[]).map(opt => (
                  <button key={opt} onClick={() => { setSort(opt); setSortOpen(false) }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 16px', background: sort === opt ? '#f0f0ff' : 'transparent', color: sort === opt ? '#4f46e5' : '#374151', fontSize: 14, fontWeight: sort === opt ? 600 : 400, cursor: 'pointer', border: 'none', borderBottom: '1px solid #f1f5f9' }}>
                    {SORT_LABELS[opt]}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Filters toggle */}
        <button onClick={() => setShowFilters(o => !o)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: showFilters ? '#4f46e5' : '#fff', border: '1px solid ' + (showFilters ? '#4f46e5' : '#e2e8f0'), borderRadius: 10, padding: '10px 16px', color: showFilters ? '#fff' : '#374151', fontSize: 14, fontWeight: 500, cursor: 'pointer', position: 'relative', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
          <SlidersHorizontal size={15} />
          Filters
          {activeFilterCount > 0 && (
            <span style={{ background: showFilters ? 'rgba(255,255,255,0.3)' : '#4f46e5', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Clear filters pill — always visible when anything is active */}
        <AnimatePresence>
          {activeFilterCount > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              onClick={clearAllFilters}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', color: '#dc2626', fontSize: 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              <X size={14} />
              Clear filters
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Expandable Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Filters</h3>
                {activeFilterCount > 0 && (
                  <button onClick={clearAllFilters}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '4px 10px', color: '#dc2626', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                    <X size={12} /> Clear all
                  </button>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>

                {/* Price Range */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Price Range</span>
                    <span style={{ fontSize: 13, color: '#6366f1', fontWeight: 600 }}>{fmt(priceRange[0])} – {fmt(priceRange[1])}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 12, color: '#64748b', minWidth: 24 }}>Min</span>
                      <input type="range" min={0} max={maxPriceCap} step={Math.ceil(maxPriceCap / 100)}
                        value={priceRange[0]}
                        onChange={e => { const v = Number(e.target.value); if (v <= priceRange[1]) setPriceRange([v, priceRange[1]]) }}
                        style={{ flex: 1, accentColor: '#4f46e5' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 12, color: '#64748b', minWidth: 24 }}>Max</span>
                      <input type="range" min={0} max={maxPriceCap} step={Math.ceil(maxPriceCap / 100)}
                        value={priceRange[1]}
                        onChange={e => { const v = Number(e.target.value); if (v >= priceRange[0]) setPriceRange([priceRange[0], v]) }}
                        style={{ flex: 1, accentColor: '#4f46e5' }} />
                    </div>
                  </div>
                  {/* Quick price presets */}
                  <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                    {[[0, maxPriceCap], [0, maxPriceCap * 0.25], [maxPriceCap * 0.25, maxPriceCap * 0.6], [maxPriceCap * 0.6, maxPriceCap]].map(([lo, hi], i) => {
                      const label = i === 0 ? 'Any' : i === 1 ? 'Budget' : i === 2 ? 'Mid-range' : 'Premium'
                      const active = priceRange[0] === Math.round(lo) && priceRange[1] === Math.round(hi)
                      return (
                        <button key={label} onClick={() => setPriceRange([Math.round(lo), Math.round(hi)])}
                          style={{ fontSize: 12, padding: '4px 10px', borderRadius: 20, border: '1px solid ' + (active ? '#4f46e5' : '#e2e8f0'), background: active ? '#4f46e5' : '#f8fafc', color: active ? '#fff' : '#64748b', cursor: 'pointer', fontWeight: active ? 600 : 400 }}>
                          {label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Sort (duplicate for panel visibility) */}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Sort By</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {(Object.keys(SORT_LABELS) as SortOption[]).map(opt => (
                      <button key={opt} onClick={() => setSort(opt)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10, border: '1px solid ' + (sort === opt ? '#4f46e5' : '#e2e8f0'), background: sort === opt ? '#f0f0ff' : '#f8fafc', color: sort === opt ? '#4f46e5' : '#374151', fontSize: 13, fontWeight: sort === opt ? 600 : 400, cursor: 'pointer', textAlign: 'left' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: sort === opt ? '#4f46e5' : '#cbd5e1', flexShrink: 0 }} />
                        {SORT_LABELS[opt]}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Family / Category tabs */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, marginBottom: 28, WebkitOverflowScrolling: 'touch' }}>
        {familiesList.map(f => (
          <button key={f} onClick={() => setFamily(f)}
            style={{ background: family === f ? '#4f46e5' : '#fff', border: '1px solid ' + (family === f ? '#4f46e5' : '#e2e8f0'), borderRadius: 24, padding: '8px 20px', color: family === f ? 'white' : '#475569', cursor: 'pointer', fontSize: 14, whiteSpace: 'nowrap', fontWeight: family === f ? 600 : 500, transition: 'all 0.2s', boxShadow: family === f ? '0 4px 12px rgba(79,70,229,0.2)' : '0 1px 2px rgba(0,0,0,0.03)' }}>
            {f}
          </button>
        ))}
      </div>

      {/* Products grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        {loading && page === 1 ? (
          <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : Object.keys(filtered).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#64748b' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
            <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: '#475569' }}>No products found</p>
            <p style={{ fontSize: 14 }}>Try adjusting your search, filters, or category</p>
            {activeFilterCount > 0 && (
              <button onClick={clearAllFilters}
                style={{ marginTop: 16, background: '#4f46e5', border: 'none', borderRadius: 10, padding: '10px 24px', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Clear Filters
              </button>
            )}
          </div>
        ) : Object.entries(filtered).map(([category, items]) => (
          <div key={category}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0 }}>{category}</h2>
              <span style={{ fontSize: 13, color: '#94a3b8', background: '#f1f5f9', borderRadius: 20, padding: '2px 10px' }}>{items.length}</span>
            </div>
            <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
              {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        ))}
      </div>

      {/* Load more */}
      {hasMore && Object.keys(filtered).length > 0 && !loading && (
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <button onClick={() => load(page + 1)} disabled={loadingMore}
            style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 24, padding: '12px 36px', color: '#374151', fontWeight: 600, fontSize: 15, cursor: loadingMore ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: loadingMore ? 0.7 : 1 }}>
            {loadingMore ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  )
}

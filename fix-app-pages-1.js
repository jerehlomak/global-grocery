const fs = require('fs');

//  APP LAYOUT --
fs.writeFileSync('app/layout.tsx', `import type { Metadata } from 'next'
import './globals.css'
import Providers from '@/components/Providers'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/cart/CartDrawer'
import LiveChatPlaceholder from '@/components/shared/LiveChatPlaceholder'

export const metadata: Metadata = {
  title: 'GlobalGrocer  Enterprise Grocery eCommerce',
  description: 'A Salesforce-powered global grocery eCommerce platform. Shop fresh, regional pricing, enterprise features.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body style={{ background: '#f8f9fc', color: '#0f172a' }}>
        <Providers>
          <Navbar />
          <CartDrawer />
          <main style={{ minHeight: '80vh' }}>{children}</main>
          <Footer />
          <LiveChatPlaceholder />
        </Providers>
      </body>
    </html>
  )
}
`);
console.log('Fixed: layout.tsx');

//  LANDING PAGE (light) 
fs.writeFileSync('app/page.tsx', `'use client'
import { motion } from 'framer-motion'
import { ArrowRight, Globe, ShieldCheck, Zap, TrendingUp, Package, Users, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { fetchProducts } from '@/services/productService'
import type { Product } from '@/types/product'
import ProductCard from '@/components/products/ProductCard'
import { SkeletonCard } from '@/components/shared/SkeletonLoader'

const FAMILIES = [
  { name: 'Grains & Cereals', icon: '', color: '#d97706' },
  { name: 'Fruits & Vegetables', icon: '', color: '#059669' },
  { name: 'Dairy', icon: '', color: '#2563eb' },
  { name: 'Seafood', icon: '', color: '#0891b2' },
  { name: 'Beverages', icon: '', color: '#7c3aed' },
  { name: 'Bakery', icon: '', color: '#ea580c' },
  { name: 'Oils & Condiments', icon: '', color: '#65a30d' },
  { name: 'Spreads & Sweeteners', icon: '', color: '#ca8a04' },
]

const STATS = [
  { label: 'Products', value: '12,000+', icon: Package },
  { label: 'Countries', value: '50+', icon: Globe },
  { label: 'Customers', value: '25K+', icon: Users },
  { label: 'Revenue', value: '$4.2M', icon: TrendingUp },
]

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts('north-america').then(p => {
      setFeatured(p.slice(0, 4))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <div>
      {/*  HERO  */}
      <section style={{ position: 'relative', minHeight: '85vh', display: 'flex', alignItems: 'center', overflow: 'hidden', background: 'linear-gradient(135deg, #f8f9fc 0%, #f1f5f9 50%, #e2e8f0 100%)' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.3 }} />
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(79,70,229,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10, width: '100%' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} style={{ textAlign: 'center' }}>
            
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#ede9fe', border: '1px solid #ddd6fe', borderRadius: 20, padding: '6px 16px', marginBottom: 32 }}>
              <Zap size={13} color="#4f46e5" />
              <span style={{ fontSize: 13, color: '#4f46e5', fontWeight: 600 }}>Powered by Salesforce</span>
            </motion.div>

            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: 24, color: '#0f172a' }}>
              The Future of{' '}
              <span style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Global Grocery
              </span>
              {' '}Commerce
            </h1>

            <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: '#475569', maxWidth: 640, margin: '0 auto 40px', lineHeight: 1.7 }}>
              Enterprise-grade grocery eCommerce with real-time regional pricing, 
              Salesforce-driven sales flows, and a seamless B2B/B2C experience.
            </p>

            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#4f46e5', color: 'white', borderRadius: 12, padding: '14px 28px', textDecoration: 'none', fontWeight: 600, fontSize: 16, boxShadow: '0 4px 20px rgba(79,70,229,0.25)' }}>
                Explore Products <ArrowRight size={16} />
              </Link>
              <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 28px', textDecoration: 'none', fontWeight: 600, fontSize: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                Create Account
              </Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, maxWidth: 800, margin: '64px auto 0' }}>
            {STATS.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.1 }}
                style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid #e2e8f0', borderRadius: 12, padding: '20px 16px', textAlign: 'center', backdropFilter: 'blur(10px)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <stat.icon size={20} color="#4f46e5" style={{ margin: '0 auto 10px' }} />
                <div style={{ color: '#0f172a', fontWeight: 700, fontSize: 22, fontFamily: 'Outfit, sans-serif' }}>{stat.value}</div>
                <div style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/*  CATEGORIES  */}
      <section style={{ maxWidth: 1280, margin: '80px auto', padding: '0 24px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 32, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Shop by Category</h2>
          <p style={{ color: '#64748b', marginBottom: 40 }}>Sourced globally, priced for your region</p>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16 }}>
          {FAMILIES.map((fam, i) => (
            <motion.div key={fam.name} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} whileHover={{ scale: 1.05 }}>
              <Link href={'/products?family=' + encodeURIComponent(fam.name)} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '24px 16px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = fam.color; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)' }}
                >
                  <div style={{ fontSize: 32, marginBottom: 10 }}>{fam.icon}</div>
                  <p style={{ color: '#1e293b', fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{fam.name}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/*  FEATURED PRODUCTS  */}
      <section style={{ maxWidth: 1280, margin: '80px auto', padding: '0 24px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
            <div>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 32, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Featured Products</h2>
              <p style={{ color: '#64748b' }}>Live data from Salesforce  North America pricing</p>
            </div>
            <Link href="/products" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4f46e5', textDecoration: 'none', fontWeight: 600, fontSize: 15 }}>
              View all <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
          {loading ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />) : featured.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>

      {/*  SF CLOUD FEATURES  */}
      <section style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 36, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>
              Built on Salesforce
            </h2>
            <p style={{ color: '#64748b', maxWidth: 500, margin: '0 auto', fontSize: 16 }}>Every interaction powers the world\\'s #1 CRM platform</p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
            {[
              { icon: TrendingUp, title: 'Sales Cloud', desc: 'Lead-to-Order lifecycle, Sales Path, Quotes, Opportunities & Contracts.', color: '#4f46e5', bg: '#ede9fe' },
              { icon: ShieldCheck, title: 'Service Cloud', desc: 'Web-to-Case, Email-to-Case, and Embedded Service Chat for enterprise support.', color: '#059669', bg: '#d1fae5' },
              { icon: Globe, title: 'Regional Pricing', desc: 'Dynamic PriceBook2 per region. Africa, Europe & North America pricing.', color: '#d97706', bg: '#fef3c7' },
              { icon: BarChart3, title: 'Campaign Analytics', desc: 'Lead source tracking, campaign ROI dashboards, and conversion funnels.', color: '#7c3aed', bg: '#f3e8ff' },
            ].map((feat, i) => (
              <motion.div key={feat.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                style={{ background: '#f8f9fc', border: '1px solid #e2e8f0', borderRadius: 16, padding: 32, transition: 'transform 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ width: 48, height: 48, background: feat.bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <feat.icon size={24} color={feat.color} />
                </div>
                <h3 style={{ color: '#0f172a', fontWeight: 700, fontSize: 18, marginBottom: 10 }}>{feat.title}</h3>
                <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.6 }}>{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
`);
console.log('Fixed: page.tsx (Home)');

//  PRODUCTS PAGE (light) 
fs.writeFileSync('app/products/page.tsx', `'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { fetchProducts } from '@/services/productService'
import { useRegionStore } from '@/lib/store/regionStore'
import type { Product } from '@/types/product'
import ProductCard from '@/components/products/ProductCard'
import RegionPricingToggle from '@/components/products/RegionPricingToggle'
import { SkeletonCard } from '@/components/shared/SkeletonLoader'
import LastSynced from '@/components/shared/LastSynced'

const FAMILIES = ['All', 'Grains & Cereals', 'Fruits & Vegetables', 'Dairy', 'Seafood', 'Beverages', 'Bakery', 'Oils & Condiments', 'Spreads & Sweeteners']

export default function ProductsPage() {
  const { region } = useRegionStore()
  const [products, setProducts] = useState<Product[]>([])
  const [filtered, setFiltered] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [family, setFamily] = useState('All')
  const [lastSynced, setLastSynced] = useState<string>()

  const load = async () => {
    setLoading(true)
    try {
      const data = await fetchProducts(region, family === 'All' ? undefined : family, search || undefined)
      setProducts(data)
      setFiltered(data)
      setLastSynced(new Date().toISOString())
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [region, family])
  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(products.filter(p => p.name.toLowerCase().includes(q) || p.family.toLowerCase().includes(q)))
  }, [search, products])

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: 40 }}>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ fontFamily: 'Outfit, sans-serif', fontSize: 36, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
          Our Products
        </motion.h1>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <p style={{ color: '#64748b', fontSize: 16 }}>{filtered.length} products  Current pricing region is selected below</p>
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
        {FAMILIES.map(f => (
          <button key={f} onClick={() => setFamily(f)}
            style={{ background: family === f ? '#4f46e5' : '#fff', border: '1px solid ' + (family === f ? '#4f46e5' : '#cbd5e1'), borderRadius: 24, padding: '8px 20px', color: family === f ? 'white' : '#475569', cursor: 'pointer', fontSize: 14, whiteSpace: 'nowrap', fontWeight: family === f ? 600 : 500, transition: 'all 0.2s', boxShadow: family === f ? '0 4px 12px rgba(79,70,229,0.2)' : '0 1px 2px rgba(0,0,0,0.03)' }}>
            {f}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
        {loading ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : filtered.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px 0', color: '#64748b' }}>
              <p style={{ fontSize: 18, fontWeight: 500, marginBottom: 8, color: '#475569' }}>No products found</p>
              <p style={{ fontSize: 15 }}>Try adjusting your search query or category filter</p>
            </div>
          ) : filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)
        }
      </div>
    </div>
  )
}
`);
console.log('Fixed: products/page.tsx');

console.log('\\nApp and Products converted to light mode!');

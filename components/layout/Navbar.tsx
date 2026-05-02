'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/lib/store/cartStore'
import { useAuthStore } from '@/lib/store/authStore'
import { useRegionStore } from '@/lib/store/regionStore'
import { REGIONS } from '@/types/product'
import { ShoppingCart, User, Leaf, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
  const { items, openCart } = useCartStore()
  const { user, logout } = useAuthStore()
  const { region, setRegion } = useRegionStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const itemCount = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <nav style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-btn"
            style={{ display: 'none', background: 'transparent', border: 'none', color: '#0f172a', cursor: 'pointer' }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img src="/logo.svg" alt="Global Grocery Logo" style={{ height: 80, width: 'auto' }} />
          </Link>
        </div>

        {/* Desktop Links */}
        <div className="desktop-nav" style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          <Link href="/products" style={{ color: '#475569', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Products</Link>
          <Link href="/help" style={{ color: '#475569', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Help</Link>
          {user && <Link href="/dashboard" style={{ color: '#475569', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Dashboard</Link>}
          {/* {user && <Link href="/admin" style={{ color: '#475569', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Admin</Link>} */}
        </div>

        {/* Desktop Actions */}
        <div className="desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <select
            value={region}
            onChange={e => setRegion(e.target.value as typeof region)}
            style={{ background: '#f8f9fc', border: '1px solid #e2e8f0', borderRadius: 8, color: '#475569', padding: '6px 10px', fontSize: 12, cursor: 'pointer', outline: 'none' }}
          >
            {REGIONS.map(r => (
              <option key={r.id} value={r.id}>{r.flag} {r.label}</option>
            ))}
          </select>

          <button onClick={openCart} style={{ position: 'relative', background: '#f8f9fc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#0f172a' }}>
            <ShoppingCart size={16} />
            {itemCount > 0 && (
              <span style={{ position: 'absolute', top: -8, right: -8, background: '#4f46e5', color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {itemCount}
              </span>
            )}
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Link href="/dashboard" style={{ background: '#f1f4f9', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6, color: '#0f172a', textDecoration: 'none', fontSize: 13 }}>
                <User size={14} />{user.firstName}
              </Link>
              <button onClick={logout} style={{ background: 'transparent', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', color: '#475569', cursor: 'pointer', fontSize: 13 }}>
                Sign out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link href="/login" style={{ background: 'transparent', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 16px', color: '#475569', textDecoration: 'none', fontSize: 13 }}>
                Sign in
              </Link>
              <Link href="/register" style={{ background: '#4f46e5', borderRadius: 8, padding: '8px 16px', color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                Get started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Cart Button (shown only on mobile) */}
        <div className="mobile-cart-btn" style={{ display: 'none' }}>
          <button onClick={openCart} style={{ position: 'relative', background: '#f8f9fc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#0f172a' }}>
            <ShoppingCart size={16} />
            {itemCount > 0 && (
              <span style={{ position: 'absolute', top: -8, right: -8, background: '#4f46e5', color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="mobile-menu"
            style={{ position: 'absolute', top: 64, left: 0, right: 0, display: 'flex', flexDirection: 'column', background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 24px', gap: 16, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Link onClick={() => setMobileMenuOpen(false)} href="/products" style={{ color: '#0f172a', textDecoration: 'none', fontSize: 15, fontWeight: 500 }}>Products</Link>
              <Link onClick={() => setMobileMenuOpen(false)} href="/help" style={{ color: '#0f172a', textDecoration: 'none', fontSize: 15, fontWeight: 500 }}>Help</Link>
              {user && <Link onClick={() => setMobileMenuOpen(false)} href="/dashboard" style={{ color: '#0f172a', textDecoration: 'none', fontSize: 15, fontWeight: 500 }}>Dashboard</Link>}
              {user && <Link onClick={() => setMobileMenuOpen(false)} href="/admin" style={{ color: '#0f172a', textDecoration: 'none', fontSize: 15, fontWeight: 500 }}>Admin Analytics</Link>}
            </div>

            <div style={{ height: 1, background: '#e2e8f0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <select
                value={region}
                onChange={e => setRegion(e.target.value as typeof region)}
                style={{ background: '#f8f9fc', border: '1px solid #e2e8f0', borderRadius: 8, color: '#0f172a', padding: '10px 12px', fontSize: 14, cursor: 'pointer', outline: 'none' }}
              >
                {REGIONS.map(r => (
                  <option key={r.id} value={r.id}>{r.flag} {r.label}</option>
                ))}
              </select>
            </div>

            {user ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ color: '#64748b', fontSize: 14 }}>Signed in as <b style={{ color: '#0f172a' }}>{user.firstName}</b></div>
                <button onClick={() => { logout(); setMobileMenuOpen(false) }} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px', color: '#dc2626', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                  Sign out
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Link onClick={() => setMobileMenuOpen(false)} href="/login" style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px', color: '#0f172a', textDecoration: 'none', fontSize: 14, fontWeight: 600, textAlign: 'center' }}>
                  Sign in
                </Link>
                <Link onClick={() => setMobileMenuOpen(false)} href="/register" style={{ background: '#4f46e5', borderRadius: 8, padding: '10px', color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 600, textAlign: 'center' }}>
                  Get started
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

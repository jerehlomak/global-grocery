const fs = require('fs');

//  NAVBAR --
fs.writeFileSync('components/layout/Navbar.tsx', `'use client'
import Link from 'next/link'
import { useCartStore } from '@/lib/store/cartStore'
import { useAuthStore } from '@/lib/store/authStore'
import { useRegionStore } from '@/lib/store/regionStore'
import { REGIONS } from '@/types/product'
import { ShoppingCart, User, Leaf } from 'lucide-react'

export default function Navbar() {
  const { items, openCart } = useCartStore()
  const { user, logout } = useAuthStore()
  const { region, setRegion } = useRegionStore()
  const itemCount = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <nav style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Leaf size={16} color="white" />
          </div>
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 18, color: '#0f172a' }}>GlobalGrocer</span>
        </Link>

        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          <Link href="/products" style={{ color: '#475569', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Products</Link>
          <Link href="/help" style={{ color: '#475569', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Help</Link>
          {user && <Link href="/dashboard" style={{ color: '#475569', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Dashboard</Link>}
          {user && <Link href="/admin" style={{ color: '#475569', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Admin</Link>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
      </div>
    </nav>
  )
}
`);
console.log('Fixed: Navbar.tsx');

//  FOOTER 
fs.writeFileSync('components/layout/Footer.tsx', `import Link from 'next/link'
import { Leaf } from 'lucide-react'

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid #e2e8f0', background: '#f8f9fc', padding: '48px 24px 24px', marginTop: 80 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 48, marginBottom: 48 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Leaf size={14} color="white" />
              </div>
              <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, color: '#0f172a' }}>GlobalGrocer</span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6 }}>Enterprise grocery eCommerce platform powered by Salesforce Sales & Service Cloud.</p>
          </div>
          <div>
            <h4 style={{ color: '#0f172a', fontWeight: 600, marginBottom: 16, fontSize: 14 }}>Shop</h4>
            {['Products', 'Categories', 'Deals', 'Bulk Orders'].map(l => (
              <Link key={l} href="/products" style={{ display: 'block', color: '#94a3b8', fontSize: 13, marginBottom: 10, textDecoration: 'none' }}>{l}</Link>
            ))}
          </div>
          <div>
            <h4 style={{ color: '#0f172a', fontWeight: 600, marginBottom: 16, fontSize: 14 }}>Company</h4>
            {['About', 'Careers', 'Press', 'Partners'].map(l => (
              <span key={l} style={{ display: 'block', color: '#94a3b8', fontSize: 13, marginBottom: 10 }}>{l}</span>
            ))}
          </div>
          <div>
            <h4 style={{ color: '#0f172a', fontWeight: 600, marginBottom: 16, fontSize: 14 }}>Support</h4>
            {['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service'].map(l => (
              <Link key={l} href="/help" style={{ display: 'block', color: '#94a3b8', fontSize: 13, marginBottom: 10, textDecoration: 'none' }}>{l}</Link>
            ))}
          </div>
        </div>
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ color: '#94a3b8', fontSize: 12 }}> 2026 GlobalGrocer. All rights reserved. Powered by Salesforce.</p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#059669', display: 'inline-block' }}></span>
            <span style={{ color: '#94a3b8', fontSize: 12 }}>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
`);
console.log('Fixed: Footer.tsx');

//  LAST SYNCED 
fs.writeFileSync('components/shared/LastSynced.tsx', `'use client'
import { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'

interface LastSyncedProps {
  timestamp?: string
  source?: 'salesforce' | 'mock'
  onRefresh?: () => void
}

export default function LastSynced({ timestamp, source = 'mock', onRefresh }: LastSyncedProps) {
  const [timeAgo, setTimeAgo] = useState('')

  useEffect(() => {
    if (!timestamp) return
    const update = () => {
      const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000)
      if (diff < 60) setTimeAgo('Just now')
      else if (diff < 3600) setTimeAgo(\`\${Math.floor(diff / 60)}m ago\`)
      else setTimeAgo(\`\${Math.floor(diff / 3600)}h ago\`)
    }
    update()
    const id = setInterval(update, 30000)
    return () => clearInterval(id)
  }, [timestamp])

  const dotColor = source === 'salesforce' ? '#059669' : '#d97706'
  const labelColor = source === 'salesforce' ? '#059669' : '#d97706'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#94a3b8' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor, display: 'inline-block' }} />
        <span style={{ color: labelColor, fontSize: 11, fontWeight: 600 }}>
          {source === 'salesforce' ? 'Live Salesforce' : 'Mock Data'}
        </span>
      </div>
      {timestamp && <span> Last synced: {timeAgo}</span>}
      {onRefresh && (
        <button onClick={onRefresh} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2, display: 'flex', alignItems: 'center' }}>
          <RefreshCw size={12} />
        </button>
      )}
    </div>
  )
}
`);
console.log('Fixed: LastSynced.tsx');

//  SKELETON 
fs.writeFileSync('components/shared/SkeletonLoader.tsx', `export function SkeletonCard() {
  return (
    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="skeleton" style={{ height: 200, borderRadius: 0 }} />
      <div style={{ padding: 16 }}>
        <div className="skeleton" style={{ height: 16, width: '70%', marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 12, width: '50%', marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 24, width: '40%' }} />
      </div>
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
      <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 8, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 6 }} />
        <div className="skeleton" style={{ height: 12, width: '40%' }} />
      </div>
      <div className="skeleton" style={{ height: 20, width: 60, borderRadius: 20 }} />
    </div>
  )
}
`);
console.log('Fixed: SkeletonLoader.tsx');

//  LIVE CHAT 
fs.writeFileSync('components/shared/LiveChatPlaceholder.tsx', `'use client'
import { MessageCircle, X } from 'lucide-react'
import { useState } from 'react'

export default function LiveChatPlaceholder() {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 100 }}>
      {open && (
        <div style={{ position: 'absolute', bottom: 64, right: 0, width: 320, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}>
          <div style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>GlobalGrocer Support</div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>Powered by Salesforce</div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={16} /></button>
          </div>
          <div style={{ padding: 24, textAlign: 'center' }}>
            <p style={{ color: '#475569', fontSize: 13, marginBottom: 16 }}>Connect Salesforce Embedded Service Chat for live support.</p>
            <a href="/help" style={{ background: '#4f46e5', color: 'white', borderRadius: 8, padding: '8px 20px', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>Browse Help Center</a>
          </div>
        </div>
      )}
      <button onClick={() => setOpen(!open)}
        style={{ width: 52, height: 52, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(79,70,229,0.35)' }}>
        {open ? <X size={20} color="white" /> : <MessageCircle size={20} color="white" />}
      </button>
    </div>
  )
}
`);
console.log('Fixed: LiveChatPlaceholder.tsx');

console.log('All shared components updated to light mode!');

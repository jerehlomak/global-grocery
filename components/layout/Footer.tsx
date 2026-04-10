import Link from 'next/link'
import { Leaf } from 'lucide-react'

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid #e2e8f0', background: '#f8f9fc', padding: '48px 24px 24px', marginTop: 80 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 48, marginBottom: 48 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Leaf size={14} color="white" />
              </div>
              <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, color: '#0f172a' }}>GlobalGrocery</span>
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
        <div className="mobile-col mobile-stack" style={{ borderTop: '1px solid #e2e8f0', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

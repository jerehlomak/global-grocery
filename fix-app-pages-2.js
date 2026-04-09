const fs = require('fs');

//  PRODUCT DETAILS PAGE (light) --
fs.writeFileSync('app/products/[id]/page.tsx', `'use client'
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
      const p = res.find(x => x.id === id)
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

  const fmt = (p: number, c: string) => new Intl.NumberFormat('en-US', { style: 'currency', currency: c }).format(p)

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
`);
console.log('Fixed: products/[id]/page.tsx');

//  HELP PAGE (light) 
fs.writeFileSync('app/help/page.tsx', `'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Book, MessageSquare, AlertCircle, FileText, Send, CheckCircle2 } from 'lucide-react'
import { fetchKnowledgeArticles } from '@/services/knowledgeService'
import { createCase } from '@/services/caseService'
import type { SFKnowledgeArticle } from '@/types/salesforce'
import { useAuthStore } from '@/lib/store/authStore'
import LastSynced from '@/components/shared/LastSynced'
import { SkeletonRow } from '@/components/shared/SkeletonLoader'

export default function HelpPage() {
  const { user } = useAuthStore()
  const [articles, setArticles] = useState<SFKnowledgeArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('All')
  const [lastSynced, setLastSynced] = useState<string>()

  const [caseForm, setCaseForm] = useState({ subject: '', description: '', priority: 'Medium' })
  const [caseLoading, setCaseLoading] = useState(false)
  const [caseSuccess, setCaseSuccess] = useState(false)
  const [caseError, setCaseError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const data = await fetchKnowledgeArticles(search || undefined, cat === 'All' ? undefined : cat)
      setArticles(data)
      setLastSynced(new Date().toISOString())
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [search, cat])

  const submitCase = async (e: React.FormEvent) => {
    e.preventDefault()
    setCaseLoading(true)
    setCaseError('')
    try {
      await createCase({ ...caseForm, contactId: user?.sfContactId, accountId: user?.sfAccountId, origin: 'Web' })
      setCaseSuccess(true)
      setCaseForm({ subject: '', description: '', priority: 'Medium' })
    } catch (err: any) { setCaseError(err.message) }
    finally { setCaseLoading(false) }
  }

  return (
    <div style={{ maxWidth: 1200, margin: '40px auto 100px', padding: '0 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#e0f2fe', borderRadius: 20, padding: '6px 16px', marginBottom: 24, border: '1px solid #bae6fd' }}>
           <MessageSquare size={14} color="#0284c7" />
           <span style={{ fontSize: 13, color: '#0284c7', fontWeight: 600 }}>Service Cloud Integrated</span>
        </motion.div>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 44, fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>How can we help?</h1>
        <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search knowledge base..."
            style={{ width: '100%', background: '#fff', border: '1px solid #cbd5e1', borderRadius: 30, padding: '20px 24px 20px 60px', color: '#0f172a', fontSize: 18, outline: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(320px, 1fr)', gap: 40, alignItems: 'start' }}>
        {/* Knowledge Articles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Book size={24} color="#4f46e5" /> Knowledge Base
            </h2>
            <LastSynced timestamp={lastSynced} onRefresh={load} />
          </div>

          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
            {['All', 'Ordering', 'Pricing', 'Shipping', 'Support', 'B2B', 'Payments'].map(c => (
              <button key={c} onClick={() => setCat(c)}
                style={{ background: cat === c ? '#4f46e5' : '#fff', border: '1px solid ' + (cat === c ? '#4f46e5' : '#cbd5e1'), borderRadius: 20, padding: '6px 16px', color: cat === c ? 'white' : '#475569', cursor: 'pointer', fontSize: 13, fontWeight: cat === c ? 600 : 500, whiteSpace: 'nowrap' }}>
                {c}
              </button>
            ))}
          </div>

          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            {loading ? Array.from({ length: 5 }).map((_, i) => <div key={i} style={{ padding: '0 24px' }}><SkeletonRow /></div>) :
             articles.length === 0 ? <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>No articles found.</div> :
             articles.map((art, i) => (
               <motion.a key={art.Id} href={'#'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                 style={{ display: 'flex', gap: 16, padding: 24, borderBottom: i < articles.length - 1 ? '1px solid #f1f5f9' : 'none', textDecoration: 'none', background: 'transparent', transition: 'background 0.2s' }}
                 onMouseEnter={e => e.currentTarget.style.background = '#f8f9fc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                 <div style={{ background: '#ede9fe', width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                   <FileText size={18} color="#4f46e5" />
                 </div>
                 <div>
                   <h3 style={{ color: '#0f172a', fontWeight: 600, fontSize: 16, marginBottom: 8 }}>{art.Title}</h3>
                   <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.5, marginBottom: 12 }}>{art.Summary}</p>
                   <div style={{ display: 'flex', gap: 8 }}>
                     {art.Categories?.map(c => <span key={c} style={{ fontSize: 11, background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: 4 }}>{c}</span>)}
                   </div>
                 </div>
               </motion.a>
             ))}
          </div>
        </div>

        {/* Web-to-Case Form */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 32, position: 'sticky', top: 100, boxShadow: '0 10px 40px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>Contact Support</h2>
            <p style={{ color: '#64748b', fontSize: 13 }}>Submit a case securely to Salesforce Service Cloud.</p>
          </div>

          {caseSuccess ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 12, padding: 24, textAlign: 'center' }}>
              <CheckCircle2 size={40} color="#059669" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ color: '#065f46', fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Case Submitted</h3>
              <p style={{ color: '#047857', fontSize: 14 }}>Your case has been logged sequentially in Salesforce. Support will contact you shortly.</p>
              <button onClick={() => setCaseSuccess(false)} style={{ marginTop: 24, background: 'transparent', border: '1px solid #6ee7b7', color: '#059669', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}>Submit Another</button>
            </motion.div>
          ) : (
            <form onSubmit={submitCase} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {caseError && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: 12, borderRadius: 8, fontSize: 13, display: 'flex', gap: 8, alignItems: 'center' }}><AlertCircle size={16} />{caseError}</div>}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Subject</label>
                <input required value={caseForm.subject} onChange={e => setCaseForm({...caseForm, subject: e.target.value})}
                  style={{ width: '100%', background: '#f8f9fc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 12px', color: '#0f172a', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Priority</label>
                <select value={caseForm.priority} onChange={e => setCaseForm({...caseForm, priority: e.target.value})}
                  style={{ width: '100%', background: '#f8f9fc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 12px', color: '#0f172a', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}>
                  <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Description</label>
                <textarea required rows={4} value={caseForm.description} onChange={e => setCaseForm({...caseForm, description: e.target.value})}
                  style={{ width: '100%', background: '#f8f9fc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 12px', color: '#0f172a', fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
              <button disabled={caseLoading} style={{ background: '#0f172a', color: 'white', border: 'none', borderRadius: 8, padding: 14, fontSize: 15, fontWeight: 600, cursor: caseLoading ? 'wait' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 8, opacity: caseLoading ? 0.7 : 1 }}>
                {caseLoading ? <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <><Send size={16} /> Submit Case</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
`);
console.log('Fixed: help/page.tsx');

console.log('\\nApp inner pages converted to light mode!');

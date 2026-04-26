'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { useCartStore } from '@/lib/store/cartStore'
import { useAuthStore } from '@/lib/store/authStore'
import { useRegionStore } from '@/lib/store/regionStore'
import { createOpportunity, updateOpportunity } from '@/services/opportunityService'
import { createQuote } from '@/services/quoteService'
import { getMockPriceBookByRegion } from '@/lib/salesforce/mock-data'

export default function CheckoutPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { region } = useRegionStore()
  const { items, getSummary, clearCart } = useCartStore()
  const summary = getSummary()
  
  const [step, setStep] = useState(1)
  const [oppId, setOppId] = useState<string>()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) router.push('/login?next=/checkout')
    if (items.length === 0 && step === 1) router.push('/products')
  }, [user, items, step, router])

  const fmt = (p: number) => new Intl.NumberFormat(summary.currency === 'NGN' ? 'en-NG' : 'en-US', { style: 'currency', currency: summary.currency }).format(p)

  const requestQuote = async () => {
    setLoading(true)
    try {
      const pb = getMockPriceBookByRegion(region)
      const now = new Date()
      const dateStr = now.toISOString().split('T')[0]
      const timeStr = now.toTimeString().split(' ')[0].slice(0, 5)
      const customerName = user?.company || `${user?.firstName} ${user?.lastName}`
      const oppName = `${customerName} - Order - ${dateStr} ${timeStr}`
      
      const res = await createOpportunity({
        name: oppName,
        accountId: user?.accountId,
        contactId: user?.contactId,
        stageName: 'Proposal/Price Quote',
        closeDate: new Date().toISOString().split('T')[0],
        amount: summary.total,
        priceBook2Id: pb?.Id,
        leadSource: 'Web',
        lineItems: items,
        currencyIsoCode: summary.currency
      })
      
      if (res.Id) {
        await createQuote({
          opportunityId: res.Id,
          name: `${oppName} - Quote`,
          expirationDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          discount: 0,
          lineItems: items
        })
      }
      
      setOppId(res.Id)
      clearCart()
      setStep(3)
    } finally { setLoading(false) }
  }

  if (!user) return null

  if (step === 3) return (
    <div style={{ maxWidth: 600, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, padding: 48, boxShadow: '0 10px 40px rgba(0,0,0,0.06)' }}>
        <CheckCircle2 size={64} color="#059669" style={{ margin: '0 auto 24px' }} />
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 32, fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>Quote Requested!</h1>
        <p style={{ color: '#475569', fontSize: 16, lineHeight: 1.6, marginBottom: 32 }}>
          Your quote has been successfully generated and an email has been sent. Please review and pay your quote securely in the Dashboard.
        </p>
        <button onClick={() => router.push('/dashboard')} style={{ background: '#4f46e5', color: 'white', border: 'none', borderRadius: 12, padding: '14px 32px', fontSize: 16, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(79,70,229,0.3)' }}>Go to Dashboard</button>
      </motion.div>
    </div>
  )

  return (
    <div style={{ maxWidth: 1000, margin: '40px auto 100px', padding: '0 24px' }}>
      <button onClick={() => step === 1 ? router.push('/products') : setStep(1)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: 32, fontSize: 14, fontWeight: 500 }}>
        <ArrowLeft size={16} /> {step === 1 ? 'Back to Products' : 'Back to Cart Review'}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 48, gap: 16 }}>
        <div style={{ padding: '8px 24px', borderRadius: 20, background: step === 1 ? '#4f46e5' : '#ede9fe', color: step === 1 ? 'white' : '#4f46e5', fontWeight: 600, fontSize: 14 }}>1. Review Order</div>
        <div style={{ height: 2, width: 40, background: step > 1 ? '#4f46e5' : '#e2e8f0' }} />
        <div style={{ padding: '8px 24px', borderRadius: 20, background: step === 3 ? '#4f46e5' : '#f1f5f9', color: step === 3 ? 'white' : '#64748b', fontWeight: 600, fontSize: 14 }}>2. Complete</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(320px, 1fr)', gap: 40, alignItems: 'start' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, padding: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
           {step === 1 && (
             <div>
               <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginBottom: 24 }}>Order Summary</h2>
               <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                 {items.map(i => (
                   <div key={i.productId} style={{ display: 'flex', gap: 16, paddingBottom: 16, borderBottom: '1px solid #f1f5f9' }}>
                     <img src={i.imageUrl || '/placeholder-product.png'} alt={i.name} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 12, border: '1px solid #e2e8f0' }} />
                     <div style={{ flex: 1 }}>
                       <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 15, marginBottom: 4 }}>{i.name}</div>
                       <div style={{ color: '#64748b', fontSize: 13, marginBottom: 8 }}>Qty: {i.quantity}</div>
                       <div style={{ fontWeight: 700, color: '#4f46e5' }}>{fmt(i.unitPrice * i.quantity)}</div>
                     </div>
                   </div>
                 ))}
               </div>
               <div style={{ marginTop: 24, paddingTop: 24 }}>
                 {[['Subtotal', summary.subtotal], ['Shipping', summary.shipping], ['Tax', summary.tax]].map(([l, v]) => (
                   <div key={l as string} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, color: '#475569', fontSize: 15 }}>
                     <span>{l}</span><span>{l === 'Shipping' && v === 0 ? 'Free' : fmt(v as number)}</span>
                   </div>
                 ))}
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTop: '1px solid #e2e8f0', fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
                   <span>Total</span><span style={{ color: '#4f46e5' }}>{fmt(summary.total)}</span>
                 </div>
               </div>
             </div>
           )}
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'sticky', top: 100 }}>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>Salesforce Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <CheckCircle2 color={step > 1 ? "#059669" : "#cbd5e1"} size={18} />
                <span style={{ fontSize: 13, color: step > 1 ? '#0f172a' : '#64748b' }}>Create Opportunity</span>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <CheckCircle2 color={step > 1 ? "#059669" : "#cbd5e1"} size={18} />
                <span style={{ fontSize: 13, color: step > 1 ? '#0f172a' : '#64748b' }}>Generate Quote & Email</span>
              </div>
            </div>
            
            <button onClick={requestQuote} disabled={loading}
              style={{ width: '100%', marginTop: 24, background: '#10b981', color: 'white', border: 'none', borderRadius: 12, padding: 16, fontSize: 16, fontWeight: 600, cursor: loading ? 'wait' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(16,185,129,0.3)', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#059669'} onMouseLeave={e => e.currentTarget.style.background = '#10b981'}>
              {loading ? 'Processing...' : 'Request Quote'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

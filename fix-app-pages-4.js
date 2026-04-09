const fs = require('fs');

// -- CHECKOUT PAGE (light) --
fs.writeFileSync('app/checkout/page.tsx', `'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { useCartStore } from '@/lib/store/cartStore'
import { useAuthStore } from '@/lib/store/authStore'
import { useRegionStore } from '@/lib/store/regionStore'
import { createOpportunity, updateOpportunity } from '@/services/opportunityService'
import { createOrder } from '@/services/orderService'
import { createContract } from '@/services/contractService'
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

  const fmt = (p: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: summary.currency }).format(p)

  const proceedToPayment = async () => {
    setLoading(true)
    try {
      const pb = getMockPriceBookByRegion(region)
      const res = await createOpportunity({
        name: \`Cart Order - \${new Date().toISOString().split('T')[0]}\`,
        accountId: user?.sfAccountId,
        contactId: user?.sfContactId,
        stageName: 'Negotiation/Review',
        closeDate: new Date().toISOString().split('T')[0],
        amount: summary.total,
        priceBook2Id: pb?.Id,
        leadSource: 'Web',
        lineItems: items
      })
      setOppId(res.Id)
      setStep(2)
    } finally { setLoading(false) }
  }

  const handlePayment = async () => {
    setLoading(true)
    try {
      if (oppId) await updateOpportunity(oppId, { StageName: 'Closed Won' })
      else throw new Error("Opportunity ID missing")

      if (user?.sfAccountId) {
        await createOrder({
          accountId: user.sfAccountId,
          opportunityId: oppId,
          effectiveDate: new Date().toISOString().split('T')[0],
          status: 'Activated'
        })
        if (summary.total > 5000) {
          await createContract({
            accountId: user.sfAccountId,
            startDate: new Date().toISOString().split('T')[0],
            contractTerm: 12,
            description: "Auto-generated contract from web bulk order > $5K"
          })
        }
      }
      clearCart()
      setStep(3)
    } finally { setLoading(false) }
  }

  if (!user) return null

  if (step === 3) return (
    <div style={{ maxWidth: 600, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, padding: 48, boxShadow: '0 10px 40px rgba(0,0,0,0.06)' }}>
        <CheckCircle2 size={64} color="#059669" style={{ margin: '0 auto 24px' }} />
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 32, fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>Order Confirmed!</h1>
        <p style={{ color: '#475569', fontSize: 16, lineHeight: 1.6, marginBottom: 32 }}>
          Your order has been successfully placed. The Salesforce Opportunity is now <b>Closed Won</b>.
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
        <div style={{ padding: '8px 24px', borderRadius: 20, background: step === 2 ? '#4f46e5' : '#f1f5f9', color: step === 2 ? 'white' : '#64748b', fontWeight: 600, fontSize: 14 }}>2. Payment</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(320px, 1fr)', gap: 40, alignItems: 'start' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, padding: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          {step === 1 ? (
             <div>
               <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginBottom: 24 }}>Order Summary</h2>
               <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                 {items.map(i => (
                   <div key={i.productId} style={{ display: 'flex', gap: 16, paddingBottom: 16, borderBottom: '1px solid #f1f5f9' }}>
                     <img src={i.imageUrl} alt={i.name} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 12, border: '1px solid #e2e8f0' }} />
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
          ) : (
             <div>
               <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Payment Details</h2>
               <p style={{ color: '#64748b', marginBottom: 32 }}>Salesforce Opportunity created successfully. Please enter payment info to close the sale.</p>
               <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                 <div>
                   <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Card Number</label>
                   <input disabled value="   4242" style={{ width: '100%', background: '#f8f9fc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 16px', color: '#0f172a', fontSize: 15 }} />
                 </div>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                   <div>
                     <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Expiry</label>
                     <input disabled value="12/26" style={{ width: '100%', background: '#f8f9fc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 16px', color: '#0f172a', fontSize: 15 }} />
                   </div>
                   <div>
                     <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>CVC</label>
                     <input disabled value="" style={{ width: '100%', background: '#f8f9fc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 16px', color: '#0f172a', fontSize: 15 }} />
                   </div>
                 </div>
                 <div style={{ background: '#ecfdf5', color: '#065f46', padding: 12, borderRadius: 8, fontSize: 13, display: 'flex', gap: 8, alignItems: 'center', marginTop: 16 }}>
                   <ShieldCheck size={16} /> <span>This is a mock payment for demonstration.</span>
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
                <CheckCircle2 color={step === 3 ? "#059669" : "#cbd5e1"} size={18} />
                <span style={{ fontSize: 13, color: step === 3 ? '#0f172a' : '#64748b' }}>Close Won Opportunity</span>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <CheckCircle2 color={step === 3 ? "#059669" : "#cbd5e1"} size={18} />
                <span style={{ fontSize: 13, color: step === 3 ? '#0f172a' : '#64748b' }}>Generate Order / Contract</span>
              </div>
            </div>
            
            <button onClick={step === 1 ? proceedToPayment : handlePayment} disabled={loading}
              style={{ width: '100%', marginTop: 24, background: '#10b981', color: 'white', border: 'none', borderRadius: 12, padding: 16, fontSize: 16, fontWeight: 600, cursor: loading ? 'wait' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(16,185,129,0.3)', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#059669'} onMouseLeave={e => e.currentTarget.style.background = '#10b981'}>
              {loading ? 'Processing...' : step === 1 ? 'Continue to Payment' : \`Pay \${fmt(summary.total)}\`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
`);
console.log('Fixed: checkout/page.tsx');

//  ADMIN ANALYTICS PAGE (light) 
fs.writeFileSync('app/admin/page.tsx', `'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, BarChart3, Users, DollarSign, Target } from 'lucide-react'
import { fetchCampaigns } from '@/services/campaignService'
import { fetchOpportunities } from '@/services/opportunityService'
import { fetchStages } from '@/services/opportunityService'
import type { SFCampaign, SFOpportunity, SFOpportunityStage } from '@/types/salesforce'
import LastSynced from '@/components/shared/LastSynced'
import { SkeletonRow } from '@/components/shared/SkeletonLoader'

export default function AdminDashboardPage() {
  const [campaigns, setCampaigns] = useState<SFCampaign[]>([])
  const [opps, setOpps] = useState<SFOpportunity[]>([])
  const [stages, setStages] = useState<SFOpportunityStage[]>([])
  const [loading, setLoading] = useState(true)
  const [lastSynced, setLastSynced] = useState<string>()

  const load = async () => {
    setLoading(true)
    try {
      const [c, o, s] = await Promise.all([fetchCampaigns(), fetchOpportunities(), fetchStages()])
      setCampaigns(c)
      setOpps(o)
      setStages(s)
      setLastSynced(new Date().toISOString())
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const fmt = (p: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(p)
  const totalRev = opps.filter(o => o.StageName === 'Closed Won').reduce((a, b) => a + (b.Amount||0), 0)
  const pipeRev = opps.filter(o => o.StageName !== 'Closed Won' && o.StageName !== 'Closed Lost').reduce((a, b) => a + (b.Amount||0), 0)

  return (
    <div style={{ maxWidth: 1280, margin: '40px auto 100px', padding: '0 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 32, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Admin Analytics</h1>
          <p style={{ color: '#64748b' }}>Live pipeline and campaign performance.</p>
        </div>
        <LastSynced timestamp={lastSynced} source="salesforce" onRefresh={load} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40 }}>
        {[
          { icon: DollarSign, label: 'Closed Won Revenue', value: loading ? '-' : fmt(totalRev), color: '#059669', bg: '#d1fae5' },
          { icon: TrendingUp, label: 'Pipeline Val.', value: loading ? '-' : fmt(pipeRev), color: '#4f46e5', bg: '#ede9fe' },
          { icon: Target, label: 'Active Campaigns', value: loading ? '-' : campaigns.filter(c => c.IsActive).length, color: '#d97706', bg: '#fef3c7' },
          { icon: Users, label: 'Total Opportunities', value: loading ? '-' : opps.length, color: '#0284c7', bg: '#e0f2fe' },
        ].map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '24px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 44, height: 44, background: k.bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <k.icon size={20} color={k.color} />
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: 13, fontWeight: 500 }}>{k.label}</div>
                <div style={{ color: '#0f172a', fontSize: 24, fontWeight: 800 }}>{k.value}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}><BarChart3 size={20} color="#4f46e5" /> Campaign Performance</h2>
          {loading ? <SkeletonRow /> : campaigns.length === 0 ? <p style={{ color: '#64748b' }}>No campaigns found.</p> :
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {campaigns.map(c => {
                const roi = ((c.ExpectedRevenue - c.ActualCost) / c.ActualCost) * 100
                return (
                  <div key={c.Id} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, background: '#f8f9fc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
                          {c.Name} {c.IsActive && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#059669' }} />}
                        </div>
                        <div style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>Type: {c.Type}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, color: '#4f46e5', fontSize: 15 }}>{fmt(c.ExpectedRevenue)}</div>
                        <div style={{ color: roi > 0 ? '#059669' : '#dc2626', fontSize: 12, fontWeight: 600 }}>{roi > 0 ? '+' : ''}{roi.toFixed(1)}% ROI</div>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
                       <div><div style={{ color: '#64748b', fontSize: 11 }}>Leads</div><div style={{ color: '#0f172a', fontWeight: 600, fontSize: 14 }}>{c.NumberOfLeads || 0}</div></div>
                       <div><div style={{ color: '#64748b', fontSize: 11 }}>Contacts</div><div style={{ color: '#0f172a', fontWeight: 600, fontSize: 14 }}>{c.NumberOfContacts || 0}</div></div>
                       <div><div style={{ color: '#64748b', fontSize: 11 }}>Converted</div><div style={{ color: '#059669', fontWeight: 600, fontSize: 14 }}>{c.NumberOfConvertedLeads || 0}</div></div>
                    </div>
                  </div>
                )
              })}
            </div>
          }
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}><TrendingUp size={20} color="#4f46e5" /> Sales Pipeline</h2>
          {loading ? <SkeletonRow /> : stages.length === 0 ? <p style={{ color: '#64748b' }}>No stages found.</p> :
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {stages.filter(s => s.IsActive).map(st => {
                const stageOpps = opps.filter(o => o.StageName === st.ApiName)
                const stageVal = stageOpps.reduce((a, b) => a + (b.Amount||0), 0)
                const maxVal = Math.max(...stages.map(x => opps.filter(o => o.StageName === x.ApiName).reduce((a, b) => a + (b.Amount||0), 0)))
                const pct = maxVal > 0 ? (stageVal / maxVal) * 100 : 0
                return (
                  <div key={st.ApiName}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                      <span style={{ color: '#475569', fontWeight: 500 }}>{st.Label} ({stageOpps.length})</span>
                      <span style={{ color: '#0f172a', fontWeight: 700 }}>{fmt(stageVal)}</span>
                    </div>
                    <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: \`\${pct}%\` }} transition={{ duration: 1 }}
                        style={{ height: '100%', background: st.IsClosed ? (st.IsWon ? '#059669' : '#dc2626') : '#4f46e5', borderRadius: 4 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          }
        </div>
      </div>
    </div>
  )
}
`);
console.log('Fixed: admin/page.tsx');

console.log('\\nCheckout and Admin Analytics converted to light mode!');

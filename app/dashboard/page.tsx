'use client'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store/authStore'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { DollarSign, FileText, Package, AlertCircle, X } from 'lucide-react'
import { fetchOpportunities, updateOpportunity } from '@/services/opportunityService'
import { fetchQuotes, updateQuote } from '@/services/quoteService'
import { fetchOrders, createOrder } from '@/services/orderService'
import { fetchContracts, createContract } from '@/services/contractService'
import { fetchCases } from '@/services/caseService'
import type { SFOpportunity, SFQuote, SFOrder, SFContract, SFCase } from '@/types/salesforce'
import SalesPath from '@/components/dashboard/SalesPath'
import { SkeletonRow } from '@/components/shared/SkeletonLoader'
import { fetchStages } from '@/services/opportunityService'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  // Ensure we avoid hooks running conditionally
  const [data, setData] = useState<any>({ opps: [], quotes: [], orders: [], contracts: [], cases: [], stages: [] })
  const [loading, setLoading] = useState(true)
  const [payingQuote, setPayingQuote] = useState<any>(null)
  const [payLoading, setPayLoading] = useState(false)

  const fetchData = async () => {
    if (!user) return
    console.log('[Dashboard] Fetching data for user:', { 
      email: user.email, 
      contactId: user.contactId, 
      accountId: user.accountId 
    })

    const results = await Promise.allSettled([
      fetchOpportunities({ contactId: user.contactId, accountId: user.accountId }),
      fetchQuotes(undefined, user.accountId),
      fetchOrders(user.accountId),
      fetchContracts(user.accountId),
      fetchCases(user.contactId || user.accountId),
      fetchStages()
    ])

    const [opps, quotes, orders, contracts, cases, stages] = results.map((r, i) => {
      if (r.status === 'fulfilled') return r.value
      console.error(`[Dashboard] API ${i} failed:`, r.reason)
      return i === 5 ? [] : [] // Default to empty array on failure
    })

    setData({ 
      opps: opps || [], 
      quotes: quotes || [], 
      orders: orders || [], 
      contracts: contracts || [], 
      cases: cases || [], 
      stages: stages || [] 
    })
    setLoading(false)
  }

  const reloadData = () => fetchData()

  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return
    if (!user) { router.push('/login'); return }
    fetchData()
  }, [user, router, mounted])

  if (!mounted || !user) return null

  const fmt = (p: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(p)

  const handlePayQuote = async () => {
    if (!payingQuote) return
    setPayLoading(true)
    try {
      await updateQuote(payingQuote.Id, { Status: 'Accepted' })
      if (payingQuote.OpportunityId) {
        await updateOpportunity(payingQuote.OpportunityId, { StageName: 'Closed Won' })
      }
      if (user.accountId) {
        await createOrder({
          accountId: user.accountId,
          opportunityId: payingQuote.OpportunityId,
          effectiveDate: new Date().toISOString().split('T')[0],
          status: 'Draft'
        })
      }
      
      // Notify staff
      const opp = data.opps.find((o: any) => o.Id === payingQuote.OpportunityId)
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: `Payment Received for Quote: ${payingQuote.Name} - Please Send Contract`,
          ownerId: opp?.OwnerId || user.accountId, // Mock fallback
          whatId: payingQuote.OpportunityId,
          description: `User ${user.firstName} ${user.lastName} has paid ${fmt(payingQuote.GrandTotal)} for quote ${payingQuote.Name}. Please generate and send the contract to the customer.`
        })
      })

      setPayingQuote(null)
      reloadData()
      alert('Payment successful! Order generated and staff notified to send the contract.')
    } catch (e: any) {
      alert('Failed to process payment: ' + e.message)
    } finally {
      setPayLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 1280, margin: '40px auto 100px', padding: '0 24px' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 32, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Customer Dashboard</h1>
        <p style={{ color: '#64748b' }}>Welcome back, {user.firstName}. Here is an overview of your Salesforce data.</p>
      </div>

      <style>{`
        .dashboard-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 40px;
        }
        .dashboard-main-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 24px;
        }
        @media (max-width: 1024px) {
          .dashboard-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .dashboard-main-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .dashboard-stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="dashboard-stats-grid">
        {[
          { icon: DollarSign, label: 'Active Opportunities', value: loading ? '-' : data.opps.length, color: '#4f46e5', bg: '#ede9fe' },
          { icon: FileText, label: 'Pending Quotes', value: loading ? '-' : data.quotes.length, color: '#d97706', bg: '#fef3c7' },
          { icon: Package, label: 'Active Orders', value: loading ? '-' : data.orders.length, color: '#059669', bg: '#d1fae5' },
          { icon: AlertCircle, label: 'Open Cases', value: loading ? '-' : data.cases.length, color: '#dc2626', bg: '#fee2e2' },
        ].map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '24px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
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

      <div className="dashboard-main-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Opportunities */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>Active Opportunities</h2>
            {loading ? <SkeletonRow /> : data.opps.length === 0 ? <p style={{ color: '#64748b' }}>No opportunities found.</p> :
              data.opps.map((opp: any) => (
                <div key={opp.Id} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, marginBottom: 16, background: '#f8f9fc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a' }}>{opp.Name}</h3>
                      <div style={{ fontSize: 13, color: '#64748b', display: 'flex', gap: 12, marginTop: 4 }}>
                        <span>Close: {opp.CloseDate}</span>
                        <span>Prob: {opp.Probability}%</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#4f46e5' }}>{fmt(opp.Amount)}</div>
                  </div>
                  <SalesPath stages={data.stages} currentStage={opp.StageName} />
                </div>
              ))}
          </div>
          
          {/* Contracts */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>Active Contracts</h2>
            {loading ? <SkeletonRow /> : data.contracts.length === 0 ? <p style={{ color: '#64748b' }}>No contracts found.</p> :
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
                  <thead style={{ background: '#f8f9fc', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>
                    <tr><th style={{ padding: '12px 16px', fontWeight: 600 }}>Start Date</th><th style={{ padding: '12px 16px', fontWeight: 600 }}>Term</th><th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th></tr>
                  </thead>
                  <tbody>
                    {data.contracts.map((c: any) => (
                      <tr key={c.Id} style={{ borderTop: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '12px 16px', color: '#0f172a' }}>{c.StartDate}</td>
                        <td style={{ padding: '12px 16px', color: '#475569' }}>{c.ContractTerm} months</td>
                        <td style={{ padding: '12px 16px' }}><span style={{ background: '#d1fae5', color: '#059669', padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>{c.Status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            }
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Quotes */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>Recent Quotes</h2>
            {loading ? <SkeletonRow /> : data.quotes.length === 0 ? <p style={{ color: '#64748b' }}>No quotes found.</p> :
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {data.quotes.map((q: any) => (
                  <div key={q.Id} style={{ display: 'flex', flexDirection: 'column', gap: 16, background: '#f8f9fc', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 14 }}>{q.Name}</div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{q.Opportunity?.Name}</div>
                      </div>
                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{fmt(q.GrandTotal)}</div>
                          <div style={{ fontSize: 12, color: q.Status === 'Approved' ? '#059669' : '#d97706', fontWeight: 600 }}>{q.Status}</div>
                        </div>
                        {q.Status === 'Draft' && (
                          <button onClick={() => setPayingQuote(payingQuote?.Id === q.Id ? null : q)} style={{ background: '#4f46e5', color: 'white', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                            {payingQuote?.Id === q.Id ? 'Cancel' : 'Review & Pay'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            }
          </div>

          {/* Cases */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>Support Cases</h2>
            {loading ? <SkeletonRow /> : data.cases.length === 0 ? <p style={{ color: '#64748b' }}>No cases found.</p> :
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {data.cases.map((c: any) => (
                  <div key={c.Id} style={{ background: '#f8f9fc', border: '1px solid #e2e8f0', borderLeft: '3px solid ' + (c.Status === 'New' ? '#dc2626' : '#f59e0b'), padding: 16, borderRadius: '0 12px 12px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>#{c.CaseNumber}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>{c.Status}</span>
                    </div>
                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 14 }}>{c.Subject}</div>
                  </div>
                ))}
              </div>
            }
          </div>
        </div>
      </div>

      {/* Quote Payment Modal */}
      <AnimatePresence>
        {payingQuote && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 800, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
              
              {/* Header */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#0f172a' }}>Review Quote: {payingQuote.Name}</h3>
                <button onClick={() => setPayingQuote(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
              </div>

              {/* PDF Viewer */}
              <div style={{ height: '60vh', minHeight: 400, background: '#f8fafc', position: 'relative' }}>
                <iframe src={`/api/quotes/${payingQuote.Id}/pdf#view=FitH`} style={{ display: 'block', width: '100%', height: '100%', border: 'none' }} title="Quote PDF" />
              </div>

              {/* Footer / Payment */}
              <div style={{ padding: '24px', borderTop: '1px solid #e2e8f0', background: '#fff' }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#0f172a' }}>Complete Payment</div>
                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  <input disabled value="**** **** **** 4242" style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569' }} />
                  <input disabled value="12/26" style={{ width: 80, padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', textAlign: 'center' }} />
                  <input disabled value="123" style={{ width: 60, padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', textAlign: 'center' }} />
                </div>
                <button onClick={handlePayQuote} disabled={payLoading} style={{ width: '100%', background: '#10b981', color: 'white', border: 'none', borderRadius: 8, padding: '12px', fontSize: 15, fontWeight: 600, cursor: payLoading ? 'wait' : 'pointer', transition: 'background 0.2s', display: 'flex', justifyContent: 'center', gap: 8 }}>
                  {payLoading ? 'Processing...' : `Confirm & Pay ${fmt(payingQuote.GrandTotal)}`}
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}

'use client'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store/authStore'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { DollarSign, FileText, Package, AlertCircle, FileCheck, X, TrendingUp } from 'lucide-react'
import { fetchOpportunities, updateOpportunity, fetchStages } from '@/services/opportunityService'
import { fetchQuotes, updateQuote } from '@/services/quoteService'
import { fetchOrders, createOrder } from '@/services/orderService'
import { fetchContracts } from '@/services/contractService'
import { fetchCases } from '@/services/caseService'
import SalesPath from '@/components/dashboard/SalesPath'
import { SkeletonRow } from '@/components/shared/SkeletonLoader'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'

type Section = 'overview' | 'opportunities' | 'quotes' | 'orders' | 'cases' | 'contracts'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [data, setData] = useState<any>({ opps: [], quotes: [], orders: [], contracts: [], cases: [], stages: [] })
  const [loading, setLoading] = useState(true)
  const [payingQuote, setPayingQuote] = useState<any>(null)
  const [payLoading, setPayLoading] = useState(false)
  const [activeSection, setActiveSection] = useState<Section>('overview')
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const fetchData = async () => {
    if (!user) return
    const results = await Promise.allSettled([
      fetchOpportunities({ contactId: user.contactId, accountId: user.accountId }),
      fetchQuotes(undefined, user.accountId),
      fetchOrders(user.accountId),
      fetchContracts(user.accountId),
      fetchCases(user.contactId || user.accountId),
      fetchStages()
    ])
    const [opps, quotes, orders, contracts, cases, stages] = results.map(r => r.status === 'fulfilled' ? r.value : [])
    setData({ opps: opps||[], quotes: quotes||[], orders: orders||[], contracts: contracts||[], cases: cases||[], stages: stages||[] })
    setLoading(false)
  }

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
      if (payingQuote.OpportunityId) await updateOpportunity(payingQuote.OpportunityId, { StageName: 'Closed Won' })
      if (user.accountId) {
        await createOrder({
          accountId: user.accountId,
          opportunityId: payingQuote.OpportunityId,
          quoteId: payingQuote.Id,
          effectiveDate: new Date().toISOString().split('T')[0],
          status: 'Draft'
        })
      }
      const opp = data.opps.find((o: any) => o.Id === payingQuote.OpportunityId)
      await fetch('/api/tasks', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: `Payment Received for Quote: ${payingQuote.Name} - Please Send Contract`,
          ownerId: opp?.OwnerId || user.accountId,
          whatId: payingQuote.OpportunityId,
          description: `User ${user.firstName} ${user.lastName} has paid ${fmt(payingQuote.GrandTotal)} for quote ${payingQuote.Name}. Please generate and send the contract.`
        })
      })
      setPayingQuote(null)
      fetchData()
      alert('Payment successful! Order generated and staff notified.')
    } catch (e: any) { alert('Failed to process payment: ' + e.message) }
    finally { setPayLoading(false) }
  }

  const SIDEBARW = 240

  const statCards = [
    { icon: DollarSign, label: 'Opportunities', value: data.opps.length,      color: '#4f46e5', bg: '#ede9fe', section: 'opportunities' as Section },
    { icon: FileText,   label: 'Quotes',        value: data.quotes.length,    color: '#d97706', bg: '#fef3c7', section: 'quotes' as Section },
    { icon: Package,    label: 'Orders',        value: data.orders.length,    color: '#059669', bg: '#d1fae5', section: 'orders' as Section },
    { icon: AlertCircle,label: 'Open Cases',   value: data.cases.length,     color: '#dc2626', bg: '#fee2e2', section: 'cases' as Section },
    { icon: FileCheck,  label: 'Contracts',    value: data.contracts.length, color: '#0891b2', bg: '#cffafe', section: 'contracts' as Section },
  ]

  const card = (children: React.ReactNode, id?: string) => (
    <div id={id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      {children}
    </div>
  )

  const sectionTitle = (title: string) => (
    <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>{title}</h2>
  )

  const empty = (msg: string) => <p style={{ color: '#64748b' }}>{msg}</p>

  const badge = (text: string, color: string, bg: string) => (
    <span style={{ background: bg, color, padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{text}</span>
  )

  return (
    <>
      <style>{`
        .db-layout { display: flex; min-height: 100vh; background: #f8fafc; font-family: 'Outfit', sans-serif; }
        .db-main { margin-left: ${SIDEBARW}px; flex: 1; padding: 32px; transition: margin-left 0.2s; }
        .db-stat-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; margin-bottom: 32px; }
        .db-stat-card {
          background: #fff; border: 1px solid #e2e8f0; border-radius: 16px;
          padding: 20px 16px; cursor: pointer; transition: box-shadow 0.15s, transform 0.15s, border-color 0.15s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .db-stat-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.1); transform: translateY(-2px); border-color: #c7d2fe; }
        .db-stat-card.active { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
        .db-content-grid { display: grid; grid-template-columns: 1.4fr 1fr; gap: 24px; }
        .db-overview-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; align-items: start; }
        .db-section { display: flex; flex-direction: column; gap: 24px; }
        @media (max-width: 1100px) { .db-stat-grid { grid-template-columns: repeat(3,1fr); } .db-content-grid, .db-overview-grid { grid-template-columns: 1fr; } }
        @media (max-width: 768px) { .db-main { margin-left: 72px; padding: 20px; } .db-stat-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 480px) { .db-stat-grid { grid-template-columns: 1fr; } }
        .quote-pay-btn { border: none; border-radius: 8px; padding: 7px 14px; font-size: 12px; font-weight: 600; cursor: pointer; transition: opacity 0.15s; }
        .quote-pay-btn:hover { opacity: 0.85; }
        tr:hover td { background: #f8f9fc; }
      `}</style>

      <div className="db-layout">
        <DashboardSidebar activeSection={activeSection} onSectionChange={(s) => setActiveSection(s as Section)} />

        <main className="db-main">
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
              {activeSection === 'overview' ? `Welcome back, ${user.firstName} 👋` : activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
            </h1>
            <p style={{ color: '#64748b', fontSize: 14 }}>
              {activeSection === 'overview' ? "Here's an overview of your account." : `Viewing all your ${activeSection}.`}
            </p>
          </div>

          {/* Stat Cards */}
          <div className="db-stat-grid">
            {statCards.map((k, i) => (
              <motion.div key={k.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className={`db-stat-card${activeSection === k.section ? ' active' : ''}`}
                onClick={() => setActiveSection(k.section)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, background: k.bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <k.icon size={18} color={k.color} />
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: 12, fontWeight: 500 }}>{k.label}</div>
                    <div style={{ color: '#0f172a', fontSize: 22, fontWeight: 800, lineHeight: 1.2 }}>{loading ? '—' : k.value}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Content Sections */}
          <div className={activeSection === 'overview' ? 'db-overview-grid' : ''}>
            {(activeSection === 'opportunities') && (
              <div style={{ marginBottom: 24 }}>
                {card(<>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    {sectionTitle('Active Opportunities')}
                    {activeSection === 'overview' && data.opps.length > 4 && (
                      <button onClick={() => setActiveSection('opportunities')} style={{ fontSize: 13, color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>View all →</button>
                    )}
                  </div>
                  {loading ? <SkeletonRow /> : data.opps.length === 0 ? empty('No opportunities found.') :
                    (activeSection === 'overview' ? data.opps.slice(0, 4) : data.opps).map((opp: any) => (
                      <div key={opp.Id} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, marginBottom: 16, background: '#f8f9fc' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                          <div>
                            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', margin: 0 }}>{opp.Name}</h3>
                            <div style={{ fontSize: 12, color: '#64748b', display: 'flex', gap: 12, marginTop: 4 }}>
                              <span>Close: {opp.CloseDate}</span><span>Prob: {opp.Probability}%</span>
                            </div>
                          </div>
                          <div style={{ fontSize: 18, fontWeight: 700, color: '#4f46e5' }}>{fmt(opp.Amount)}</div>
                        </div>
                        <SalesPath stages={data.stages} currentStage={opp.StageName} />
                      </div>
                    ))
                  }
                </>)}
              </div>
            )}

            {(activeSection === 'overview' || activeSection === 'quotes') && (
              <div style={{ marginBottom: 24 }}>
                {card(<>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    {sectionTitle('Recent Quotes')}
                    {activeSection === 'overview' && data.quotes.length > 4 && (
                      <button onClick={() => setActiveSection('quotes')} style={{ fontSize: 13, color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>View all →</button>
                    )}
                  </div>
                  {loading ? <SkeletonRow /> : data.quotes.length === 0 ? empty('No quotes found.') :
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {(activeSection === 'overview' ? data.quotes.slice(0, 4) : data.quotes).map((q: any) => (
                        <div key={q.Id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8f9fc', padding: '14px 16px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                          <div>
                            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 14 }}>{q.Name}</div>
                            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{q.Opportunity?.Name}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}>{fmt(q.GrandTotal)}</div>
                              <div style={{ fontSize: 11, color: q.Status === 'Approved' ? '#059669' : '#d97706', fontWeight: 600 }}>{q.Status}</div>
                            </div>
                            <button className="quote-pay-btn"
                              onClick={() => setPayingQuote(payingQuote?.Id === q.Id ? null : q)}
                              style={{ background: q.Status === 'Draft' ? '#4f46e5' : '#e2e8f0', color: q.Status === 'Draft' ? 'white' : '#475569' }}>
                              {payingQuote?.Id === q.Id ? 'Cancel' : q.Status === 'Draft' ? 'Review & Pay' : 'View'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  }
                </>)}
              </div>
            )}

            {(activeSection === 'overview' || activeSection === 'orders') && (
              <div style={{ marginBottom: 24 }}>
                {card(<>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    {sectionTitle('Orders')}
                    {activeSection === 'overview' && data.orders.length > 4 && (
                      <button onClick={() => setActiveSection('orders')} style={{ fontSize: 13, color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>View all →</button>
                    )}
                  </div>
                  {loading ? <SkeletonRow /> : data.orders.length === 0 ? empty('No orders found.') :
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                        <thead style={{ background: '#f8f9fc', color: '#64748b', fontSize: 12 }}>
                          <tr>{['Effective Date','Status','Created'].map(h => <th key={h} style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'left', textTransform: 'uppercase' }}>{h}</th>)}</tr>
                        </thead>
                        <tbody>
                          {(activeSection === 'overview' ? data.orders.slice(0, 4) : data.orders).map((o: any) => (
                            <tr key={o.Id} style={{ borderTop: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '12px 16px', color: '#0f172a' }}>{o.EffectiveDate}</td>
                              <td style={{ padding: '12px 16px' }}>{badge(o.Status, o.Status === 'Activated' ? '#059669' : '#d97706', o.Status === 'Activated' ? '#d1fae5' : '#fef3c7')}</td>
                              <td style={{ padding: '12px 16px', color: '#64748b' }}>{new Date(o.CreatedDate).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  }
                </>)}
              </div>
            )}

            {(activeSection === 'overview' || activeSection === 'cases') && (
              <div style={{ marginBottom: 24 }}>
                {card(<>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    {sectionTitle('Support Cases')}
                    {activeSection === 'overview' && data.cases.length > 4 && (
                      <button onClick={() => setActiveSection('cases')} style={{ fontSize: 13, color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>View all →</button>
                    )}
                  </div>
                  {loading ? <SkeletonRow /> : data.cases.length === 0 ? empty('No cases found.') :
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {(activeSection === 'overview' ? data.cases.slice(0, 4) : data.cases).map((c: any) => (
                        <div key={c.Id} style={{ background: '#f8f9fc', border: '1px solid #e2e8f0', borderLeft: `3px solid ${c.Status === 'New' ? '#dc2626' : '#f59e0b'}`, padding: 16, borderRadius: '0 12px 12px 0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>#{c.CaseNumber}</span>
                            {badge(c.Status, c.Status === 'New' ? '#dc2626' : '#d97706', c.Status === 'New' ? '#fee2e2' : '#fef3c7')}
                          </div>
                          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 14 }}>{c.Subject}</div>
                        </div>
                      ))}
                    </div>
                  }
                </>)}
              </div>
            )}

            {(activeSection === 'overview' || activeSection === 'contracts') && (
              <div style={{ marginBottom: 24 }}>
                {card(<>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    {sectionTitle('Contracts')}
                    {activeSection === 'overview' && data.contracts.length > 4 && (
                      <button onClick={() => setActiveSection('contracts')} style={{ fontSize: 13, color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>View all →</button>
                    )}
                  </div>
                  {loading ? <SkeletonRow /> : data.contracts.length === 0 ? empty('No contracts found.') :
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                        <thead style={{ background: '#f8f9fc', color: '#64748b', fontSize: 12 }}>
                          <tr>{['Start Date','Term','Status'].map(h => <th key={h} style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'left', textTransform: 'uppercase' }}>{h}</th>)}</tr>
                        </thead>
                        <tbody>
                          {(activeSection === 'overview' ? data.contracts.slice(0, 4) : data.contracts).map((c: any) => (
                            <tr key={c.Id} style={{ borderTop: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '12px 16px', color: '#0f172a' }}>{c.StartDate}</td>
                              <td style={{ padding: '12px 16px', color: '#475569' }}>{c.ContractTerm} months</td>
                              <td style={{ padding: '12px 16px' }}>{badge(c.Status, c.Status === 'Activated' ? '#059669' : '#d97706', c.Status === 'Activated' ? '#d1fae5' : '#fef3c7')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  }
                </>)}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Quote Modal */}
      <AnimatePresence>
        {payingQuote && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 800, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#0f172a' }}>
                  {payingQuote.Status === 'Draft' ? 'Review Quote:' : 'View Quote:'} {payingQuote.Name}
                </h3>
                <button onClick={() => setPayingQuote(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
              </div>
              <div style={{ height: '60vh', minHeight: 400, background: '#f8fafc' }}>
                <iframe src={`/api/quotes/${payingQuote.Id}/pdf#view=FitH`} style={{ display: 'block', width: '100%', height: '100%', border: 'none' }} title="Quote PDF" />
              </div>
              {payingQuote.Status === 'Draft' && (
                <div style={{ padding: 24, borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#0f172a' }}>Complete Payment</div>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                    <input disabled value="**** **** **** 4242" style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569' }} />
                    <input disabled value="12/26" style={{ width: 80, padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', textAlign: 'center' }} />
                    <input disabled value="123" style={{ width: 60, padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', textAlign: 'center' }} />
                  </div>
                  <button onClick={handlePayQuote} disabled={payLoading}
                    style={{ width: '100%', background: '#10b981', color: 'white', border: 'none', borderRadius: 8, padding: 12, fontSize: 15, fontWeight: 600, cursor: payLoading ? 'wait' : 'pointer' }}>
                    {payLoading ? 'Processing...' : `Confirm & Pay ${fmt(payingQuote.GrandTotal)}`}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

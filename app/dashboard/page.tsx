'use client'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store/authStore'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { DollarSign, FileText, Package, AlertCircle } from 'lucide-react'
import { fetchOpportunities } from '@/services/opportunityService'
import { fetchQuotes } from '@/services/quoteService'
import { fetchOrders } from '@/services/orderService'
import { fetchContracts } from '@/services/contractService'
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

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    Promise.all([
      fetchOpportunities({ contactId: user.contactId, accountId: user.accountId }),
      fetchQuotes(), // Real app would filter by opps
      fetchOrders(user.accountId),
      fetchContracts(user.accountId),
      fetchCases(user.contactId || user.accountId),
      fetchStages()
    ]).then(([opps, quotes, orders, contracts, cases, stages]) => {
      setData({ opps, quotes, orders, contracts, cases, stages })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [user, router])

  if (!user) return null

  const fmt = (p: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(p)

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
                  <div key={q.Id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8f9fc', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 14 }}>{q.Name}</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{q.Opportunity?.Name}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{fmt(q.GrandTotal)}</div>
                      <div style={{ fontSize: 12, color: q.Status === 'Approved' ? '#059669' : '#d97706', fontWeight: 600 }}>{q.Status}</div>
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
    </div>
  )
}

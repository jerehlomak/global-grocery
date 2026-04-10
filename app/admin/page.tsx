'use client'
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
  const totalRev = opps.filter(o => o.StageName === 'Closed Won').reduce((a, b) => a + (b.Amount || 0), 0)
  const pipeRev = opps.filter(o => o.StageName !== 'Closed Won' && o.StageName !== 'Closed Lost').reduce((a, b) => a + (b.Amount || 0), 0)

  return (
    <div style={{ maxWidth: 1280, margin: '40px auto 100px', padding: '0 24px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 32, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Admin Analytics</h1>
          <p style={{ color: '#64748b' }}>Live pipeline and campaign performance.</p>
        </div>
        <LastSynced timestamp={lastSynced} source="salesforce" onRefresh={load} />
      </div>

      <style>{`
        .admin-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 40px;
        }
        .admin-main-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        @media (max-width: 1024px) {
          .admin-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .admin-main-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .admin-stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      <div className="admin-stats-grid">
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

      <div className="admin-main-grid">
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}><BarChart3 size={20} color="#4f46e5" /> Campaign Performance</h2>
          {loading ? <SkeletonRow /> : campaigns.length === 0 ? <p style={{ color: '#64748b' }}>No campaigns found.</p> :
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {campaigns.map(c => {
                const actualCost = c.ActualCost || 0
                const expectedRev = c.ExpectedRevenue || 0
                const roi = actualCost > 0 ? ((expectedRev - actualCost) / actualCost) * 100 : 0
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
                        <div style={{ fontWeight: 700, color: '#4f46e5', fontSize: 15 }}>{fmt(expectedRev)}</div>
                        <div style={{ color: actualCost > 0 && roi > 0 ? '#059669' : '#dc2626', fontSize: 12, fontWeight: 600 }}>{actualCost > 0 ? (roi > 0 ? '+' : '') + roi.toFixed(1) + '%' : '0.0%'} ROI</div>
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
                const stageVal = stageOpps.reduce((a, b) => a + (b.Amount || 0), 0)
                const maxVal = Math.max(...stages.map(x => opps.filter(o => o.StageName === x.ApiName).reduce((a, b) => a + (b.Amount || 0), 0)))
                const pct = maxVal > 0 ? (stageVal / maxVal) * 100 : 0
                return (
                  <div key={st.ApiName}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                      <span style={{ color: '#475569', fontWeight: 500 }}>{st.Label} ({stageOpps.length})</span>
                      <span style={{ color: '#0f172a', fontWeight: 700 }}>{fmt(stageVal)}</span>
                    </div>
                    <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }}
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

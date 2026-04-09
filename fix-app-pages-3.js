const fs = require('fs');

// -- CUSTOMER DASHBOARD (light) --
fs.writeFileSync('app/dashboard/page.tsx', `'use client'
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
      fetchOpportunities({ contactId: user.sfContactId }),
      fetchQuotes(), // Real app would filter by opps
      fetchOrders(user.sfAccountId),
      fetchContracts(user.sfAccountId),
      fetchCases(user.sfContactId),
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40 }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
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
`);
console.log('Fixed: dashboard/page.tsx');

//  ADMIN LOGIN 
fs.writeFileSync('app/login/page.tsx', `'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Lock, Mail, ArrowRight } from 'lucide-react'
import { login } from '@/services/authService'
import { useAuthStore } from '@/lib/store/authStore'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await login(form)
      setAuth(res.user, res.token)
      router.push('/dashboard')
    } catch (err: any) { setError(err.message || 'Login failed') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#f8f9fc' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, padding: 40, width: '100%', maxWidth: 420, boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Welcome back</h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>Sign in to your GlobalGrocer account</p>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {error && <div style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: 12, borderRadius: 8, fontSize: 13, textAlign: 'center' }}>{error}</div>}
          
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input type="email" placeholder="Email address" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              style={{ width: '100%', background: '#f1f5f9', border: '1px solid transparent', borderRadius: 12, padding: '14px 16px 14px 48px', color: '#0f172a', fontSize: 15, outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box' }}
              onFocus={e => e.currentTarget.style.borderColor = '#4f46e5'} onBlur={e => e.currentTarget.style.borderColor = 'transparent'} />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input type="password" placeholder="Password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})}
              style={{ width: '100%', background: '#f1f5f9', border: '1px solid transparent', borderRadius: 12, padding: '14px 16px 14px 48px', color: '#0f172a', fontSize: 15, outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box' }}
              onFocus={e => e.currentTarget.style.borderColor = '#4f46e5'} onBlur={e => e.currentTarget.style.borderColor = 'transparent'} />
          </div>

          <button disabled={loading} style={{ background: '#4f46e5', color: 'white', border: 'none', borderRadius: 12, padding: 16, fontSize: 16, fontWeight: 600, cursor: loading ? 'wait' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 8, boxShadow: '0 4px 12px rgba(79,70,229,0.3)', transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#4338ca'} onMouseLeave={e => e.currentTarget.style.background = '#4f46e5'}>
            {loading ? 'Signing in...' : <>Sign in <ArrowRight size={18} /></>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 32, fontSize: 14, color: '#64748b' }}>
          Don't have an account? <Link href="/register" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>Register</Link>
        </div>
      </motion.div>
    </div>
  )
}
`);
console.log('Fixed: login/page.tsx');

//  REGISTER 
fs.writeFileSync('app/register/page.tsx', `'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Building2, User } from 'lucide-react'
import { register } from '@/services/authService'
import { createLead } from '@/services/leadService'
import { useAuthStore } from '@/lib/store/authStore'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [type, setType] = useState<'b2b'|'b2c'>('b2b')
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '', company: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await register(form)
      setAuth(res.user, res.token)
      // Background Salesforce Sync (Lead Generation)
      createLead({
        firstName: form.firstName, lastName: form.lastName, email: form.email,
        phone: form.phone, company: type === 'b2b' ? form.company : 'Direct Consumer',
        leadSource: 'Web', country: 'United States'
      }).catch(console.error)
      router.push('/dashboard')
    } catch (err: any) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', background: '#f8f9fc' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, padding: 40, width: '100%', maxWidth: 500, boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Create Account</h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>Join GlobalGrocer to access regional pricing and bulk orders.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 32 }}>
          <button onClick={() => setType('b2b')} type="button"
            style={{ background: type === 'b2b' ? '#ede9fe' : '#f8f9fc', border: '1px solid ' + (type === 'b2b' ? '#4f46e5' : '#e2e8f0'), borderRadius: 12, padding: '16px', color: type === 'b2b' ? '#4f46e5' : '#64748b', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}>
            <Building2 size={24} />
            <span style={{ fontWeight: 600, fontSize: 14 }}>Business (B2B)</span>
          </button>
          <button onClick={() => setType('b2c')} type="button"
            style={{ background: type === 'b2c' ? '#ede9fe' : '#f8f9fc', border: '1px solid ' + (type === 'b2c' ? '#4f46e5' : '#e2e8f0'), borderRadius: 12, padding: '16px', color: type === 'b2c' ? '#4f46e5' : '#64748b', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}>
            <User size={24} />
            <span style={{ fontWeight: 600, fontSize: 14 }}>Individual (B2C)</span>
          </button>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && <div style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: 12, borderRadius: 8, fontSize: 13, textAlign: 'center' }}>{error}</div>}
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <input placeholder="First name" required value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})}
              style={{ width: '100%', background: '#f1f5f9', border: '1px solid transparent', borderRadius: 12, padding: '12px 16px', color: '#0f172a', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} onFocus={e => e.currentTarget.style.borderColor = '#4f46e5'} onBlur={e => e.currentTarget.style.borderColor = 'transparent'} />
            <input placeholder="Last name" required value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})}
              style={{ width: '100%', background: '#f1f5f9', border: '1px solid transparent', borderRadius: 12, padding: '12px 16px', color: '#0f172a', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} onFocus={e => e.currentTarget.style.borderColor = '#4f46e5'} onBlur={e => e.currentTarget.style.borderColor = 'transparent'} />
          </div>
          
          <input type="email" placeholder="Email address" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
            style={{ width: '100%', background: '#f1f5f9', border: '1px solid transparent', borderRadius: 12, padding: '12px 16px', color: '#0f172a', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} onFocus={e => e.currentTarget.style.borderColor = '#4f46e5'} onBlur={e => e.currentTarget.style.borderColor = 'transparent'} />
          
          <input type="password" placeholder="Create password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})}
            style={{ width: '100%', background: '#f1f5f9', border: '1px solid transparent', borderRadius: 12, padding: '12px 16px', color: '#0f172a', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} onFocus={e => e.currentTarget.style.borderColor = '#4f46e5'} onBlur={e => e.currentTarget.style.borderColor = 'transparent'} />

          <input type="tel" placeholder="Phone number" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
            style={{ width: '100%', background: '#f1f5f9', border: '1px solid transparent', borderRadius: 12, padding: '12px 16px', color: '#0f172a', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} onFocus={e => e.currentTarget.style.borderColor = '#4f46e5'} onBlur={e => e.currentTarget.style.borderColor = 'transparent'} />

          {type === 'b2b' && (
            <input placeholder="Company Name" required={type === 'b2b'} value={form.company} onChange={e => setForm({...form, company: e.target.value})}
              style={{ width: '100%', background: '#f1f5f9', border: '1px solid transparent', borderRadius: 12, padding: '12px 16px', color: '#0f172a', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} onFocus={e => e.currentTarget.style.borderColor = '#4f46e5'} onBlur={e => e.currentTarget.style.borderColor = 'transparent'} />
          )}

          <p style={{ fontSize: 12, color: '#64748b', textAlign: 'center', margin: '8px 0' }}>Creating an account will generate a new Lead record in Salesforce.</p>

          <button disabled={loading} style={{ background: '#4f46e5', color: 'white', border: 'none', borderRadius: 12, padding: 16, fontSize: 16, fontWeight: 600, cursor: loading ? 'wait' : 'pointer', marginTop: 8, boxShadow: '0 4px 12px rgba(79,70,229,0.3)', transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#4338ca'} onMouseLeave={e => e.currentTarget.style.background = '#4f46e5'}>
            {loading ? 'Creating account...' : 'Complete Registration'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 32, fontSize: 14, color: '#64748b' }}>
          Already have an account? <Link href="/login" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </div>
      </motion.div>
    </div>
  )
}
`);
console.log('Fixed: register/page.tsx');

console.log('\\nDashboard and Auth pages converted to light mode!');

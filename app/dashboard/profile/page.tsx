'use client'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store/authStore'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Building2, User, CreditCard } from 'lucide-react'

// Dummy fetch function, ideally maps to a real salesforce call via an API route
// like GET /api/salesforce/account
async function getAccountData(accountId: string) {
  const res = await fetch(`/api/salesforce/account/${accountId}`)
  return res.json()
}

async function updateAccountBilling(accountId: string, data: any) {
  const res = await fetch(`/api/salesforce/account/${accountId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json()
}

export default function ProfilePage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [billing, setBilling] = useState({
    BillingStreet: '',
    BillingCity: '',
    BillingState: '',
    BillingPostalCode: '',
    BillingCountry: ''
  })
  
  useEffect(() => {
    if (!user) { router.push('/login'); return }
    
    // Fetch user account (Billing fields)
    if (user.accountId) {
      getAccountData(user.accountId)
        .then((res) => {
          if (res.success && res.data) {
            setBilling({
              BillingStreet: res.data.BillingStreet || '',
              BillingCity: res.data.BillingCity || '',
              BillingState: res.data.BillingState || '',
              BillingPostalCode: res.data.BillingPostalCode || '',
              BillingCountry: res.data.BillingCountry || ''
            })
          }
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [user, router])
  
  const saveBilling = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    if (user?.accountId) {
      await updateAccountBilling(user.accountId, billing)
      alert("Billing details synchronized to Salesforce successfully!")
    }
    setSaving(false)
  }

  if (!user) return null

  return (
    <div style={{ maxWidth: 1280, margin: '40px auto 100px', padding: '0 24px' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 32, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Profile Settings</h1>
        <p style={{ color: '#64748b' }}>Manage your account and billing information for future orders.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
        {/* Profile Card */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', alignSelf: 'start' }}>
          <div style={{ width: 64, height: 64, background: '#ede9fe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, margin: '0 auto' }}>
            {user.accountType === 'b2b' ? <Building2 size={32} color="#4f46e5" /> : <User size={32} color="#4f46e5" />}
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', textAlign: 'center', marginBottom: 4 }}>{user.company || `${user.firstName} ${user.lastName}`}</h2>
          <p style={{ color: '#64748b', fontSize: 13, textAlign: 'center', marginBottom: 24 }}>{user.email}</p>
          <div style={{ padding: '12px 16px', background: '#f8f9fc', borderRadius: 12, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Account Type</span>
            <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 700, textTransform: 'uppercase' }}>{user.accountType}</span>
          </div>
        </div>

        {/* Billing Form */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <CreditCard size={20} color="#4f46e5" /> Billing Details
          </h2>
          <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>We collect this information only when you are preparing to make an order. It connects directly to your Salesforce Account.</p>
          
          <form onSubmit={saveBilling} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Street Address</label>
              <input required value={billing.BillingStreet} onChange={e => setBilling({...billing, BillingStreet: e.target.value})}
                style={{ background: '#f1f5f9', border: '1px solid transparent', borderRadius: 12, padding: '12px 16px', color: '#0f172a', fontSize: 14, outline: 'none' }} onFocus={e => e.currentTarget.style.borderColor = '#4f46e5'} onBlur={e => e.currentTarget.style.borderColor = 'transparent'} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>City</label>
                <input required value={billing.BillingCity} onChange={e => setBilling({...billing, BillingCity: e.target.value})}
                  style={{ background: '#f1f5f9', border: '1px solid transparent', borderRadius: 12, padding: '12px 16px', color: '#0f172a', fontSize: 14, outline: 'none' }} onFocus={e => e.currentTarget.style.borderColor = '#4f46e5'} onBlur={e => e.currentTarget.style.borderColor = 'transparent'} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>State / Province</label>
                <input required value={billing.BillingState} onChange={e => setBilling({...billing, BillingState: e.target.value})}
                  style={{ background: '#f1f5f9', border: '1px solid transparent', borderRadius: 12, padding: '12px 16px', color: '#0f172a', fontSize: 14, outline: 'none' }} onFocus={e => e.currentTarget.style.borderColor = '#4f46e5'} onBlur={e => e.currentTarget.style.borderColor = 'transparent'} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Postal Code</label>
                <input required value={billing.BillingPostalCode} onChange={e => setBilling({...billing, BillingPostalCode: e.target.value})}
                  style={{ background: '#f1f5f9', border: '1px solid transparent', borderRadius: 12, padding: '12px 16px', color: '#0f172a', fontSize: 14, outline: 'none' }} onFocus={e => e.currentTarget.style.borderColor = '#4f46e5'} onBlur={e => e.currentTarget.style.borderColor = 'transparent'} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Country</label>
                <input required value={billing.BillingCountry} onChange={e => setBilling({...billing, BillingCountry: e.target.value})}
                  style={{ background: '#f1f5f9', border: '1px solid transparent', borderRadius: 12, padding: '12px 16px', color: '#0f172a', fontSize: 14, outline: 'none' }} onFocus={e => e.currentTarget.style.borderColor = '#4f46e5'} onBlur={e => e.currentTarget.style.borderColor = 'transparent'} />
              </div>
            </div>

            <button disabled={loading || saving} style={{ background: '#4f46e5', color: 'white', border: 'none', borderRadius: 12, padding: 16, fontSize: 16, fontWeight: 600, cursor: saving ? 'wait' : 'pointer', marginTop: 16, boxShadow: '0 4px 12px rgba(79,70,229,0.3)', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#4338ca'} onMouseLeave={e => e.currentTarget.style.background = '#4f46e5'}>
              {saving ? 'Saving...' : 'Save Billing Details'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

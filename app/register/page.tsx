'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Building2, User } from 'lucide-react'
import { register } from '@/services/authService'
import { createLead } from '@/services/leadService'
import { useAuthStore } from '@/lib/store/authStore'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const { setUser } = useAuthStore()
  const [type, setType] = useState<'b2b'|'b2c'>('b2b')
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '', company: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dynamicFields, setDynamicFields] = useState<any[]>([])
  const [dynamicValues, setDynamicValues] = useState<any>({})

  // Fetch dynamic SF schema requirement
  useEffect(() => {
    fetch('/api/salesforce/account/describe')
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          // Only extract non-standard fields that might be strict required like a custom "TIN__c"
          const required = json.data.filter((f: any) => f.required && !['Name', 'FirstName', 'LastName', 'Phone', 'PersonEmail'].includes(f.name))
          setDynamicFields(required)
        }
      })
      .catch(console.error)
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      // Register directly to SF Account via api route
      const res = await register({ ...form, accountType: type, ...dynamicValues })
      setUser(res.user, res.token)
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

          {/* Render dynamic Salesforce fields */}
          {dynamicFields.length > 0 && dynamicFields.map((field) => (
             <input key={field.name} placeholder={field.label} required={field.required} value={dynamicValues[field.name] || ''} onChange={e => setDynamicValues({...dynamicValues, [field.name]: e.target.value})}
               style={{ width: '100%', background: '#f1f5f9', border: '1px solid transparent', borderRadius: 12, padding: '12px 16px', color: '#0f172a', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} onFocus={e => e.currentTarget.style.borderColor = '#4f46e5'} onBlur={e => e.currentTarget.style.borderColor = 'transparent'} />
          ))}

          <p style={{ fontSize: 12, color: '#64748b', textAlign: 'center', margin: '8px 0' }}>Creating an account will generate a new Account record in Salesforce.</p>

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

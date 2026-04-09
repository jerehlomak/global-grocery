'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Lock, Mail, ArrowRight } from 'lucide-react'
import { login } from '@/services/authService'
import { useAuthStore } from '@/lib/store/authStore'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const { setUser } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await login(form)
      setUser(res.user, res.token)
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

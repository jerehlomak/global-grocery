'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

type CampaignSubscribeModalProps = {
  isOpen: boolean
  onClose: () => void
  campaignId: string
  campaignName: string
}

export default function CampaignSubscribeModal({ isOpen, onClose, campaignId, campaignName }: CampaignSubscribeModalProps) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', company: '', region: '' })
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus('idle')
    setErrorMsg('')

    try {
      const res = await fetch('/api/campaigns/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, campaignId }),
      })
      const data = await res.json()

      if (data.success) {
        setStatus('success')
        setTimeout(() => {
          onClose()
          setStatus('idle')
          setForm({ firstName: '', lastName: '', email: '', phone: '', company: '', region: '' })
        }, 2500)
      } else {
        setStatus('error')
        setErrorMsg(data.error || 'Subscription failed.')
      }
    } catch (err) {
      console.error(err)
      setStatus('error')
      setErrorMsg('Network error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={onClose}
          style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }} 
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          style={{ position: 'relative', width: '100%', maxWidth: 480, background: '#fff', borderRadius: 24, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' }}
        >
          <div style={{ background: 'linear-gradient(135deg, #4f46e5, #0ea5e9)', padding: '32px 32px 24px', color: '#fff', position: 'relative' }}>
            <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}>
              <X size={18} />
            </button>
            <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Join Campaign</span>
            <h2 style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.2 }}>{campaignName}</h2>
          </div>

          <div style={{ padding: 32 }}>
            {status === 'success' ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '20px 0' }}>
                <CheckCircle2 size={64} color="#10b981" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>You're In!</h3>
                <p style={{ color: '#64748b' }}>Your subscription was successfully registered in Salesforce.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {status === 'error' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fef2f2', color: '#ef4444', padding: '12px 16px', borderRadius: 12, fontSize: 14 }}>
                    <AlertCircle size={16} /> {errorMsg}
                  </div>
                )}
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <input required placeholder="First Name" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #cbd5e1', outline: 'none', fontSize: 15 }} />
                  <input required placeholder="Last Name" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #cbd5e1', outline: 'none', fontSize: 15 }} />
                </div>
                
                <input required type="email" placeholder="Email Address" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #cbd5e1', outline: 'none', fontSize: 15 }} />
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <input required type="tel" placeholder="Phone Number" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #cbd5e1', outline: 'none', fontSize: 15 }} />
                  
                  <select required value={(form as any).region || ''} onChange={e => setForm({...form, region: e.target.value})}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #cbd5e1', outline: 'none', fontSize: 15, background: '#fff', color: (form as any).region ? '#0f172a' : '#94a3b8' }}>
                    <option value="" disabled hidden>Select Region</option>
                    <option value="US" style={{ color: '#0f172a' }}>United States (US)</option>
                    <option value="UK" style={{ color: '#0f172a' }}>United Kingdom (UK)</option>
                    <option value="NG" style={{ color: '#0f172a' }}>Nigeria (NG)</option>
                  </select>
                </div>
                
                <input placeholder="Company Name (Optional)" value={form.company} onChange={e => setForm({...form, company: e.target.value})}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #cbd5e1', outline: 'none', fontSize: 15 }} />

                <button type="submit" disabled={loading}
                  style={{ width: '100%', padding: '14px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8, transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#1e293b'}
                  onMouseLeave={e => e.currentTarget.style.background = '#0f172a'}
                >
                  {loading ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : 'Subscribe to Campaign'}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

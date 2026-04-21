'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Briefcase, Users, MapPin, CheckCircle2, Send, ChevronDown, AlignLeft } from 'lucide-react'

// Action URL from the snippet
const SF_ACTION = 'https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8&orgId=00Dd200000eNvL7'

const INDUSTRIES = [
  'Retail', 'Food & Beverage', 'Hospitality', 'Manufacturing', 
  'Healthcare', 'Education', 'Government', 'Transportation', 
  'Shipping', 'Finance'
]

const REGIONS = ['Africa', 'Europe', 'North America']

const PRODUCT_INTERESTS = [
  'Bulk Order', 'Distributor Partnership', 'Retail Supply', 
  'Bulk Staples', 'Cooking Essentials', 'Household Items', 
  'Beverages', 'Packaged Foods', 'Fresh Produce', 
  'Personal Purchase', 'Browsing / Inquiry'
]

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.07)',
  border: '1.5px solid rgba(255,255,255,0.15)',
  borderRadius: 10,
  padding: '12px 12px 12px 42px',
  color: '#fff',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s, background 0.2s',
  fontFamily: 'inherit',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700,
  color: 'rgba(255,255,255,0.55)',
  marginBottom: 6,
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
}

const iconWrap: React.CSSProperties = {
  position: 'absolute',
  left: 12,
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'rgba(255,255,255,0.4)',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
}

const INIT = {
  first_name: '', last_name: '', email: '', company: '',
  industry: '', employees: '', region: '', product_interest: ''
}

export default function WebToLeadForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [fields, setFields] = useState(INIT)
  const [focused, setFocused] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const set = (key: keyof typeof INIT) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFields(f => ({ ...f, [key]: e.target.value }))

  const focusBorder = (name: string): React.CSSProperties =>
    focused === name
      ? { borderColor: 'rgba(167,139,250,0.8)', background: 'rgba(255,255,255,0.1)' }
      : {}

  const handleSubmit = () => {
    // Form will navigate to retURL; we optimistically show success + clear
    setTimeout(() => {
      setFields(INIT)
      setSubmitted(true)
    }, 300)
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ textAlign: 'center', padding: '48px 32px' }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg,#4ade80,#22c55e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 0 40px rgba(74,222,128,0.35)',
          }}
        >
          <CheckCircle2 size={36} color="white" />
        </motion.div>
        <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 22, marginBottom: 10 }}>
          Lead Submitted!
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, lineHeight: 1.6, marginBottom: 28 }}>
          Your details have been sent to our Sales Cloud pipeline.<br />A representative will be in touch soon.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          style={{
            background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.2)',
            color: '#fff', padding: '10px 24px', borderRadius: 10, cursor: 'pointer',
            fontWeight: 600, fontSize: 14, fontFamily: 'inherit',
          }}
        >
          Submit Another
        </button>
      </motion.div>
    )
  }

  return (
    <form
      ref={formRef}
      action={SF_ACTION}
      method="POST"
      onSubmit={handleSubmit}
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      {/* Salesforce hidden fields */}
      <input type="hidden" name="oid" value="00Dd200000eNvL7" />
      <input type="hidden" name="retURL" value="https://global-grocery.vercel.app" />
      <input type="hidden" name="lead_source" value="Web" />

      {/* Name row */}
      <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* First Name */}
        <div>
          <label htmlFor="first_name" style={labelStyle}>First Name</label>
          <div style={{ position: 'relative' }}>
            <span style={iconWrap}><User size={15} /></span>
            <input
              id="first_name" name="first_name" type="text" maxLength={40}
              required placeholder="Jane" value={fields.first_name} onChange={set('first_name')}
              style={{ ...inputStyle, ...focusBorder('first_name') }}
              onFocus={() => setFocused('first_name')} onBlur={() => setFocused(null)}
            />
          </div>
        </div>
        {/* Last Name */}
        <div>
          <label htmlFor="last_name" style={labelStyle}>Last Name</label>
          <div style={{ position: 'relative' }}>
            <span style={iconWrap}><User size={15} /></span>
            <input
              id="last_name" name="last_name" type="text" maxLength={80}
              required placeholder="Smith" value={fields.last_name} onChange={set('last_name')}
              style={{ ...inputStyle, ...focusBorder('last_name') }}
              onFocus={() => setFocused('last_name')} onBlur={() => setFocused(null)}
            />
          </div>
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" style={labelStyle}>Email</label>
        <div style={{ position: 'relative' }}>
          <span style={iconWrap}><Mail size={15} /></span>
          <input
            id="email" name="email" type="email" maxLength={80}
            required placeholder="jane@company.com" value={fields.email} onChange={set('email')}
            style={{ ...inputStyle, ...focusBorder('email') }}
            onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
          />
        </div>
      </div>

      {/* Company + Employees row */}
      <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Company */}
        <div>
          <label htmlFor="company" style={labelStyle}>Company</label>
          <div style={{ position: 'relative' }}>
            <span style={iconWrap}><Briefcase size={15} /></span>
            <input
              id="company" name="company" type="text" maxLength={40} required
              placeholder="Acme Corp" value={fields.company} onChange={set('company')}
              style={{ ...inputStyle, ...focusBorder('company') }}
              onFocus={() => setFocused('company')} onBlur={() => setFocused(null)}
            />
          </div>
        </div>
        {/* Employees */}
        <div>
          <label htmlFor="employees" style={labelStyle}>Employees</label>
          <div style={{ position: 'relative' }}>
            <span style={iconWrap}><Users size={15} /></span>
            <input
              id="employees" name="employees" type="text" maxLength={20}
              placeholder="e.g. 50" value={fields.employees} onChange={set('employees')}
              style={{ ...inputStyle, ...focusBorder('employees') }}
              onFocus={() => setFocused('employees')} onBlur={() => setFocused(null)}
            />
          </div>
        </div>
      </div>

      {/* Industry */}
      <div>
        <label htmlFor="00Nd200001xsj0r" style={labelStyle}>Industry</label>
        <div style={{ position: 'relative' }}>
          <span style={iconWrap}><Briefcase size={15} /></span>
          <select
            id="00Nd200001xsj0r" name="00Nd200001xsj0r" title="Industry"
            value={fields.industry} onChange={set('industry')}
            style={{
              ...inputStyle,
              appearance: 'none', WebkitAppearance: 'none',
              cursor: 'pointer',
              ...focusBorder('industry'),
            }}
            onFocus={() => setFocused('industry')} onBlur={() => setFocused(null)}
          >
            <option value="" style={{ background: '#1e1b4b' }}>-- Select Industry --</option>
            {INDUSTRIES.map(ind => (
              <option key={ind} value={ind} style={{ background: '#1e1b4b' }}>{ind}</option>
            ))}
          </select>
          <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', pointerEvents: 'none' }}>
            <ChevronDown size={15} />
          </span>
        </div>
      </div>

      {/* Region */}
      <div>
        <label htmlFor="00Nd200001xgsHd" style={labelStyle}>Region</label>
        <div style={{ position: 'relative' }}>
          <span style={iconWrap}><MapPin size={15} /></span>
          <select
            id="00Nd200001xgsHd" name="00Nd200001xgsHd" title="Region"
            value={fields.region} onChange={set('region')}
            style={{
              ...inputStyle,
              appearance: 'none', WebkitAppearance: 'none',
              cursor: 'pointer',
              ...focusBorder('region'),
            }}
            onFocus={() => setFocused('region')} onBlur={() => setFocused(null)}
          >
            <option value="" style={{ background: '#1e1b4b' }}>-- Select Region --</option>
            {REGIONS.map(reg => (
              <option key={reg} value={reg} style={{ background: '#1e1b4b' }}>{reg}</option>
            ))}
          </select>
          <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', pointerEvents: 'none' }}>
            <ChevronDown size={15} />
          </span>
        </div>
      </div>

      {/* Product Interest */}
      <div>
        <label htmlFor="00Nd200001sDrWz" style={labelStyle}>Product Interest</label>
        <div style={{ position: 'relative' }}>
          <span style={iconWrap}><AlignLeft size={15} /></span>
          <select
            id="00Nd200001sDrWz" name="00Nd200001sDrWz" title="Product Interest"
            value={fields.product_interest} onChange={set('product_interest')}
            style={{
              ...inputStyle,
              appearance: 'none', WebkitAppearance: 'none',
              cursor: 'pointer',
              ...focusBorder('product_interest'),
            }}
            onFocus={() => setFocused('product_interest')} onBlur={() => setFocused(null)}
          >
            <option value="" style={{ background: '#1e1b4b' }}>-- Select Interest --</option>
            {PRODUCT_INTERESTS.map(pi => (
              <option key={pi} value={pi} style={{ background: '#1e1b4b' }}>{pi}</option>
            ))}
          </select>
          <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', pointerEvents: 'none' }}>
            <ChevronDown size={15} />
          </span>
        </div>
      </div>

      {/* Submit */}
      <motion.button
        type="submit"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        style={{
          background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 60%, #4f46e5 100%)',
          color: 'white', border: 'none', borderRadius: 10, padding: '14px 20px',
          fontSize: 15, fontWeight: 700, cursor: 'pointer',
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
          marginTop: 4,
          boxShadow: '0 4px 20px rgba(124,58,237,0.5)',
          letterSpacing: '0.03em', fontFamily: 'inherit',
        }}
      >
        <Send size={16} />
        Submit to Sales Cloud
      </motion.button>
    </form>
  )
}

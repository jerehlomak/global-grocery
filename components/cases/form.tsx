'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle2, User, Mail, Phone, FileText, AlignLeft } from 'lucide-react'

const SF_ACTION = 'https://webto.salesforce.com/servlet/servlet.WebToCase?encoding=UTF-8&orgId=00Dd200000gnjBt'

const INIT = { name: '', email: '', phone: '', subject: '', description: '' }

const inputBase: React.CSSProperties = {
  width: '100%',
  background: '#f8fafc',
  border: '1.5px solid #e2e8f0',
  borderRadius: 10,
  padding: '11px 12px 11px 40px',
  color: '#0f172a',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  fontFamily: 'inherit',
}

const labelBase: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700,
  color: '#475569',
  marginBottom: 6,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

function Field({ id, label, icon, children }: {
  id: string; label: string; icon: React.ReactNode; children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <label htmlFor={id} style={labelBase}>{label}</label>
      <div style={{ position: 'relative' }}>
        <span style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          color: '#94a3b8', pointerEvents: 'none', display: 'flex', alignItems: 'center',
        }}>
          {icon}
        </span>
        {children}
      </div>
    </div>
  )
}

export default function CaseSupportForm() {
  const [fields, setFields] = useState(INIT)
  const [focused, setFocused] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const set = (key: keyof typeof INIT) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFields(f => ({ ...f, [key]: e.target.value }))

  const focusStyle = (name: string): React.CSSProperties =>
    focused === name
      ? { borderColor: '#4f46e5', boxShadow: '0 0 0 3px rgba(79,70,229,0.12)', background: '#fff' }
      : {}

  const handleSubmit = () => {
    // Optimistically clear & show success before Salesforce redirect
    setTimeout(() => {
      setFields(INIT)
      setSubmitted(true)
    }, 300)
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
          border: '1.5px solid #a7f3d0',
          borderRadius: 16,
          padding: '40px 24px',
          textAlign: 'center',
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          style={{
            width: 64, height: 64, background: '#059669', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          <CheckCircle2 size={32} color="white" />
        </motion.div>
        <h3 style={{ color: '#065f46', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
          Case Submitted!
        </h3>
        <p style={{ color: '#047857', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
          Your case has been logged in Salesforce Service Cloud. Our support team will reach out shortly.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          style={{
            background: 'transparent', border: '1.5px solid #34d399', color: '#059669',
            padding: '9px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600,
            fontSize: 14, fontFamily: 'inherit', transition: 'all 0.2s',
          }}
        >
          Submit Another
        </button>
      </motion.div>
    )
  }

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      action={SF_ACTION}
      method="POST"
      onSubmit={handleSubmit}
      style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
    >
      {/* Salesforce hidden fields */}
      <input type="hidden" name="orgid" value="00Dd200000gnjBt" />
      <input type="hidden" name="retURL" value={typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'} />
      <input type="hidden" id="external" name="external" value="1" />

      {/* Contact Name */}
      <Field id="case_name" label="Contact Name" icon={<User size={15} />}>
        <input
          id="case_name" name="name" type="text" maxLength={80} required
          placeholder="Jane Smith"
          value={fields.name} onChange={set('name')}
          style={{ ...inputBase, ...focusStyle('name') }}
          onFocus={() => setFocused('name')} onBlur={() => setFocused(null)}
        />
      </Field>

      {/* Email */}
      <Field id="case_email" label="Email" icon={<Mail size={15} />}>
        <input
          id="case_email" name="email" type="email" maxLength={80} required
          placeholder="jane@example.com"
          value={fields.email} onChange={set('email')}
          style={{ ...inputBase, ...focusStyle('email') }}
          onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
        />
      </Field>

      {/* Phone */}
      <Field id="case_phone" label="Phone" icon={<Phone size={15} />}>
        <input
          id="case_phone" name="phone" type="tel" maxLength={40}
          placeholder="+1 (555) 000-0000"
          value={fields.phone} onChange={set('phone')}
          style={{ ...inputBase, ...focusStyle('phone') }}
          onFocus={() => setFocused('phone')} onBlur={() => setFocused(null)}
        />
      </Field>

      {/* Subject */}
      <Field id="case_subject" label="Subject" icon={<FileText size={15} />}>
        <input
          id="case_subject" name="subject" type="text" maxLength={80} required
          placeholder="Brief summary of the issue"
          value={fields.subject} onChange={set('subject')}
          style={{ ...inputBase, ...focusStyle('subject') }}
          onFocus={() => setFocused('subject')} onBlur={() => setFocused(null)}
        />
      </Field>

      {/* Description */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <label htmlFor="case_description" style={labelBase}>Description</label>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8', pointerEvents: 'none' }}>
            <AlignLeft size={15} />
          </span>
          <textarea
            id="case_description" name="description" rows={4} required
            placeholder="Describe your issue in detail..."
            value={fields.description} onChange={set('description')}
            style={{
              ...inputBase,
              padding: '11px 12px 11px 40px',
              resize: 'vertical',
              minHeight: 100,
              ...(focused === 'description'
                ? { borderColor: '#4f46e5', boxShadow: '0 0 0 3px rgba(79,70,229,0.12)', background: '#fff' }
                : {}),
            }}
            onFocus={() => setFocused('description')} onBlur={() => setFocused(null)}
          />
        </div>
      </div>

      {/* Submit */}
      <motion.button
        type="submit"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          color: 'white', border: 'none', borderRadius: 10,
          padding: '13px 20px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
          marginTop: 4, fontFamily: 'inherit',
          boxShadow: '0 4px 15px rgba(79,70,229,0.35)',
          letterSpacing: '0.02em',
        }}
      >
        <Send size={16} />
        Submit Case to Salesforce
      </motion.button>
    </motion.form>
  )
}

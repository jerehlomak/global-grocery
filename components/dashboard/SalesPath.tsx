'use client'
import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import type { SFOpportunityStage } from '@/types/salesforce'

export default function SalesPath({ stages, currentStage }: { stages: SFOpportunityStage[]; currentStage: string }) {
  const activeStages = stages.filter(s => !s.IsClosed || s.ApiName === currentStage)
  const currentIdx = activeStages.findIndex(s => s.ApiName === currentStage)
  return (
    <div style={{ padding: '16px 0', overflowX: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', minWidth: 600 }}>
        {activeStages.map((stage, idx) => {
          const done = idx < currentIdx || (stage.IsWon && stage.ApiName === currentStage)
          const active = stage.ApiName === currentStage
          return (
            <div key={stage.ApiName} style={{ display: 'flex', alignItems: 'center', flex: idx < activeStages.length - 1 ? 1 : 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <motion.div animate={{ scale: active ? 1.1 : 1 }}
                  style={{ width: 32, height: 32, borderRadius: '50%', background: done ? '#059669' : active ? '#4f46e5' : '#f1f4f9', border: active ? '2px solid #4f46e5' : done ? '2px solid #059669' : '2px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: active ? '0 0 12px rgba(79,70,229,0.25)' : 'none', flexShrink: 0 }}>
                  {done ? <CheckCircle2 size={16} color="white" /> : <span style={{ color: active ? 'white' : '#94a3b8', fontSize: 11, fontWeight: 700 }}>{idx + 1}</span>}
                </motion.div>
                <span style={{ fontSize: 10, color: active ? '#4f46e5' : done ? '#059669' : '#94a3b8', fontWeight: active ? 600 : 400, textAlign: 'center', maxWidth: 70, lineHeight: 1.3 }}>{stage.Label}</span>
              </div>
              {idx < activeStages.length - 1 && <div style={{ flex: 1, height: 2, background: idx < currentIdx ? '#059669' : '#e2e8f0', margin: '0 4px', marginTop: -18 }} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

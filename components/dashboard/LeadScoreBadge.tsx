'use client'
import { Flame, Thermometer, Snowflake } from 'lucide-react'
import type { LeadScoreCategory } from '@/types/api'
import { getLeadScoreCategory } from '@/types/api'

export default function LeadScoreBadge({ score, showLabel = true }: { score: number; showLabel?: boolean }) {
  const cat = getLeadScoreCategory(score)
  const cfg: Record<LeadScoreCategory, { color: string; bg: string; icon: typeof Flame; label: string }> = {
    hot: { color: '#dc2626', bg: '#fee2e2', icon: Flame, label: 'Hot Lead' },
    warm: { color: '#d97706', bg: '#fef3c7', icon: Thermometer, label: 'Warm Lead' },
    cold: { color: '#2563eb', bg: '#dbeafe', icon: Snowflake, label: 'Cold Lead' },
  }
  const { color, bg, icon: Icon, label } = cfg[cat]
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: bg, border: '1px solid ' + color + '33', borderRadius: 20, padding: '4px 12px' }}>
      <Icon size={13} color={color} />
      <span style={{ color, fontWeight: 700, fontSize: 13 }}>{score}</span>
      {showLabel && <span style={{ color, fontSize: 12 }}>{label}</span>}
    </div>
  )
}

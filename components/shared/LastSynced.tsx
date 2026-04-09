'use client'
import { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'

interface LastSyncedProps {
  timestamp?: string
  source?: 'salesforce' | 'mock'
  onRefresh?: () => void
}

export default function LastSynced({ timestamp, source = 'mock', onRefresh }: LastSyncedProps) {
  const [timeAgo, setTimeAgo] = useState('')

  useEffect(() => {
    if (!timestamp) return
    const update = () => {
      const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000)
      if (diff < 60) setTimeAgo('Just now')
      else if (diff < 3600) setTimeAgo(`${Math.floor(diff / 60)}m ago`)
      else setTimeAgo(`${Math.floor(diff / 3600)}h ago`)
    }
    update()
    const id = setInterval(update, 30000)
    return () => clearInterval(id)
  }, [timestamp])

  const dotColor = source === 'salesforce' ? '#059669' : '#d97706'
  const labelColor = source === 'salesforce' ? '#059669' : '#d97706'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#94a3b8' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor, display: 'inline-block' }} />
        <span style={{ color: labelColor, fontSize: 11, fontWeight: 600 }}>
          {source === 'salesforce' ? 'Live Salesforce' : 'Mock Data'}
        </span>
      </div>
      {timestamp && <span> Last synced: {timeAgo}</span>}
      {onRefresh && (
        <button onClick={onRefresh} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2, display: 'flex', alignItems: 'center' }}>
          <RefreshCw size={12} />
        </button>
      )}
    </div>
  )
}

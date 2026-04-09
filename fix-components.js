const fs = require('fs');

// Fix LastSynced.tsx
fs.writeFileSync('components/shared/LastSynced.tsx', `'use client'
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
      else if (diff < 3600) setTimeAgo(\`\${Math.floor(diff / 60)}m ago\`)
      else setTimeAgo(\`\${Math.floor(diff / 3600)}h ago\`)
    }
    update()
    const id = setInterval(update, 30000)
    return () => clearInterval(id)
  }, [timestamp])

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#4a5568' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: source === 'salesforce' ? '#10b981' : '#f59e0b', display: 'inline-block' }} />
        <span style={{ color: source === 'salesforce' ? '#10b981' : '#f59e0b', fontSize: 11, fontWeight: 500 }}>
          {source === 'salesforce' ? 'Live Salesforce' : 'Mock Data'}
        </span>
      </div>
      {timestamp && <span> Last synced: {timeAgo}</span>}
      {onRefresh && (
        <button onClick={onRefresh} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4a5568', padding: 2, display: 'flex', alignItems: 'center' }}>
          <RefreshCw size={12} />
        </button>
      )}
    </div>
  )
}
`);
console.log('Fixed: LastSynced.tsx');

// Fix dashboard page - the fontSize issue
let dashboard = fs.readFileSync('app/dashboard/page.tsx', 'utf8');
dashboard = dashboard.replace("fontSize: 12' }", "fontSize: 12 }");
fs.writeFileSync('app/dashboard/page.tsx', dashboard);
console.log('Fixed: dashboard page.tsx');

console.log('All component files fixed!');

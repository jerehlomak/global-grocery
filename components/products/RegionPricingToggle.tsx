'use client'
import { useRegionStore } from '@/lib/store/regionStore'
import { REGIONS } from '@/types/product'

export default function RegionPricingToggle() {
  const { region, setRegion } = useRegionStore()
  return (
    <div style={{ display: 'flex', background: '#f1f4f9', border: '1px solid #e2e8f0', borderRadius: 12, padding: 4, gap: 4 }}>
      {REGIONS.map((r) => (
        <button key={r.id} onClick={() => setRegion(r.id)}
          style={{ borderRadius: 8, padding: '6px 14px', border: 'none', cursor: 'pointer', background: region === r.id ? '#4f46e5' : 'transparent', color: region === r.id ? 'white' : '#475569', fontSize: 13, fontWeight: region === r.id ? 600 : 400, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>{r.flag}</span><span>{r.label}</span><span style={{ fontSize: 11, opacity: 0.7 }}>({r.currencySymbol})</span>
        </button>
      ))}
    </div>
  )
}

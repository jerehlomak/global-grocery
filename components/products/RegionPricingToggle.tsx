'use client'
import { useRegionStore } from '@/lib/store/regionStore'
import { REGIONS } from '@/types/product'

export default function RegionPricingToggle() {
  const { region, setRegion } = useRegionStore()
  return (
    <>
      <style>{`
        .rpt-label { display: inline; }
        .rpt-currency { display: inline; font-size: 11px; opacity: 0.65; }
        @media (max-width: 480px) {
          .rpt-label { display: none; }
          .rpt-currency { font-size: 10px; }
          .rpt-btn { padding: 5px 8px !important; gap: 3px !important; }
        }
      `}</style>
      <div style={{ display: 'flex', background: '#f1f4f9', border: '1px solid #e2e8f0', borderRadius: 10, padding: 3, gap: 3, flexShrink: 0 }}>
        {REGIONS.map((r) => (
          <button key={r.id} onClick={() => setRegion(r.id)} className="rpt-btn"
            style={{ borderRadius: 7, padding: '5px 11px', border: 'none', cursor: 'pointer', background: region === r.id ? '#4f46e5' : 'transparent', color: region === r.id ? 'white' : '#475569', fontSize: 12, fontWeight: region === r.id ? 600 : 400, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
            <span>{r.flag}</span>
            <span className="rpt-label">{r.label}</span>
            <span className="rpt-currency">({r.currencySymbol})</span>
          </button>
        ))}
      </div>
    </>
  )
}

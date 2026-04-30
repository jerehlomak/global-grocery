'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Book, MessageSquare, FileText } from 'lucide-react'
import {
  fetchKnowledgeArticles,
  fetchFeaturedArticles,
  fetchKnowledgeCategories,
  type KnowledgeCategory,
} from '@/services/knowledgeService'
import type { SFKnowledgeArticle } from '@/types/salesforce'
import LastSynced from '@/components/shared/LastSynced'
import { SkeletonRow } from '@/components/shared/SkeletonLoader'
import CaseSupportForm from '@/components/cases/form'

export default function HelpPage() {
  const [articles, setArticles] = useState<SFKnowledgeArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [featured, setFeatured] = useState<SFKnowledgeArticle[]>([])
  const [featuredLoading, setFeaturedLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState<string>('All')
  const [lastSynced, setLastSynced] = useState<string>()
  const [categories, setCategories] = useState<KnowledgeCategory[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  // Load Salesforce data categories once on mount
  useEffect(() => {
    fetchKnowledgeCategories()
      .then(setCategories)
      .catch((err) => {
        console.error('Failed to load knowledge categories:', err)
        setCategories([])
      })
      .finally(() => setCategoriesLoading(false))
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      // When a non-All category is selected, pass its Salesforce API name (e.g. 'Pricing__c')
      const categoryParam = cat === 'All' ? undefined : cat
      const data = await fetchKnowledgeArticles(search || undefined, categoryParam)
      setArticles(data)
      setLastSynced(new Date().toISOString())
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [search, cat])

  useEffect(() => {
    fetchFeaturedArticles()
      .then(setFeatured)
      .catch(console.error)
      .finally(() => setFeaturedLoading(false))
  }, [])

  return (
    <div style={{ maxWidth: 1200, margin: '40px auto 100px', padding: '0 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#e0f2fe', borderRadius: 20, padding: '6px 16px', marginBottom: 24, border: '1px solid #bae6fd' }}>
          <MessageSquare size={14} color="#0284c7" />
          <span style={{ fontSize: 13, color: '#0284c7', fontWeight: 600 }}>Service Cloud Integrated</span>
        </motion.div>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 44, fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>How can we help?</h1>
        <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search knowledge base..."
            style={{ width: '100%', background: '#fff', border: '1px solid #cbd5e1', borderRadius: 30, padding: '20px 24px 20px 60px', color: '#0f172a', fontSize: 18, outline: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }} />
        </div>
      </div>

      <style>{`
        .help-main-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.5fr) minmax(320px, 1fr);
          gap: 40px;
          align-items: start;
        }
        @media (max-width: 1024px) {
          .help-main-grid { grid-template-columns: 1fr; }
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div className="help-main-grid">
        {/* Knowledge Articles Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 24, paddingTop: 24, borderTop: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Book size={24} color="#4f46e5" /> Knowledge Base
            </h2>
            <LastSynced timestamp={lastSynced} onRefresh={load} />
          </div>

          {/* Dynamic category filter tabs from Salesforce */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
            {/* Always show the "All" tab */}
            <button
              onClick={() => setCat('All')}
              style={{
                background: cat === 'All' ? '#4f46e5' : '#fff',
                border: '1px solid ' + (cat === 'All' ? '#4f46e5' : '#cbd5e1'),
                borderRadius: 20,
                padding: '6px 16px',
                color: cat === 'All' ? 'white' : '#475569',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: cat === 'All' ? 600 : 500,
                whiteSpace: 'nowrap',
              }}
            >
              All
            </button>

            {/* Skeleton placeholders while categories load */}
            {categoriesLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: 72 + (i % 3) * 16,
                      height: 32,
                      borderRadius: 20,
                      background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 1.4s infinite',
                    }}
                  />
                ))
              : categories.map((c, i) => (
                  <motion.button
                    key={c.name}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setCat(c.name)}
                    style={{
                      background: cat === c.name ? '#4f46e5' : '#fff',
                      border: '1px solid ' + (cat === c.name ? '#4f46e5' : '#cbd5e1'),
                      borderRadius: 20,
                      padding: '6px 16px',
                      color: cat === c.name ? 'white' : '#475569',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: cat === c.name ? 600 : 500,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {c.label}
                  </motion.button>
                ))}
          </div>

          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            {loading ? Array.from({ length: 5 }).map((_, i) => <div key={i} style={{ padding: '0 24px' }}><SkeletonRow /></div>) :
              articles.length === 0 ? <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>No articles found.</div> :
                articles.map((art, i) => (
                  <motion.a key={art.Id} href={`/help/${art.Id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                    style={{ display: 'flex', gap: 16, padding: 24, borderBottom: i < articles.length - 1 ? '1px solid #f1f5f9' : 'none', textDecoration: 'none', background: 'transparent', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8f9fc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ background: '#ede9fe', width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileText size={18} color="#4f46e5" />
                    </div>
                    <div>
                      <h3 style={{ color: '#0f172a', fontWeight: 600, fontSize: 16, marginBottom: 8 }}>{art.Title}</h3>
                      <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.5, marginBottom: 12 }}>{art.Summary}</p>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {art.Categories?.map(c => <span key={c} style={{ fontSize: 11, background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: 4 }}>{c}</span>)}
                      </div>
                    </div>
                  </motion.a>
                ))}
          </div>
        </div>

        {/* Web-to-Case Form */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 32, position: 'sticky', top: 100, boxShadow: '0 10px 40px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>Contact Support</h2>
            <p style={{ color: '#64748b', fontSize: 13 }}>Submit a case directly to Salesforce Service Cloud, or email us at <a href="mailto:globalgrocery247@gmail.com" style={{ color: '#4f46e5', textDecoration: 'none' }}>globalgrocery247@gmail.com</a>.</p>
          </div>
          <CaseSupportForm />
        </div>
      </div>
    </div>
  )
}

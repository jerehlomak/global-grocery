'use client'
import { motion } from 'framer-motion'
import { ArrowRight, Globe, ShieldCheck, Zap, TrendingUp, Package, Users, BarChart3, Rocket } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRegionStore } from '@/lib/store/regionStore'
import { fetchProducts, fetchFamilies } from '@/services/productService'
import type { Product } from '@/types/product'
import ProductCard from '@/components/products/ProductCard'
import { SkeletonCard } from '@/components/shared/SkeletonLoader'
import WebToLeadForm from '@/components/leads/form'
import CampaignSubscribeModal from '@/components/campaigns/CampaignSubscribeModal'

const STATS = [
  { label: 'Products', value: '12,000+', icon: Package },
  { label: 'Countries', value: '50+', icon: Globe },
  { label: 'Customers', value: '25K+', icon: Users },
  { label: 'Revenue', value: '$4.2M', icon: TrendingUp },
]

export default function HomePage() {
  const { region } = useRegionStore()
  const [featured, setFeatured] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [families, setFamilies] = useState<string[]>([])
  const [familiesLoading, setFamiliesLoading] = useState(true)
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [campaignsLoading, setCampaignsLoading] = useState(true)
  const [activeModal, setActiveModal] = useState<{ id: string, name: string } | null>(null)

  useEffect(() => {
    fetchFamilies()
      .then(fams => setFamilies(fams))
      .catch(console.error)
      .finally(() => setFamiliesLoading(false))

    // Fetch active campaigns for the public home page
    fetch('/api/campaigns')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setCampaigns(data.data)
        }
      })
      .catch(console.error)
      .finally(() => setCampaignsLoading(false))
  }, [])

  useEffect(() => {
    setLoading(true)
    fetchProducts(region).then(groupedObj => {
      const allP = Object.values(groupedObj).flat()
      setFeatured(allP.slice(0, 4))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [region])

  return (
    <div className='my-8'>
      {/*  HERO  */}
      <section style={{ padding: '4rem 0', position: 'relative', minHeight: '85vh', display: 'flex', alignItems: 'center', overflow: 'hidden', background: 'linear-gradient(135deg, #f8f9fc 0%, #f1f5f9 50%, #e2e8f0 100%)' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.3 }} />
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(79,70,229,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10, width: '100%' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} style={{ textAlign: 'center' }}>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#ede9fe', border: '1px solid #ddd6fe', borderRadius: 20, padding: '6px 16px', marginBottom: 32 }}>
              <Zap size={13} color="#4f46e5" />
              <span style={{ fontSize: 13, color: '#4f46e5', fontWeight: 600 }}>Powered by Salesforce</span>
            </motion.div>

            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: 24, color: '#0f172a' }}>
              The Future of{' '}
              <span style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Global Grocery
              </span>
              {' '}Commerce
            </h1>

            <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: '#475569', maxWidth: 640, margin: '0 auto 40px', lineHeight: 1.7 }}>
              Enterprise-grade grocery eCommerce with real-time regional pricing,
              Salesforce-driven sales flows, and a seamless B2B/B2C experience.
            </p>

            <div className="mobile-col mobile-w-full" style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#4f46e5', color: 'white', borderRadius: 12, padding: '14px 28px', textDecoration: 'none', fontWeight: 600, fontSize: 16, boxShadow: '0 4px 20px rgba(79,70,229,0.25)' }}>
                Explore Products <ArrowRight size={16} />
              </Link>
              <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 28px', textDecoration: 'none', fontWeight: 600, fontSize: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                Create Account
              </Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="mobile-grid-2 mobile-grid-gap-sm" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, maxWidth: 800, margin: '64px auto 0' }}>
            {STATS.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.1 }}
                style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid #e2e8f0', borderRadius: 12, padding: '20px 16px', textAlign: 'center', backdropFilter: 'blur(10px)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <stat.icon size={20} color="#4f46e5" style={{ margin: '0 auto 10px' }} />
                <div style={{ color: '#0f172a', fontWeight: 700, fontSize: 22, fontFamily: 'Outfit, sans-serif' }}>{stat.value}</div>
                <div style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/*  CATEGORIES  */}
      <section style={{ maxWidth: 1280, margin: '80px auto', padding: '0 24px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 32, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Shop by Category</h2>
          <p style={{ color: '#64748b', marginBottom: 40 }}>Sourced globally, priced for your region</p>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16 }}>
          {familiesLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ background: '#f1f5f9', borderRadius: 16, height: 100, animation: 'pulse 1.5s ease-in-out infinite' }} />
              ))
            : families.map((name, i) => (
                <motion.div key={name} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }} whileHover={{ scale: 1.05 }}>
                  <Link href={'/products?family=' + encodeURIComponent(name)} style={{ textDecoration: 'none' }}>
                    <div
                      style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '24px 16px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(79,70,229,0.12)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)' }}
                    >
                      <p style={{ color: '#1e293b', fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>{name}</p>
                    </div>
                  </Link>
                </motion.div>
              ))
          }
        </div>
      </section>

      {/*  FEATURED PRODUCTS  */}
      <section style={{ maxWidth: 1280, margin: '80px auto', padding: '0 24px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="mobile-col mobile-stack" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', marginBottom: 40 }}>
            <div>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 32, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Featured Products</h2>
              <p style={{ color: '#64748b' }}>Live data from Salesforce • Current region pricing</p>
            </div>
            <Link href="/products" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4f46e5', textDecoration: 'none', fontWeight: 600, fontSize: 15 }}>
              View all <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
          {loading ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />) : featured.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>

      {/*  ACTIVE CAMPAIGNS  */}
      <section style={{ maxWidth: 1280, margin: '80px auto', padding: '0 24px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="mobile-col mobile-stack" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', marginBottom: 40 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 20, padding: '4px 12px', marginBottom: 12 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live Campaigns</span>
              </div>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 32, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Connect & Subscribe</h2>
              <p style={{ color: '#64748b' }}>Join our upcoming events to scale your regional distribution</p>
            </div>
          </div>
        </motion.div>
        
        {campaignsLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : campaigns.length === 0 ? (
          <div style={{ background: '#f8fafc', borderRadius: 16, padding: 40, textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <p style={{ color: '#64748b', fontSize: 16 }}>No active campaigns available at this time. Check back soon!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {campaigns.map((camp, i) => (
              <motion.div key={camp.Id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #ec4899, #8b5cf6)' }} />
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 12, lineHeight: 1.3 }}>{camp.Name}</h3>
                <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, flexGrow: 1, marginBottom: 24 }}>
                  {camp.Description || 'Join this exclusive campaign to receive insights tailored to your industry operations.'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>
                    {camp.StartDate ? new Date(camp.StartDate).toLocaleDateString() : 'Ongoing'}
                  </span>
                  <button onClick={() => setActiveModal({ id: camp.Id, name: camp.Name })}
                    style={{ padding: '8px 16px', background: '#f1f5f9', color: '#0f172a', fontWeight: 600, fontSize: 14, border: 'none', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#0f172a'; e.currentTarget.style.color = '#fff' }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0f172a' }}
                  >
                    Subscribe
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/*  SF CLOUD FEATURES  */}
      <section style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 36, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>
              Built on Salesforce
            </h2>
            <p style={{ color: '#64748b', maxWidth: 500, margin: '0 auto', fontSize: 16 }}>Every interaction powers the world\'s #1 CRM platform</p>
          </motion.div>
          <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
            {[
              { icon: TrendingUp, title: 'Sales Cloud', desc: 'Lead-to-Order lifecycle, Sales Path, Quotes, Opportunities & Contracts.', color: '#4f46e5', bg: '#ede9fe' },
              { icon: ShieldCheck, title: 'Service Cloud', desc: 'Web-to-Case, Email-to-Case, and Embedded Service Chat for enterprise support.', color: '#059669', bg: '#d1fae5' },
              { icon: Globe, title: 'Regional Pricing', desc: 'Dynamic PriceBook2 per region. Africa, Europe & North America pricing.', color: '#d97706', bg: '#fef3c7' },
              { icon: BarChart3, title: 'Campaign Analytics', desc: 'Lead source tracking, campaign ROI dashboards, and conversion funnels.', color: '#7c3aed', bg: '#f3e8ff' },
            ].map((feat, i) => (
              <motion.div key={feat.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                style={{ background: '#f8f9fc', border: '1px solid #e2e8f0', borderRadius: 16, padding: 32, transition: 'transform 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ width: 48, height: 48, background: feat.bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <feat.icon size={24} color={feat.color} />
                </div>
                <h3 style={{ color: '#0f172a', fontWeight: 700, fontSize: 18, marginBottom: 10 }}>{feat.title}</h3>
                <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.6 }}>{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/*  WEB-TO-LEAD  */}
      <section style={{
        background: 'linear-gradient(135deg, #0f0c29 0%, #1e1b4b 50%, #0f172a 100%)',
        padding: '100px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* decorative blobs */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: 400, height: 400, background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: 320, height: 320, background: 'radial-gradient(circle, rgba(79,70,229,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="flex flex-col md:flex-row max-w-[1200px] mx-auto gap-[72px] items-center w-full">

          {/* Left copy */}
          <motion.div className="w-full md:w-1/2" initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: 20, padding: '6px 16px', marginBottom: 28 }}>
              <Rocket size={13} color="#a78bfa" />
              <span style={{ fontSize: 13, color: '#a78bfa', fontWeight: 600 }}>Sales Cloud Pipeline</span>
            </div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: 20 }}>
              Become a{' '}
              <span style={{ background: 'linear-gradient(135deg, #a78bfa, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Partner</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, lineHeight: 1.8, maxWidth: 460, marginBottom: 36 }}>
              Get access to exclusive bulk pricing, regional distribution rights, and a dedicated account manager — all powered by our Salesforce Sales Cloud.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { emoji: '⚡', text: 'Real-time lead routing to regional reps' },
                { emoji: '📊', text: 'Full Sales Cloud opportunity tracking' },
                { emoji: '🌍', text: 'Access to all 50+ regional price books' },
              ].map(item => (
                <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 20 }}>{item.emoji}</span>
                  <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right form card */}
          <motion.div
            className="w-full md:w-1/2"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 20,
              padding: 36,
              boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
            }}
          >
            <div style={{ marginBottom: 28 }}>
              <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 20, marginBottom: 6 }}>Get in Touch</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Fill out the form and we'll connect you with a sales representative.</p>
            </div>
            <WebToLeadForm />
          </motion.div>

        </div>
      </section>
      

      <CampaignSubscribeModal 
        isOpen={activeModal !== null} 
        onClose={() => setActiveModal(null)} 
        campaignId={activeModal?.id || ''} 
        campaignName={activeModal?.name || ''} 
      />
    </div>
  )
}

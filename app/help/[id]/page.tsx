'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, FileText, Share2, ThumbsUp, ThumbsDown } from 'lucide-react'
import LiveChatPlaceholder from '@/components/shared/LiveChatPlaceholder'

export default function ArticleDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    fetch(`/api/knowledge/${id}`)
      .then(res => res.json())
      .then(json => {
        if (json.success) setArticle(json.data)
        else setError(json.error || 'Failed to load article')
      })
      .catch(err => {
        console.error(err)
        setError('Network error loading article')
      })
      .finally(() => setLoading(false))
  }, [id])

  // Salesforce rich text fields vary, but common ones are:
  // Body__c, Details__c, Answer__c, Information__c.
  // We'll scan the keys to find the first likely rich text field if it exists,
  // falling back to Summary.
  const findBodyContent = (acc: any) => {
    if (!acc) return ''
    // Ignore question and answer here so they don't double render if we fall back
    const keys = Object.keys(acc).filter(k => !k.toLowerCase().includes('question') && !k.toLowerCase().includes('answer'))
    const richTextKey = keys.find(k => k.toLowerCase().includes('body') || k.toLowerCase().includes('details'))

    if (richTextKey && acc[richTextKey]) return acc[richTextKey]
    return `<p style="font-size: 16px; line-height: 1.6; color: #475569;">${acc.Summary || 'No detailed content available for this article.'}</p>`
  }

  // Explicitly hunt for Question and Answer fields for FAQ-style articles
  const getQuestionAndAnswer = (acc: any) => {
    if (!acc) return null
    const keys = Object.keys(acc)
    const qKey = keys.find(k => k.toLowerCase() === 'question__c' || k.toLowerCase() === 'question')
    const aKey = keys.find(k => k.toLowerCase() === 'answer__c' || k.toLowerCase() === 'answer')

    if (qKey && aKey && acc[qKey] && acc[aKey]) {
      return { question: acc[qKey], answer: acc[aKey] }
    }
    return null
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>

      <main style={{ flex: 1, padding: '40px 24px', maxWidth: 800, margin: '0 auto', width: '100%' }}>
        <button
          onClick={() => router.push('/help')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: '#64748b', fontSize: 15, fontWeight: 600, cursor: 'pointer', padding: 0, marginBottom: 32, transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#4f46e5'}
          onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
        >
          <ArrowLeft size={18} />
          Back to Help Center
        </button>

        {loading ? (
          <div style={{ padding: 40, background: '#fff', borderRadius: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ height: 40, width: '80%', background: '#e2e8f0', borderRadius: 8, marginBottom: 16, animation: 'pulse 1.5s infinite' }} />
            <div style={{ height: 20, width: '40%', background: '#e2e8f0', borderRadius: 8, marginBottom: 40, animation: 'pulse 1.5s infinite' }} />
            <div style={{ height: 16, width: '100%', background: '#e2e8f0', borderRadius: 8, marginBottom: 12, animation: 'pulse 1.5s infinite' }} />
            <div style={{ height: 16, width: '90%', background: '#e2e8f0', borderRadius: 8, marginBottom: 12, animation: 'pulse 1.5s infinite' }} />
            <div style={{ height: 16, width: '95%', background: '#e2e8f0', borderRadius: 8, animation: 'pulse 1.5s infinite' }} />
          </div>
        ) : error ? (
          <div style={{ padding: 40, background: '#fff', borderRadius: 24, textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <FileText size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: 24, color: '#0f172a', fontWeight: 700, marginBottom: 8 }}>Article Not Found</h2>
            <p style={{ color: '#64748b' }}>{error}</p>
          </div>
        ) : article ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ background: '#fff', borderRadius: 24, padding: '40px 28px', boxShadow: '0 4px 24px rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden' }}
          >
            {/* Top decorative gradient bar */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: 'linear-gradient(90deg, #4f46e5, #0ea5e9)' }} />

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <span style={{ display: 'inline-block', padding: '6px 12px', background: '#e0e7ff', color: '#4f46e5', borderRadius: 20, fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {article.ArticleType || 'Knowledge Base'}
              </span>

              {(article.FirstPublishedDate || article.CreatedDate) && (
                <span style={{ fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={14} color="#94a3b8" />
                  Published {new Date(article.FirstPublishedDate || article.CreatedDate).toLocaleDateString()}
                </span>
              )}

              {(article.CreatedByName) && (
                <span style={{ fontSize: 13, color: '#64748b' }}>
                  By <strong style={{ color: '#0f172a' }}>{article.CreatedByName}</strong>
                </span>
              )}
            </div>

            <h1 style={{ fontSize: 36, fontWeight: 800, color: '#0f172a', lineHeight: 1.2, marginBottom: 32, fontFamily: 'Outfit, sans-serif' }}>
              {article.Title}
            </h1>

            {/* Article Content */}
            {(() => {
              const qaFields = getQuestionAndAnswer(article)
              if (qaFields) {
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 32, fontSize: 16, lineHeight: 1.8, color: '#334155' }}>
                    <div style={{ background: '#f8fafc', padding: 24, borderRadius: 16, borderLeft: '4px solid #4f46e5' }}>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ background: '#4f46e5', color: '#fff', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>Q</div>
                        Question
                      </h3>
                      <div dangerouslySetInnerHTML={{ __html: qaFields.question }} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ background: '#0ea5e9', color: '#fff', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>A</div>
                        Answer
                      </h3>
                      <div dangerouslySetInnerHTML={{ __html: qaFields.answer }} />
                    </div>
                  </div>
                )
              }
              return (
                <div
                  className="article-content"
                  style={{ fontSize: 16, lineHeight: 1.8, color: '#334155' }}
                  dangerouslySetInnerHTML={{ __html: findBodyContent(article) }}
                />
              )
            })()}

            <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '40px 0 24px' }} />

            {/* Feedback Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 12 }}>Was this article helpful?</p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s', color: '#475569', fontWeight: 500 }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#cbd5e1' }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0' }}>
                    <ThumbsUp size={16} /> Yes
                  </button>
                  <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s', color: '#475569', fontWeight: 500 }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#cbd5e1' }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0' }}>
                    <ThumbsDown size={16} /> No
                  </button>
                </div>
              </div>

              <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: '50%', background: '#f1f5f9', border: 'none', color: '#64748b', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b' }}
                title="Share Article">
                <Share2 size={18} />
              </button>
            </div>
          </motion.div>
        ) : null}
      </main>

      <LiveChatPlaceholder />
    </div>
  )
}

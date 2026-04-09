import { type NextRequest } from 'next/server'
import { apiSuccess, apiError, isMockMode } from '@/lib/api/helpers'
import { MOCK_KNOWLEDGE_ARTICLES } from '@/lib/salesforce/mock-data'
import { sfQuery } from '@/lib/salesforce/client'
import type { SFKnowledgeArticle } from '@/types/salesforce'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const search = searchParams.get('search')
    const category = searchParams.get('category')

    if (isMockMode()) {
      let articles = MOCK_KNOWLEDGE_ARTICLES
      if (search) {
        const q = search.toLowerCase()
        articles = articles.filter((a) => a.Title.toLowerCase().includes(q) || (a.Summary && a.Summary.toLowerCase().includes(q)))
      }
      if (category) articles = articles.filter((a) => a.Categories?.includes(category))
      return apiSuccess(articles, { total: articles.length, source: 'mock' })
    }

    // LIVE SF: Query KnowledgeArticleVersion (requires Knowledge feature enabled)
    const soql = 'SELECT Id, Title, Summary, UrlName, ArticleType, IsVisibleInPkb, CreatedDate FROM KnowledgeArticleVersion WHERE PublishStatus = \'Online\' AND Language = \'en_US\' ORDER BY Title LIMIT 100'
    const result = await sfQuery<SFKnowledgeArticle>(soql)
    return apiSuccess(result.records, { total: result.totalSize, source: 'salesforce' })
  } catch (err) {
    console.error('[/api/knowledge]', err)
    return apiError('Failed to fetch knowledge articles', 500)
  }
}

import { type NextRequest } from 'next/server'
import { apiSuccess, apiError, isMockMode } from '@/lib/api/helpers'
import { MOCK_KNOWLEDGE_ARTICLES } from '@/lib/salesforce/mock-data'
import { sfQuery } from '@/lib/salesforce/client'
import type { SFKnowledgeArticle } from '@/types/salesforce'

// Define Data Category mappings. Update these API names to match your Salesforce Org's exact configuration.
const DATA_CATEGORY_GROUP = 'JayTech_Group__c' // Pulled from your live Salesforce org
const FEATURED_CATEGORY_NAME = 'Featured__c'   // e.g. 'Featured_Articles__c'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const isFeatured = searchParams.get('featured') === 'true'

    if (isMockMode()) {
      let articles = MOCK_KNOWLEDGE_ARTICLES
      if (isFeatured) {
        // Mock fallback for featured: return first 3 articles
        return apiSuccess(articles.slice(0, 3), { total: 3, source: 'mock' })
      }
      if (search) {
        const q = search.toLowerCase()
        articles = articles.filter((a) => a.Title.toLowerCase().includes(q) || (a.Summary && a.Summary.toLowerCase().includes(q)))
      }
      if (category && category !== 'All') articles = articles.filter((a) => a.Categories?.includes(category))
      return apiSuccess(articles, { total: articles.length, source: 'mock' })
    }

    // LIVE SF: Query KnowledgeArticleVersion
    let soql = `SELECT Id, Title, Summary, UrlName FROM KnowledgeArticleVersion WHERE PublishStatus = 'Online' AND Language = 'en_US'`
    
    if (search) {
      // Basic SOQL string search (Salesforce SOSL is better for real deployed search)
      soql += ` AND Title LIKE '%${search.replace(/'/g, "\\'")}%'`
    }

    // WITH DATA CATEGORY must follow the WHERE clause before ORDER BY
    if (isFeatured) {
      soql += ` WITH DATA CATEGORY ${DATA_CATEGORY_GROUP} AT (${FEATURED_CATEGORY_NAME})`
    } else if (category && category !== 'All') {
      // Attempt to sanitize frontend category string to a valid API Name (e.g., 'Pricing' -> 'Pricing__c')
      const categoryApiName = category.replace(/[^a-zA-Z0-9]/g, '_') + '__c'
      soql += ` WITH DATA CATEGORY ${DATA_CATEGORY_GROUP} AT (${categoryApiName})`
    }

    soql += ` ORDER BY Title LIMIT ${isFeatured ? 4 : 100}`

    const result = await sfQuery<SFKnowledgeArticle>(soql)
    console.log('--- FETCHED KNOWLEDGE ARTICLES ---')
    console.log(JSON.stringify(result.records, null, 2))
    return apiSuccess(result.records, { total: result.totalSize, source: 'salesforce' })
  } catch (err) {
    console.error('[/api/knowledge]', err)
    return apiError('Failed to fetch knowledge articles', 500)
  }
}

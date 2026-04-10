import { type NextRequest, NextResponse } from 'next/server'
import { apiSuccess, apiError, isMockMode } from '@/lib/api/helpers'
import { sfFetch, sfQuery } from '@/lib/salesforce/client'
import { MOCK_KNOWLEDGE_ARTICLES } from '@/lib/salesforce/mock-data'

export async function GET(request: NextRequest, context: { params: any }) {
  try {
    // Resolve params securely allowing compatibility with Next.js 15 async params structure
    const params = await context.params;
    const id = params.id;
    if (isMockMode()) {
      const article = MOCK_KNOWLEDGE_ARTICLES.find(a => a.Id === params.id)
      if (!article) return apiError('Article not found', 404)
      return apiSuccess({
        ...article,
        // Mocking an extended body field that would normally exist in Salesforce
        Body__c: `<p>This is the detailed content for <b>${article.Title}</b>.</p><p>It provides comprehensive guidance to resolve your issue. Follow these steps:</p><ul><li>Step 1: Check your configuration.</li><li>Step 2: Restart the service.</li><li>Step 3: Contact support if the issue persists.</li></ul><p>For more information, please review our standard operation procedures.</p>`
      }, { source: 'mock' })
    }

    // LIVE SF: Fetch the complete record dynamically using sfQuery to bypass REST routing Version 404s
    const query = `SELECT Id, Title, Summary, Question__c, Answer__c, CreatedById, FirstPublishedDate, CreatedDate FROM Knowledge__kav WHERE Id = '${params.id}' LIMIT 1`
    const result = await sfQuery<any>(query)
    
    if (result.totalSize === 0) {
      return apiError('Article not found', 404)
    }

    const data = result.records[0]
    
    // Explicitly grab the CreatedByName by running a lightweight user query if CreatedById exists
    if (data.CreatedById) {
      try {
         const userQuery = await sfQuery<any>(`SELECT Name FROM User WHERE Id = '${data.CreatedById}' LIMIT 1`)
         if (userQuery.totalSize > 0) {
           data.CreatedByName = userQuery.records[0].Name
         }
      } catch (e) { console.error('Failed to resolve author name', e) }
    }
    
    return apiSuccess(data, { source: 'salesforce' })
  } catch (err: any) {
    console.error('[/api/knowledge/id] FATAL ERROR:', err)
    console.log('Error Message:', err.message, 'Code:', err.errorCode)
    if (err.message && err.message.includes('NOT_FOUND')) {
      return apiError('Article not found', 404)
    }
    return apiError('Failed to fetch knowledge article details: ' + (err.message || JSON.stringify(err)), 500)
  }
}

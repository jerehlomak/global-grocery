import { type NextRequest } from 'next/server'
import { apiSuccess, apiError, isMockMode } from '@/lib/api/helpers'
import { MOCK_KNOWLEDGE_CATEGORIES } from '@/lib/salesforce/mock-data'
import { sfFetch } from '@/lib/salesforce/client'

const DATA_CATEGORY_GROUP = 'Global_Grocery_Support_Topics' // Verified from live Salesforce org

export interface KnowledgeCategory {
  label: string
  name: string  // Salesforce API name (e.g. "Pricing__c")
}

export async function GET(_request: NextRequest) {
  if (isMockMode()) {
    return apiSuccess(MOCK_KNOWLEDGE_CATEGORIES, { source: 'mock' })
  }

  try {
    // Use the Support REST API to get the data category group tree
    const res = await sfFetch(
      `/services/data/v62.0/support/dataCategoryGroups?sObjectName=KnowledgeArticleVersion&topCategoriesOnly=false`
    )

    // Find our specific category group
    const group = res?.categoryGroups?.find(
      (g: any) => g.name === DATA_CATEGORY_GROUP
    )

    if (!group) {
      // Group not found — return empty so the UI can degrade gracefully
      console.warn(`[/api/knowledge/categories] Category group "${DATA_CATEGORY_GROUP}" not found in org.`)
      return apiSuccess([] as KnowledgeCategory[], { source: 'salesforce' })
    }

    // SF returns categories as children of a root 'All' node inside topCategories.
    // We skip the root 'All' node and expose its direct children as the usable categories.
    const rootNode = group.topCategories?.[0]
    const rawCategories: any[] = rootNode?.childCategories ?? group.topCategories ?? []

    const categories: KnowledgeCategory[] = rawCategories.map((cat: any) => ({
      label: cat.label,
      name: cat.name,
    }))

    return apiSuccess(categories, { total: categories.length, source: 'salesforce' })
  } catch (err) {
    console.error('[/api/knowledge/categories]', err)
    return apiError('Failed to fetch knowledge categories', 500)
  }
}

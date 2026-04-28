/**
 * Run: npx tsx -e "require('dotenv').config({ path: '.env.local' })" debug-order.ts
 * Or set env vars manually before running
 */
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { sfQuery } from './lib/salesforce/client'

async function debug() {
  try {
    // 1. Check the most recent Orders
    console.log('\n=== RECENT ORDERS ===')
    const orders = await sfQuery<any>(
      "SELECT Id, Status, Pricebook2Id, ContractId, OpportunityId, CreatedDate FROM Order ORDER BY CreatedDate DESC LIMIT 5"
    )
    orders.records.forEach(o => console.log(JSON.stringify(o)))

    // 2. For the most recent order, check if it has OrderItems
    if (orders.records.length > 0) {
      const latestOrder = orders.records[0]
      console.log('\n=== ORDER ITEMS FOR LATEST ORDER:', latestOrder.Id, '===')
      const items = await sfQuery<any>(
        `SELECT Id, PricebookEntryId, Quantity, UnitPrice FROM OrderItem WHERE OrderId = '${latestOrder.Id}'`
      )
      console.log('OrderItems count:', items.totalSize)
      items.records.forEach(i => console.log(JSON.stringify(i)))
    }

    // 3. Check recent Quotes and their line items
    console.log('\n=== RECENT QUOTES ===')
    const quotes = await sfQuery<any>(
      "SELECT Id, Name, Status, Pricebook2Id, OpportunityId FROM Quote ORDER BY CreatedDate DESC LIMIT 5"
    )
    quotes.records.forEach(q => console.log(JSON.stringify(q)))

    // 4. For each quote, check line items
    for (const q of quotes.records) {
      const qli = await sfQuery<any>(
        `SELECT Id, PricebookEntryId, Product2Id, Quantity, UnitPrice FROM QuoteLineItem WHERE QuoteId = '${q.Id}'`
      )
      console.log(`\nQuote ${q.Id} (${q.Name}) has ${qli.totalSize} QuoteLineItems`)
      qli.records.forEach(i => console.log('  ', JSON.stringify(i)))
    }

  } catch (e: any) {
    console.error('Error:', e.message || e)
  }
}

debug()

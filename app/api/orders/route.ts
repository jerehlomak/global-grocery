import { type NextRequest } from 'next/server'
import { apiSuccess, apiError, isMockMode } from '@/lib/api/helpers'
import { MOCK_ORDERS } from '@/lib/salesforce/mock-data'
import { sfQuery, sfCreate, sfUpdate } from '@/lib/salesforce/client'
import type { SFOrder } from '@/types/salesforce'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const accountId = searchParams.get('accountId')

    if (isMockMode()) {
      let orders = MOCK_ORDERS
      if (accountId) orders = orders.filter((o) => o.AccountId === accountId)
      return apiSuccess(orders, { total: orders.length, source: 'mock' })
    }

    let soql = 'SELECT Id, AccountId, OpportunityId, ContractId, Status, EffectiveDate, CreatedDate FROM Order'
    if (accountId) soql += ` WHERE AccountId = '${accountId}'`
    soql += ' ORDER BY CreatedDate DESC LIMIT 100'

    const result = await sfQuery<SFOrder>(soql)
    return apiSuccess(result.records, { total: result.totalSize, source: 'salesforce' })
  } catch (err: any) { 
    console.error('[GET /api/orders] Error:', err.message || err)
    return apiError('Failed to fetch orders: ' + (err.message || 'Unknown error'), 500) 
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { accountId, effectiveDate, status = 'Draft', description, opportunityId, contractId, quoteId } = body
    if (!effectiveDate) return apiError('effectiveDate is required')
    if (!accountId) return apiError('accountId is required')

    if (isMockMode()) {
      const order: Partial<SFOrder> = {
        Id: '801' + Date.now(), AccountId: accountId, OpportunityId: opportunityId || '006' + Date.now(),
        ContractId: contractId || '800' + Date.now(),
        Status: status, EffectiveDate: effectiveDate, Description: description,
        CreatedDate: new Date().toISOString(),
      }
      return apiSuccess(order, { source: 'mock' })
    }

    // ── 1. Resolve Opportunity ──────────────────────────────────────────────
    let finalOppId = opportunityId;
    if (!finalOppId) {
      const oppResult = await sfCreate('Opportunity', {
        Name: `New Order Pipeline - ${new Date().toLocaleDateString()}`,
        AccountId: accountId,
        StageName: 'Qualification',
        CloseDate: effectiveDate
      })
      finalOppId = oppResult.id;
    }

    // ── 2. Collect line items from Quote → then Opportunity as fallback ─────
    let pricebook2Id: string | null = null;
    let lineItemsToInsert: any[] = [];
    
    if (quoteId) {
      try {
        const quoteResult = await sfQuery<any>(`SELECT Pricebook2Id FROM Quote WHERE Id = '${quoteId}' LIMIT 1`);
        if (quoteResult.records.length > 0) pricebook2Id = quoteResult.records[0].Pricebook2Id;

        const qliResult = await sfQuery<any>(`SELECT PricebookEntryId, Quantity, UnitPrice, Description FROM QuoteLineItem WHERE QuoteId = '${quoteId}'`);
        lineItemsToInsert = qliResult.records;
        console.log('[/api/orders] QuoteLineItems found:', lineItemsToInsert.length);
      } catch (e: any) {
        console.error('[/api/orders] Error fetching QuoteLineItems:', e.message);
      }
    }

    if (lineItemsToInsert.length === 0 && finalOppId) {
      try {
        if (!pricebook2Id) {
          const oppPB = await sfQuery<any>(`SELECT Pricebook2Id FROM Opportunity WHERE Id = '${finalOppId}' LIMIT 1`);
          if (oppPB.records.length > 0) pricebook2Id = oppPB.records[0].Pricebook2Id;
        }
        const oliResult = await sfQuery<any>(`SELECT PricebookEntryId, Quantity, UnitPrice, Description FROM OpportunityLineItem WHERE OpportunityId = '${finalOppId}'`);
        lineItemsToInsert = oliResult.records;
        console.log('[/api/orders] OpportunityLineItems found:', lineItemsToInsert.length);
      } catch (e: any) {
        console.error('[/api/orders] Error fetching OpportunityLineItems:', e.message);
      }
    }

    // ── 3. Resolve Currency from the first PricebookEntry ──────────────────
    // This ensures the Order currency always matches the line item currency.
    let currencyIsoCode: string | null = null;
    const firstPbeId = lineItemsToInsert.find(i => i.PricebookEntryId)?.PricebookEntryId;
    if (firstPbeId) {
      try {
        const pbeResult = await sfQuery<any>(`SELECT CurrencyIsoCode FROM PricebookEntry WHERE Id = '${firstPbeId}' LIMIT 1`);
        if (pbeResult.records.length > 0) {
          currencyIsoCode = pbeResult.records[0].CurrencyIsoCode;
          console.log('[/api/orders] PricebookEntry CurrencyIsoCode:', currencyIsoCode);
        }
      } catch (e: any) {
        console.warn('[/api/orders] Could not fetch PricebookEntry currency (single-currency org):', e.message);
      }
    }

    // ── 4. Create Contract and link to Order ──────────────────────────────
    // A Contract is required for Order activation in this org.
    // We create a Draft contract here; the agent manually activates it in Salesforce
    // before activating the Order.
    let resolvedContractId: string | null = contractId || null;
    if (!resolvedContractId) {
      try {
        // First check if there's an existing Activated contract for this account
        const existingContract = await sfQuery<any>(
          `SELECT Id FROM Contract WHERE AccountId = '${accountId}' AND Status = 'Activated' ORDER BY CreatedDate DESC LIMIT 1`
        );
        if (existingContract.records.length > 0) {
          resolvedContractId = existingContract.records[0].Id;
          console.log('[/api/orders] Reusing existing Activated Contract:', resolvedContractId);
        } else {
          // No activated contract — create a new Draft one
          const contractResult = await sfCreate('Contract', {
            AccountId: accountId,
            StartDate: effectiveDate,
            ContractTerm: 12,
            Status: 'Draft'
          });
          resolvedContractId = contractResult.id;
          console.log('[/api/orders] Created new Draft Contract:', resolvedContractId);
        }
      } catch (e: any) {
        console.error('[/api/orders] Could not create/find Contract:', e.message);
      }
    }

    // ── 5. Build and create the Order ──────────────────────────────────────
    const orderPayload: any = { 
      AccountId: accountId, 
      OpportunityId: finalOppId,
      Status: status, 
      EffectiveDate: effectiveDate, 
      Description: description 
    };
    if (resolvedContractId) orderPayload.ContractId = resolvedContractId;
    if (pricebook2Id) orderPayload.Pricebook2Id = pricebook2Id;
    if (currencyIsoCode) orderPayload.CurrencyIsoCode = currencyIsoCode;

    console.log('[/api/orders] Creating Order:', JSON.stringify(orderPayload));
    const result = await sfCreate('Order', orderPayload);
    console.log('[/api/orders] Order created:', result.id, 'success:', result.success);

    // ── 6. Insert OrderItems ───────────────────────────────────────────────
    if (result.success && lineItemsToInsert.length > 0) {
      console.log('[/api/orders] Inserting', lineItemsToInsert.length, 'OrderItems...');
      for (const item of lineItemsToInsert) {
        if (!item.PricebookEntryId) {
          console.warn('[/api/orders] Skipping item - no PricebookEntryId');
          continue;
        }
        try {
          // Do NOT set CurrencyIsoCode on OrderItem — it inherits from the parent Order automatically.
          const oiPayload: any = {
            OrderId: result.id,
            PricebookEntryId: item.PricebookEntryId,
            Quantity: Number(item.Quantity),
            UnitPrice: Number(item.UnitPrice)
          };
          if (item.Description) oiPayload.Description = item.Description;

          const oiRes = await sfCreate('OrderItem', oiPayload);
          console.log('[/api/orders] OrderItem created:', oiRes.id, 'success:', oiRes.success);
          if (!oiRes.success) console.error('[/api/orders] OrderItem failed:', oiRes);
        } catch (err: any) {
          console.error('[/api/orders] OrderItem error:', err.message);
        }
      }
    } else {
      console.warn('[/api/orders] No OrderItems to insert — lineItems:', lineItemsToInsert.length, 'order success:', result.success);
    }
    
    return apiSuccess({ id: result.id, opportunityId: finalOppId, contractId: resolvedContractId, success: result.success }, { source: 'salesforce' })
  } catch (err: any) { 
    console.error('[/api/orders] CREATE error:', err)
    return apiError('Failed to create order and opportunity: ' + (err.message || 'Unknown error'), 500) 
  }
}

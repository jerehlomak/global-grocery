import { sfQuery, sfCreate } from './lib/salesforce/client';

async function run() {
  try {
     // Get the most recent Order
     const orderRes = await sfQuery<any>("SELECT Id, Pricebook2Id FROM Order ORDER BY CreatedDate DESC LIMIT 1");
     if (orderRes.records.length === 0) {
         console.log("No orders found");
         return;
     }
     const order = orderRes.records[0];
     console.log('Most recent Order ID:', order.Id, 'Pricebook2Id:', order.Pricebook2Id);

     // Let's get the most recent Quote with Line Items
     const quoteResult = await sfQuery<any>(`
        SELECT Id, Pricebook2Id, 
        (SELECT PricebookEntryId, Product2Id, Quantity, UnitPrice FROM QuoteLineItems) 
        FROM Quote 
        WHERE Pricebook2Id != null 
        ORDER BY CreatedDate DESC
        LIMIT 1
     `);

     if (quoteResult.records.length === 0) {
        console.log("No Quote found with Pricebook2Id");
        return;
     }
     
     const quote = quoteResult.records[0];
     console.log('Found Quote:', quote.Id, 'Pricebook2Id:', quote.Pricebook2Id);
     
     if (quote.QuoteLineItems && quote.QuoteLineItems.records.length > 0) {
         const item = quote.QuoteLineItems.records[0];
         console.log('Attempting to create OrderItem with:', {
             OrderId: order.Id,
             PricebookEntryId: item.PricebookEntryId,
             Quantity: item.Quantity,
             UnitPrice: item.UnitPrice
         });
         
         const oiRes = await sfCreate('OrderItem', {
             OrderId: order.Id,
             PricebookEntryId: item.PricebookEntryId,
             Quantity: Number(item.Quantity),
             UnitPrice: Number(item.UnitPrice)
         });
         console.log('OrderItem creation result:', oiRes);
     } else {
         console.log('No QuoteLineItems found on quote', quote.Id);
     }

  } catch(e:any) { 
      console.error('Full Error:', e.response?.data || e.message || e);
  }
}
run();

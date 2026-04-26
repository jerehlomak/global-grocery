import { sfQuery } from './lib/salesforce/client';

async function test() {
  try {
    const res = await sfQuery("SELECT Id, Name, QuoteId, Document FROM QuoteDocument LIMIT 10");
    console.log(JSON.stringify(res, null, 2));
  } catch (e) {
    console.error(e);
  }
}

test();

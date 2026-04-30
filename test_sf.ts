import { config } from 'dotenv';
config({ path: '.env.local' });
import { sfFetch } from './lib/salesforce/client';

async function test() {
  try {
    const describe = await sfFetch('/services/data/v60.0/sobjects/Account/describe');
    const fields = describe.fields.filter((f: any) => f.name.toLowerCase().includes('support') || f.label.toLowerCase().includes('support'));
    console.log(JSON.stringify(fields, null, 2));
  } catch (err) {
    console.error(err);
  }
}

test();

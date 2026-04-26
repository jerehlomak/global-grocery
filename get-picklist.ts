import { config } from 'dotenv';
config({ path: '.env.local' });
import { sfGetPicklistValues } from './lib/salesforce/client';

async function main() {
  try {
    const res = await sfGetPicklistValues('Lead', 'Region__c');
    console.log(JSON.stringify(res.fields.find((f: any) => f.name === 'Region__c').picklistValues, null, 2));
  } catch (e) {
    console.error(e);
  }
}
main();

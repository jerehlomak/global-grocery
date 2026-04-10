import { sfFetch } from './lib/salesforce/client';

async function fetchAccountDescribe() {
  try {
    const describe = await sfFetch('/services/data/v62.0/sobjects/Account/describe');
    const fields = describe.fields;
    
    console.log(`Total Account fields: ${fields.length}`);
    
    const requiredFields = fields.filter((f: any) => !f.nillable && f.createable && !f.defaultedOnCreate);
    console.log('\n--- REQUIRED FIELDS (MUST BE PROVIDED ON CREATE) ---');
    requiredFields.forEach((f: any) => {
      console.log(`Name: ${f.name}, Type: ${f.type}, Label: ${f.label}`);
    });

    console.log('\n--- SAMPLE OF FIRST 20 FIELDS ---');
    fields.slice(0, 20).forEach((f: any) => {
      console.log(`Name: ${f.name}, Type: ${f.type}, Nillable: ${f.nillable}, Createable: ${f.createable}`);
    });
  } catch(e) {
    console.error(e);
  }
}

fetchAccountDescribe();

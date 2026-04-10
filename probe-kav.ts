import { sfFetch } from './lib/salesforce/client';

async function describeKAV() {
  try {
    const res = await sfFetch('/services/data/v60.0/sobjects/Knowledge__kav/describe');
    console.log("Found Knowledge__kav");
    console.log(res.fields.map((f: any) => f.name).join(', '));
  } catch (err: any) {
    if (err.message.includes('404')) {
      console.log('Knowledge__kav not found, trying KnowledgeArticleVersion');
      const res2 = await sfFetch('/services/data/v60.0/sobjects/KnowledgeArticleVersion/describe');
      console.log("Found KnowledgeArticleVersion");
      console.log(res2.fields.map((f: any) => f.name).join(', '));
    } else {
      console.error(err);
    }
  }
}

describeKAV();

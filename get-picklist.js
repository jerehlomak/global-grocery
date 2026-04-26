require('dotenv').config({path: '.env.local'});
const { sfGetPicklistValues } = require('./lib/salesforce/client');

sfGetPicklistValues('Lead', 'Region__c').then(console.log).catch(console.error);

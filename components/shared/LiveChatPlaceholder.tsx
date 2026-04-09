'use client'

import Script from 'next/script'


const ORG_ID      = '00Dd200000gnjBt'
const ESW_NAME    = 'Global_Grocery'
const ESW_URL     = 'https://wise-wolf-3sucf2-dev-ed.trailblaze.my.site.com/ESWGlobalGrocery1775717610105'
const SCRT_URL    = 'https://wise-wolf-3sucf2-dev-ed.trailblaze.my.salesforce-scrt.com'
const BOOTSTRAP_SRC = `${ESW_URL}/assets/js/bootstrap.min.js`

function initEmbeddedMessaging() {
  try {
    const esw = window.embeddedservice_bootstrap;
    if (!esw) {
      console.error('❌ embeddedservice_bootstrap not found');
      return;
    }
    
    console.log('✅ Initializing Salesforce Messaging...');
    esw.settings.language = 'en_US'
    esw.init(ORG_ID, ESW_NAME, ESW_URL, {
      scrt2URL: SCRT_URL,
    })
  } catch (err) {
    console.error('❌ Error loading Embedded Messaging: ', err)
  }
}

export default function SalesforceChat() {
  return (
    <Script
      src={BOOTSTRAP_SRC}
      strategy="afterInteractive"
      onLoad={() => {
        console.log('✅ Salesforce bootstrap script loaded');
        initEmbeddedMessaging();
      }}
      onError={(e) => console.error('❌ Salesforce chat bootstrap failed to load', e)}
    />
  )
}
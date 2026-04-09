'use client'

import Script from 'next/script'

declare global {
  interface Window {
    embeddedservice_bootstrap: {
      settings: { language: string }
      init: (orgId: string, name: string, url: string, config: { scrt2URL: string }) => void
    }
  }
}

const ORG_ID      = '00Dd200000gnjBt'
const ESW_NAME    = 'JayTech_Enhanced'
const ESW_URL     = 'https://wise-wolf-3sucf2-dev-ed.trailblaze.my.site.com/ESWJayTechEnhanced1775629878597'
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
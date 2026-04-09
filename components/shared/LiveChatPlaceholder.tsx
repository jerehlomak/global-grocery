'use client'

import Script from 'next/script'

const ORG_ID = '00Dd200000gnjBt'
const ESW_NAME = 'Jay_Web_Chat'
const ESW_URL =
  'https://wise-wolf-3sucf2-dev-ed.trailblaze.my.site.com/ESWJayWebChat1775709560298'
const SCRT_URL =
  'https://wise-wolf-3sucf2-dev-ed.trailblaze.my.salesforce-scrt.com'

const BOOTSTRAP_SRC = `${ESW_URL}/assets/js/bootstrap.min.js`

function initEmbeddedMessaging() {
  const esw = window.embeddedservice_bootstrap

  if (!esw) {
    console.error('❌ embeddedservice_bootstrap not found')
    return
  }

  try {
    console.log('✅ Initializing Salesforce Chat...')

    esw.settings.language = 'en_US'

    esw.init(ORG_ID, ESW_NAME, ESW_URL, {
      scrt2URL: SCRT_URL,
    })
  } catch (err) {
    console.error('❌ Error initializing chat:', err)
  }
}

export default function SalesforceChat() {
  return (
    <Script
      src={BOOTSTRAP_SRC}
      strategy="afterInteractive"
      onLoad={() => {
        console.log('✅ Salesforce bootstrap loaded')
        initEmbeddedMessaging()
      }}
      onError={(e) => {
        console.error('❌ Failed to load Salesforce script', e)
      }}
    />
  )
}
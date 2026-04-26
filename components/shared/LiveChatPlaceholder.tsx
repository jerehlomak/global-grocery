'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    initEmbeddedMessaging?: () => void;
  }
}

const ORG_ID      = '00Dd200000eNvL7'
const ESW_NAME    = 'Global_Grocery_Channel'
const ESW_URL     = 'https://wise-moose-1vy13f-dev-ed.trailblaze.my.site.com/ESWGlobalGroceryChannel1776780613599'
const SCRT_URL    = 'https://wise-moose-1vy13f-dev-ed.trailblaze.my.salesforce-scrt.com'
const BOOTSTRAP_SRC = `${ESW_URL}/assets/js/bootstrap.min.js`

export default function SalesforceChat() {
  useEffect(() => {
    if (document.getElementById('sf-chat-script')) return;

    window.initEmbeddedMessaging = () => {
      try {
        const esw = window.embeddedservice_bootstrap;
        if (!esw) {
          console.error('❌ embeddedservice_bootstrap not found');
          return;
        }
        
        console.log('✅ Initializing Salesforce Messaging (Global Grocery Channel)...');
        esw.settings.language = 'en_US'
        esw.init(ORG_ID, ESW_NAME, ESW_URL, {
          scrt2URL: SCRT_URL,
        })
      } catch (err) {
        console.error('❌ Error loading Embedded Messaging: ', err)
      }
    }

    const script = document.createElement('script')
    script.id = 'sf-chat-script'
    script.src = BOOTSTRAP_SRC
    script.async = true
    script.onload = () => {
      console.log('✅ Salesforce bootstrap script loaded');
      if (typeof window.initEmbeddedMessaging === 'function') {
        window.initEmbeddedMessaging();
      }
    }
    script.onerror = (e) => console.error('❌ Salesforce chat bootstrap failed to load', e)
    document.body.appendChild(script)
  }, [])

  return null
}
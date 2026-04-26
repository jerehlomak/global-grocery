'use client'

import Script from 'next/script'

declare global {
  interface Window {
    initEmbeddedMessaging?: () => void;
  }
}

export default function LiveChatPlaceholder() {
  return (
    <>
      <Script id="sf-chat-inline" strategy="beforeInteractive">
        {`
          function initEmbeddedMessaging() {
            try {
              embeddedservice_bootstrap.settings.language = 'en_US'; // For example, enter 'en' or 'en-US'

              embeddedservice_bootstrap.init(
                '00Dd200000eNvL7',
                'Global_Grocery_Channel',
                'https://wise-moose-1vy13f-dev-ed.trailblaze.my.site.com/ESWGlobalGroceryChannel1776780613599',
                {
                  scrt2URL: 'https://wise-moose-1vy13f-dev-ed.trailblaze.my.salesforce-scrt.com'
                }
              );
            } catch (err) {
              console.error('Error loading Embedded Messaging: ', err);
            }
          };
        `}
      </Script>
      <Script 
        id="sf-chat-external"
        src="https://wise-moose-1vy13f-dev-ed.trailblaze.my.site.com/ESWGlobalGroceryChannel1776780613599/assets/js/bootstrap.min.js"
        strategy="afterInteractive"
        onLoad={() => {
           // @ts-ignore
           if (typeof window.initEmbeddedMessaging === 'function') window.initEmbeddedMessaging();
        }}
      />
    </>
  )
}
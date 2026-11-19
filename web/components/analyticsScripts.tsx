'use client'

import Script from 'next/script'

export function AnalyticsScripts() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID?.trim()
  if (!gaId) return null

  return <>
    <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`} strategy="afterInteractive" />
    <Script id="ga4-script" strategy="afterInteractive">{`
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', ${JSON.stringify(gaId).replace(/</g, '\\u003c')}, {
        page_path: window.location.pathname,
      });
    `}</Script>
  </>
}

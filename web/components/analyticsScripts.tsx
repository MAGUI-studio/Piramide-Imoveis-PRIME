'use client'

import Script from 'next/script'
import {useEffect, useState} from 'react'
import {cookieConsentEvent, hasCookieConsent} from '../lib/cookieConsent'
import {serializeJson} from '../lib/serializeJson'

export function AnalyticsScripts() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID?.trim()
  const [accepted, setAccepted] = useState(false)
  useEffect(() => {
    const syncConsent = () => setAccepted(hasCookieConsent())
    syncConsent()
    window.addEventListener(cookieConsentEvent, syncConsent)
    window.addEventListener('storage', syncConsent)
    return () => {
      window.removeEventListener(cookieConsentEvent, syncConsent)
      window.removeEventListener('storage', syncConsent)
    }
  }, [])
  if (!gaId || !accepted) return null

  return <>
    <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`} strategy="afterInteractive" />
    <Script id="ga4-script" strategy="afterInteractive">{`
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', ${serializeJson(gaId)}, {
        page_path: window.location.pathname,
      });
    `}</Script>
  </>
}

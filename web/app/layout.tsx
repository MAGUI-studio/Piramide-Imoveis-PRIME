import type {Metadata} from 'next'
import {Montserrat} from 'next/font/google'
import type {ReactNode} from 'react'
import {VisualEditing} from 'next-sanity/visual-editing'
import './globals.css'
import {Footer} from '../components/footer'
import {Header} from '../components/header'
import {LoadingCurtain} from '../components/loadingCurtain'
import {SiteUtilities} from '../components/siteUtilities'
import {ThemeProvider} from '../components/themeProvider'
import {whatsappLink} from '../lib/model'
import {getSiteSettings, isPreview, siteUrl} from '../lib/sanity'
import {defaultSocialImage, homeDescription, siteName} from '../lib/seo'
import {AnalyticsScripts} from '../components/analyticsScripts'
import {safeExternalUrl} from '../lib/siteSettings'

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {default: siteName, template: '%s | ' + siteName},
  description: homeDescription,
  openGraph: {type: 'website', locale: 'pt_BR', siteName, title: siteName, description: homeDescription, images: [defaultSocialImage]},
  twitter: {card: 'summary_large_image', title: siteName, description: homeDescription, images: [defaultSocialImage]},
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
}

export default async function RootLayout({children}: {children: ReactNode}) {
  const preview = await isPreview()
  const settings = await getSiteSettings(preview)
  const organization = settings.organization || {}
  const contact = whatsappLink(organization.commercialPhone ?? null)
  const portalUrl = safeExternalUrl(organization.portalUrl)
  const socialLinks = (organization.socialLinks || [])
    .filter(({href}) => !!safeExternalUrl(href))
    .map(({label, href, icon}) => ({label, href: safeExternalUrl(href)!, icon}))
  return (
    <html lang="pt-BR" suppressHydrationWarning data-scroll-behavior="smooth" className={montserrat.variable + ' bg-paper motion-safe:scroll-smooth'}>
      <body className="relative mx-auto w-full max-w-520 bg-paper font-sans text-espresso transition-colors [&_a:focus-visible]:outline-2 [&_button:focus-visible]:outline-2 [&_:focus-visible]:outline-offset-4 [&_:focus-visible]:outline-piramide">
        {!preview && <AnalyticsScripts />}
        <ThemeProvider>
          <LoadingCurtain />
          <a className="sr-only focus:not-sr-only focus:absolute focus:z-20 focus:bg-piramide focus:px-5 focus:py-3 focus:text-white" href="#conteudo">Ir para o conteúdo</a>
          <Header contact={contact} portalUrl={portalUrl} socialLinks={socialLinks} />
          {children}
          <Footer />
          <SiteUtilities privacy={settings.privacy || undefined} organization={settings.organization || undefined} />
          {preview && <VisualEditing />}
        </ThemeProvider>
      </body>
    </html>
  )
}

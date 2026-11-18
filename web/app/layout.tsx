import type {Metadata} from 'next'
import {Montserrat} from 'next/font/google'
import type {ReactNode} from 'react'
import {VisualEditing} from 'next-sanity/visual-editing'
import './globals.css'
import {LoadingCurtain} from '../components/loadingCurtain'
import {SiteUtilities} from '../components/siteUtilities'
import {isPreview, siteUrl} from '../lib/sanity'
import {homeDescription, siteName} from '../lib/seo'

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {default: siteName, template: '%s | ' + siteName},
  description: homeDescription,
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
}

export default async function RootLayout({children}: {children: ReactNode}) {
  return (
    <html lang="pt-BR" className={montserrat.variable + ' bg-paper motion-safe:scroll-smooth'}>
      <body className="relative mx-auto w-full max-w-[110rem] bg-paper font-sans text-ivory [color-scheme:dark] [&_a:focus-visible]:outline-2 [&_button:focus-visible]:outline-2 [&_:focus-visible]:outline-offset-4 [&_:focus-visible]:outline-piramide">
        <LoadingCurtain />
        <a className="sr-only focus:not-sr-only focus:absolute focus:z-20 focus:bg-piramide focus:px-5 focus:py-3 focus:text-white" href="#conteudo">Ir para o conteúdo</a>
        {children}
        <SiteUtilities />
        {await isPreview() && <VisualEditing />}
      </body>
    </html>
  )
}

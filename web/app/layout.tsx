import type {Metadata} from 'next'
import {Inter} from 'next/font/google'
import type {ReactNode} from 'react'
import {VisualEditing} from 'next-sanity/visual-editing'
import './globals.css'
import {LoadingCurtain} from '../components/loadingCurtain'
import {SiteUtilities} from '../components/siteUtilities'
import {isPreview, siteUrl} from '../lib/sanity'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {default: 'Pirâmide PRIME', template: '%s | Pirâmide PRIME'},
  description: 'Explore os empreendimentos de alto padrão da Pirâmide Imóveis.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
}

export default async function RootLayout({children}: {children: ReactNode}) {
  return (
    <html lang="pt-BR" className={inter.variable + ' motion-safe:scroll-smooth [background:#161616]'}>
      <body className="relative mx-auto w-full max-w-[110rem] bg-coal font-sans text-ivory [color-scheme:dark] [&_a:focus-visible]:outline-2 [&_button:focus-visible]:outline-2 [&_:focus-visible]:outline-offset-4 [&_:focus-visible]:outline-piramide">
        <LoadingCurtain />
        <a className="sr-only focus:not-sr-only focus:absolute focus:z-20 focus:bg-gold focus:px-5 focus:py-3 focus:text-coal" href="#conteudo">Ir para o conteúdo</a>
        {children}
        <SiteUtilities />
        {await isPreview() && <VisualEditing />}
      </body>
    </html>
  )
}

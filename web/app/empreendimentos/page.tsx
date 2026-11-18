import type {Metadata} from 'next'
import {Suspense} from 'react'
import {Catalog} from '../../components/catalog'
import {Footer, Header} from '../../components/chrome'
import {WhatsAppWidget} from '../../components/whatsappWidget'
import {homeSectionHeading, previewBanner, wrap} from '../../lib/classes'
import {catalogPictures} from '../../lib/image'
import {whatsappLink} from '../../lib/model'
import {getHome, isPreview} from '../../lib/sanity'

export const metadata: Metadata = {
  title: 'Empreendimentos',
  description: 'Explore o catálogo de empreendimentos de alto padrão da Pirâmide Imóveis.',
  alternates: {canonical: '/empreendimentos'},
}

export default async function Empreendimentos() {
  const preview = await isPreview()
  const {catalog, whatsapp} = await getHome(preview)
  const contact = whatsappLink(whatsapp)

  return <>
    {preview && <a className={previewBanner} href="/api/draft-mode/disable">Prévia de rascunhos · Sair</a>}
    <Header light contact={contact} />
    <main id="conteudo" className="bg-paper text-espresso [color-scheme:light]">
      <Suspense fallback={<div className={wrap + ' py-16'}>
        <h1 className={homeSectionHeading}>Todos os empreendimentos</h1>
        <p role="status" className="mt-4 text-earth">Carregando empreendimentos…</p>
      </div>}>
        <Catalog items={catalog.map(catalogPictures)} full />
      </Suspense>
    </main>
    <Footer contact={contact} />
    <WhatsAppWidget phone={whatsapp} />
  </>
}

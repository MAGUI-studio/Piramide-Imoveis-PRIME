import type {Metadata} from 'next'
import {Suspense} from 'react'
import {Catalog} from '../../components/catalog'
import {Footer, Header} from '../../components/chrome'
import {CatalogCta} from '../../components/catalogCta'
import {JsonLd} from '../../components/jsonLd'
import {WhatsAppWidget} from '../../components/whatsappWidget'
import {homeSectionHeading, previewBanner, wrap} from '../../lib/classes'
import {catalogPictures} from '../../lib/image'
import {catalogPageSize, whatsappLink} from '../../lib/model'
import {getHome, isPreview} from '../../lib/sanity'
import {breadcrumbs, catalogDescription, catalogPath, catalogTitle, pageMetadata} from '../../lib/seo'

export async function generateMetadata({searchParams}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}): Promise<Metadata> {
  const preview = await isPreview()
  const {catalog, catalogSeo} = await getHome(preview)
  const params = await searchParams
  const filtered = ['busca', 'cidade', 'bairro', 'tipo', 'suites'].some((key) => !!params[key])
  const requested = Array.isArray(params.pagina) ? params.pagina[0] : params.pagina
  const page = !filtered && requested && /^[1-9]\d*$/.test(requested)
    ? Math.min(Number(requested), Math.max(1, Math.ceil(catalog.length / catalogPageSize)))
    : 1
  return pageMetadata({
    path: catalogPath + (page > 1 ? '?pagina=' + page : ''),
    title: catalogTitle, titleSuffix: page > 1 ? ' – Página ' + page : '',
    description: catalogDescription, seo: catalogSeo, noIndex: preview,
  })
}

export default async function Empreendimentos() {
  const preview = await isPreview()
  const {catalog, whatsapp} = await getHome(preview)
  const contact = whatsappLink(whatsapp)

  return <>
    {!preview && <JsonLd data={breadcrumbs([{name: 'Início', path: '/'}, {name: 'Empreendimentos', path: catalogPath}])} />}
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
    <Footer contact={contact} integrated>
      <CatalogCta contact={contact} />
    </Footer>
    <WhatsAppWidget phone={whatsapp} />
  </>
}

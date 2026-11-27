import {Suspense} from 'react'
import Link from 'next/link'
import type {Metadata} from 'next'
import {ArrowUpRight} from 'lucide-react'
import {CatalogCta} from '../../components/catalogCta'
import {JsonLd} from '../../components/jsonLd'
import {VideosExplorer} from '../../components/videosExplorer'
import {WhatsAppWidget} from '../../components/whatsappWidget'
import {eyebrow, previewBanner, wrap} from '../../lib/classes'
import {reelPictures} from '../../lib/image'
import {whatsappLink} from '../../lib/model'
import {getReels, getSiteSettings, isPreview} from '../../lib/sanity'
import {breadcrumbs, canonicalUrl, pageMetadata, siteName} from '../../lib/seo'

const videosTitle = 'Tours & Vídeos Exclusivos'
const videosDescription =
  'Assista a tours virtuais completos, detalhes arquitetônicos e apresentações exclusivas dos imóveis e lançamentos da Pirâmide Imóveis no Vale do Paraíba e Litoral Norte.'
const videosPath = '/videos'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const preview = await isPreview()
  return pageMetadata({
    path: videosPath,
    title: videosTitle,
    description: videosDescription,
    noIndex: preview,
  })
}

export default async function VideosPage() {
  const preview = await isPreview()
  const [rawReels, settings] = await Promise.all([getReels(preview), getSiteSettings(preview)])
  const reels = rawReels.map(reelPictures)
  const whatsapp = settings.organization?.commercialPhone ?? null
  const contact = whatsappLink(whatsapp)

  const videosJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${videosTitle} | ${siteName}`,
    description: videosDescription,
    url: canonicalUrl(videosPath),
  }

  return (
    <>
      {!preview && (
        <>
          <JsonLd data={videosJsonLd} />
          <JsonLd data={breadcrumbs([{name: 'Início', path: '/'}, {name: 'Vídeos', path: videosPath}])} />
        </>
      )}
      {preview && (
        <a className={previewBanner} href="/api/draft-mode/disable">
          Prévia de rascunhos · Sair
        </a>
      )}

      <main id="conteudo" className="bg-paper text-espresso">
        <section className={wrap + ' pt-6 pb-12 sm:pt-8 sm:pb-16'}>
          <nav
            aria-label="Navegação estrutural"
            className="mb-6 flex items-center gap-3 text-[11px] text-earth"
          >
            <Link href="/" className="hover:text-piramide">
              Início
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Vídeos</span>
          </nav>

          <div className="mb-7 sm:mb-8">
            <p className={eyebrow + ' mb-3 text-piramide'}>Tours &amp; imóveis em vídeo</p>
            <h1 className="text-[clamp(2rem,3.8vw,3.8rem)] leading-[1.04] font-medium tracking-[-.04em]">
              Tours &amp; vídeos exclusivos
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-earth sm:text-base">
              {videosDescription}
            </p>
          </div>

          <Suspense fallback={<p role="status" className="py-8 text-earth">Carregando vídeos…</p>}>
            <VideosExplorer reels={reels} />
          </Suspense>

          <Link
            href="/imoveis"
            className="mt-8 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-piramide hover:underline"
          >
            Ver todos os imóveis <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </section>
      </main>

      <CatalogCta contact={contact} />
      <WhatsAppWidget phone={whatsapp} />
    </>
  )
}

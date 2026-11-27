import type {Metadata} from 'next'
import Link from 'next/link'
import {ArrowUpRight} from 'lucide-react'
import {Suspense} from 'react'
import {CondominiumDirectory} from '../../components/condominiumDirectory'
import {CatalogCta} from '../../components/catalogCta'
import {WhatsAppWidget} from '../../components/whatsappWidget'
import {eyebrow, previewBanner, wrap} from '../../lib/classes'
import {picture} from '../../lib/image'
import {whatsappLink} from '../../lib/model'
import {getCatalogOptions, getCondominiumDirectory, getCondominiums, getSiteSettings, isPreview} from '../../lib/sanity'
import {pageMetadata} from '../../lib/seo'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({path: '/condominios', title: 'Condomínios', description: 'Conheça os condomínios e encontre casas, apartamentos e terrenos na localização que combina com você.', noIndex: await isPreview()})
}

export default async function Condominios() {
  const preview = await isPreview()
  const [condominiums, settings, directory, filterOptions] = await Promise.all([getCondominiums(preview), getSiteSettings(preview), getCondominiumDirectory(preview), getCatalogOptions(preview)])
  const whatsapp = settings.organization?.commercialPhone ?? null
  const contact = whatsappLink(whatsapp)
  return <>
    {preview && <a className={previewBanner} href="/api/draft-mode/disable">Prévia de rascunhos · Sair</a>}
    <main id="conteudo" className="bg-paper text-espresso">
      <section className={wrap + ' pt-6 pb-12 sm:pt-8 sm:pb-16'}>
        <nav aria-label="Navegação estrutural" className="mb-6 flex items-center gap-3 text-[11px] text-earth"><Link href="/" className="hover:text-piramide">Início</Link><span aria-hidden="true">/</span><span aria-current="page">Condomínios</span></nav>
        <div className="mb-7 sm:mb-8">
          <p className={eyebrow + ' mb-3 text-piramide'}>Um lugar para viver bem</p>
          <h1 className="text-[clamp(2rem,3.8vw,3.8rem)] leading-[1.04] font-medium tracking-[-.04em]">{directory.title || 'Conheça nossos condomínios'}</h1>
          <p className="mt-4 text-sm leading-relaxed text-earth sm:text-base">{directory.description || 'Explore nossa seleção e encontre casas, apartamentos e terrenos no condomínio ideal para você.'}</p>
        </div>
        <Suspense fallback={<p role="status" className="py-8 text-earth">Carregando condomínios…</p>}>
          <CondominiumDirectory filterOptions={filterOptions} featuredIds={directory.featuredIds} items={condominiums.map((condo) => ({...condo, image: picture(condo.cover, 1.8, 2000), count: condo.propertyCount}))} />
        </Suspense>
        <Link href="/imoveis" className="mt-8 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-piramide hover:underline">Ver todos os imóveis <ArrowUpRight size={16} aria-hidden="true" /></Link>
      </section>
    </main>
    <CatalogCta contact={contact} />
    <WhatsAppWidget phone={whatsapp} />
  </>
}

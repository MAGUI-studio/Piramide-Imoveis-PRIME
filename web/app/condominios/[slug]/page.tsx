import type {Metadata} from 'next'
import Link from 'next/link'
import {notFound} from 'next/navigation'
import {Suspense} from 'react'
import {ArrowDown, ArrowUpRight, Check, MapPin} from 'lucide-react'
import {Catalog} from '../../../components/catalog'
import {CatalogCta} from '../../../components/catalogCta'
import {Frame} from '../../../components/media'
import {VerticalScrollArea} from '../../../components/scrollArea'
import {WhatsAppWidget} from '../../../components/whatsappWidget'
import {eyebrow, homeSectionHeading, previewBanner, wrap} from '../../../lib/classes'
import {catalogPictures, picture} from '../../../lib/image'
import {whatsappLink} from '../../../lib/model'
import {getCatalog, getCondominium, getSiteSettings, isPreview} from '../../../lib/sanity'
import {pageMetadata} from '../../../lib/seo'

type Props = {params: Promise<{slug: string}>}
export async function generateMetadata({params}: Props): Promise<Metadata> {
  const preview = await isPreview()
  const {slug} = await params
  const condo = await getCondominium(slug, preview)
  if (!condo) return {}
  return pageMetadata({path: '/condominios/' + slug, title: condo.name, description: condo.description, photo: condo.cover, seo: condo.seo, noIndex: preview})
}
export default async function CondominiumPage({params}: Props) {
  const preview = await isPreview()
  const {slug} = await params
  const [condo, settings] = await Promise.all([getCondominium(slug, preview), getSiteSettings(preview)])
  if (!condo) notFound()
  const whatsapp = settings.organization?.commercialPhone ?? null
  const contact = whatsappLink(whatsapp)
  const items = await getCatalog(preview, condo.id)
  return <>
    {preview && <a className={previewBanner} href="/api/draft-mode/disable">Prévia de rascunhos · Sair</a>}
    <main id="conteudo" className="bg-paper text-espresso">
      <section aria-labelledby="condominium-title" className="relative isolate flex min-h-[36rem] flex-col justify-between overflow-hidden bg-coal text-white sm:min-h-[42rem] lg:min-h-[min(78svh,58rem)]">
        <div className="absolute inset-0 -z-10">
          <Frame photo={picture(condo.cover, 16 / 9, 2400)} priority className="size-full object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,14,13,.42)_0%,rgba(12,14,13,.08)_32%,rgba(12,14,13,.5)_66%,rgba(12,14,13,.88)_100%)]" />
        </div>
        <nav aria-label="Navegação estrutural" className={wrap + ' flex flex-wrap items-center gap-x-3 gap-y-2 pt-7 text-[11px] text-white/80 sm:pt-10'}>
          <Link href="/" className="transition-colors hover:text-white">Início</Link><span aria-hidden="true" className="text-white/40">/</span><Link href="/condominios" className="transition-colors hover:text-white">Condomínios</Link><span aria-hidden="true" className="text-white/40">/</span><span aria-current="page">{condo.name}</span>
        </nav>
        <div className={wrap + ' pt-36 pb-9 sm:pt-44 sm:pb-12 lg:pb-16'}>
          <p className={eyebrow + ' mb-5 flex items-center gap-3 text-white/80'}><span aria-hidden="true" className="h-px w-10 bg-white/55" />Condomínios · Pirâmide Prime</p>
          <h1 id="condominium-title" className="max-w-[13ch] text-[clamp(3.3rem,8.5vw,9rem)] leading-[.98] font-medium tracking-[-.055em] text-balance">{condo.name}</h1>
          <div className="mt-8 flex flex-col gap-6 pt-6 sm:mt-10 sm:flex-row sm:items-end sm:justify-between">
            <p className="flex max-w-[48ch] items-start gap-2.5 text-sm leading-relaxed text-white/85"><MapPin size={17} strokeWidth={1.5} className="mt-0.5 shrink-0" aria-hidden="true" />{[condo.address, condo.neighborhood?.name, condo.city?.name].filter(Boolean).join(', ')}</p>
            <a href="#imoveis" className="group inline-flex min-h-12 w-fit shrink-0 items-center gap-8 border border-white/50 px-5 py-3 text-sm font-medium transition-colors hover:bg-white hover:text-coal focus-visible:outline-white">Explorar imóveis <ArrowDown size={17} strokeWidth={1.5} aria-hidden="true" className="motion-safe:transition-transform motion-safe:group-hover:translate-y-1" /></a>
          </div>
        </div>
      </section>
      <section aria-labelledby="condominium-about" className={wrap + ' pt-14 pb-4 sm:pt-20 sm:pb-6 lg:pt-24 lg:pb-8'}>
        {condo.features?.length ? (
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:items-center lg:gap-14">
            <div className="min-w-0">
              <p className={eyebrow + ' mb-4 text-piramide'}>A essência deste endereço</p>
              <h2 id="condominium-about" className={homeSectionHeading + ' max-w-[20ch]'}>Um lugar para chamar de seu.</h2>
              <p className="mt-6 whitespace-pre-line text-base leading-[1.85] text-earth sm:mt-7 sm:text-lg sm:leading-[1.85]">{condo.description}</p>
              <a href="#imoveis" className="mt-7 inline-flex min-h-11 items-center gap-3 pb-1 text-sm font-medium text-piramide transition-colors hover:opacity-75">
                {items.length ? items.length + (items.length === 1 ? ' imóvel neste condomínio' : ' imóveis neste condomínio') : 'Consultar imóveis neste condomínio'}
                <ArrowUpRight size={17} aria-hidden="true" />
              </a>
            </div>
            <div className="min-w-0 border border-rule bg-piramide/[.045] p-6 sm:p-8">
              <div className="mb-6 border-b border-rule pb-5">
                <p className={eyebrow + ' mb-2 text-piramide'}>Infraestrutura, lazer e segurança</p>
                <h2 className="text-xl font-medium tracking-tight sm:text-2xl">O cuidado em cada detalhe</h2>
              </div>
              <VerticalScrollArea className="max-h-64 pr-3 sm:max-h-72">
                <ul className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                  {condo.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3.5">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-piramide/10 text-piramide">
                        <Check size={16} strokeWidth={1.6} aria-hidden="true" />
                      </span>
                      <span className="text-sm leading-snug font-medium sm:text-[0.9375rem]">{feature}</span>
                    </li>
                  ))}
                </ul>
              </VerticalScrollArea>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-[56rem] text-center">
            <p className={eyebrow + ' mb-5 text-piramide'}>A essência deste endereço</p>
            <h2 id="condominium-about" className={homeSectionHeading + ' mx-auto max-w-[24ch]'}>Um lugar para chamar de seu.</h2>
            <p className="mt-7 whitespace-pre-line text-base leading-[1.9] text-earth sm:mt-9 sm:text-lg sm:leading-[1.9]">{condo.description}</p>
            <a href="#imoveis" className="mt-8 inline-flex min-h-11 items-center gap-3 pb-1 text-sm font-medium text-piramide transition-colors hover:opacity-75">{items.length ? items.length + (items.length === 1 ? ' imóvel neste condomínio' : ' imóveis neste condomínio') : 'Consultar imóveis neste condomínio'}<ArrowUpRight size={17} aria-hidden="true" /></a>
          </div>
        )}
      </section>
      <Suspense fallback={<p className={wrap + ' py-12'} role="status">Carregando imóveis…</p>}><Catalog items={items.map(catalogPictures)} full fixedLocation scopeTitle={'Imóveis em ' + condo.name} basePath={'/condominios/' + condo.slug} /></Suspense>
    </main>
    <CatalogCta contact={contact} />
    <WhatsAppWidget phone={whatsapp} />
  </>
}

import type { Metadata } from 'next'
import {Suspense} from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Catalog } from '../components/catalog'
import { Hero } from '../components/hero'
import {HomeBanners} from '../components/homeBanners'
import {bannerHref} from '../lib/banner'
import { Frame } from '../components/media'
import { Reveal } from '../components/motion'
import { ScrollSpy } from '../components/scrollSpy'
import { FinalCta } from '../components/finalCta'
import { HomeStats } from '../components/homeStats'
import { Lifestyle, type LifestyleItem } from '../components/lifestyle'
import { SectionDivider } from '../components/sectionDivider'
import { WhatsAppWidget } from '../components/whatsappWidget'
import { JsonLd } from '../components/jsonLd'
import { eyebrow, heading, previewBanner, textLink, wrap } from '../lib/classes'
import { catalogPictures, picture } from '../lib/image'
import {orderLifestyleItems} from '../lib/lifestyleOrder'
import { locationOf, whatsappLink } from '../lib/model'
import { getCondominiums, getHome, getExploreProperties, getOpeningProperties, getSiteSettings, isPreview } from '../lib/sanity'
import { homeDescription, homeStructuredData, homeTitle, pageMetadata } from '../lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const preview = await isPreview()
  const data = await getHome(preview)
  return pageMetadata({path: '/', title: homeTitle, description: homeDescription, seo: data.homeSeo, noIndex: preview})
}

export default async function Home() {
  const preview = await isPreview()
  const data = await getHome(preview)
  const settings = await getSiteSettings(preview)
  const condominiums = await getCondominiums(preview)
  const [hero, ...otherSlides] = getOpeningProperties(data).map((item) => ({
    slug: item.slug,
    title: item.title,
    summary: item.summary,
    specifications: item.specifications,
    location: locationOf(item),
    photo: picture(item.cover, 16 / 9, 2400),
  }))
  const featured = (data.featured || []).filter((item) => item?.slug && item.cover && item.slug !== hero?.slug)
  const contact = whatsappLink(data.whatsapp)
  const explore = getExploreProperties(data)

  const typePhotos = new Map(
    (data.propertyTypes || [])
      .filter((entry) => entry.name && entry.image?.asset)
      .map((entry) => [entry.name.trim().toLowerCase(), entry.image!]),
  )
  const lifestyleMap = new Map<string, LifestyleItem>()
  for (const item of data.catalog) {
    if (item.propertyType) {
      const entry = lifestyleMap.get(item.propertyType)
      if (entry) entry.count++
      else {
        const customPhoto = typePhotos.get(item.propertyType.trim().toLowerCase())
        const unwatermarkedRef = item.coverOriginalFilename?.replace(/-piramide-watermark-v1\.jpg$/, '')
        const cleanCover = unwatermarkedRef?.startsWith('image-')
          ? {...item.cover, asset: {_ref: unwatermarkedRef}}
          : item.cover
        lifestyleMap.set(item.propertyType, {
          type: item.propertyType,
          count: 1,
          image: picture(customPhoto ?? cleanCover, 3 / 4, 900),
        })
      }
    }
  }
  if (condominiums.length) {
    lifestyleMap.set('Condomínio', {
      type: 'Condomínio',
      count: condominiums.reduce((total, condo) => total + condo.propertyCount, 0),
      image: picture(typePhotos.get('condomínio') ?? condominiums[0].cover, 1.15, 1200),
    })
  }
  const lifestyle = orderLifestyleItems([...lifestyleMap.values()], data.propertyTypeOrder)
  return <>
    {!preview && <JsonLd data={homeStructuredData(settings.organization || undefined)} />}
    {preview && <a className={previewBanner} href="/api/draft-mode/disable">Prévia de rascunhos · Sair</a>}
    <main id="conteudo" className="bg-paper text-espresso">
      {hero ? <div id="inicio" className="relative"><h1 className="sr-only">{homeTitle}</h1><Hero items={[hero, ...otherSlides]} /></div> :
        <section id={data.catalog.length ? 'inicio' : 'imoveis'} className={wrap + ' py-[clamp(85px,12vw,170px)]'}>
          <h1 className={heading + ' text-[clamp(3.5rem,7vw,8rem)]'}>Imóveis de alto padrão</h1>
          <p className="mt-6 text-earth">{data.catalog.length ? 'Conheça nossa seleção de imóveis e encontre seu próximo endereço.' : 'Nenhum imóvel disponível no momento.'}</p>
        </section>}
      <Lifestyle items={lifestyle} />
      <HomeBanners items={data.banners.flatMap((banner) => {
        const href = bannerHref(banner.href)
        return href ? [{id: banner._key, title: banner.title, href, newTab: banner.newTab, image: picture(banner.image, 3, 2400)}] : []
      })} />
      {!!featured.length && <section id="imoveis-em-destaque" className={wrap + ' pt-8 pb-6 sm:pt-10 sm:pb-8'} aria-labelledby="titulo-destaques">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4 sm:mb-6">
          <div>
            <p className={eyebrow + ' mb-1.5 text-[.68rem] text-piramide'}>Seleção exclusiva</p>
            <h2 className={heading + ' text-[clamp(1.85rem,3.4vw,3.25rem)]'} id="titulo-destaques">Em destaque</h2>
          </div>
          <a className={textLink + ' border-piramide text-piramide hover:opacity-80'} href="/imoveis">Ver o catálogo <ArrowUpRight size={16} /></a>
        </div>
        <div className="grid gap-x-6 gap-y-8 md:grid-cols-2 lg:gap-x-8">
          {featured.map((item) => <Reveal className="min-w-0" key={item.id}>
            <Link className="group/featured flex h-full flex-col" href={'/imoveis/' + encodeURIComponent(item.slug)}>
              <div className="relative aspect-[1.45] overflow-hidden bg-coal">
                <Frame className="size-full object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover/featured:scale-104 motion-safe:group-focus-visible/featured:scale-104" photo={picture(item.cover, 1.45, 1400)} sizes="(max-width: 767px) 100vw, 50vw" />
                {item.alternate && (
                  <div
                    className="absolute inset-0 [clip-path:inset(0_100%_0_0)] group-focus-visible/featured:[clip-path:inset(0)] group-hover/featured:[clip-path:inset(0)] motion-safe:transition-[clip-path] motion-safe:duration-700"
                    aria-hidden="true"
                  >
                    <Frame className="size-full object-cover" photo={picture(item.alternate, 1.45, 1400)} sizes="(max-width: 767px) 100vw, 50vw" />
                  </div>
                )}
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/25 to-transparent" />
                {item.propertyType && <span className="absolute bottom-4 left-4 bg-black/35 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-md">{item.propertyType}</span>}
                <span className="absolute top-4 right-4 grid size-10 place-items-center rounded-full bg-white/90 text-coal opacity-0 motion-safe:-translate-x-1 motion-safe:translate-y-1 transition-[opacity,translate] duration-300 group-hover/featured:opacity-100 group-focus-visible/featured:opacity-100 motion-safe:group-hover/featured:translate-x-0 motion-safe:group-hover/featured:translate-y-0 motion-safe:group-focus-visible/featured:translate-x-0 motion-safe:group-focus-visible/featured:translate-y-0 motion-reduce:transition-none"><ArrowUpRight size={19} strokeWidth={1.5} aria-hidden="true" /></span>
              </div>
              <div className="flex flex-1 flex-col pt-4 sm:pt-5">
                <p className="text-[11px] leading-relaxed tracking-wide text-piramide">{locationOf(item)}</p>
                <h3 className="mt-1.5 line-clamp-2 text-[clamp(1.5rem,2.4vw,2.45rem)] leading-[1.12] font-medium tracking-tight text-balance">{item.title}</h3>
                <p className="mt-2 mb-3 line-clamp-2 max-w-[60ch] text-sm leading-relaxed text-earth">{item.summary}</p>
                <span className="mt-auto inline-flex min-h-9 w-fit items-center gap-2.5 text-sm font-medium text-piramide">Conhecer imóvel <ArrowUpRight size={16} aria-hidden="true" className="motion-safe:transition-[translate] motion-safe:duration-300 motion-safe:group-hover/featured:translate-x-1 motion-safe:group-hover/featured:-translate-y-1 motion-safe:group-focus-visible/featured:translate-x-1 motion-safe:group-focus-visible/featured:-translate-y-1" /></span>
              </div>
            </Link>
          </Reveal>)}
        </div>
      </section>}
      {!!explore.length && <Suspense fallback={<p role="status" className={wrap + ' py-12 text-earth'}>Carregando imóveis…</p>}><Catalog items={explore.map(catalogPictures)} showAllLink /></Suspense>}
      {!!explore.length && <SectionDivider />}
      <HomeStats stats={data.stats} intro={settings.statsIntro} />
    </main>
    <ScrollSpy containerId="conteudo" finalSectionIds={['por-que-escolher-a-piramide', 'contato']} />
    {hero && <FinalCta contact={contact} marquee={data.marquee} />}
    <WhatsAppWidget phone={data.whatsapp} />
  </>
}

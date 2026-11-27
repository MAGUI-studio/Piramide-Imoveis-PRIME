import type { Metadata } from 'next'
import {Suspense} from 'react'
import Link from 'next/link'
import { ArrowUpRight, BedDouble, Building2, CarFront, MapPin, Ruler } from 'lucide-react'
import { Catalog } from '../components/catalog'
import { HeroSearch, type HeroSearchMedia } from '../components/heroSearch'
import {HomeBanners} from '../components/homeBanners'
import {bannerHref} from '../lib/banner'
import { Frame } from '../components/media'
import { Reveal } from '../components/motion'
import { ScrollSpy } from '../components/scrollSpy'
import { FinalCta } from '../components/finalCta'
import { HomeStats } from '../components/homeStats'
import { Lifestyle, type LifestyleItem } from '../components/lifestyle'
import { ReelsSection } from '../components/reelsSection'
import { SectionDivider } from '../components/sectionDivider'
import { WhatsAppWidget } from '../components/whatsappWidget'
import { JsonLd } from '../components/jsonLd'
import { eyebrow, heading, previewBanner, textLink, wrap } from '../lib/classes'
import { catalogPictures, picture, reelPictures } from '../lib/image'
import {orderLifestyleItems} from '../lib/lifestyleOrder'
import { cardAreaOf, cardAttributesOf, locationOf, propertyPrice, whatsappLink } from '../lib/model'
import { getCondominiums, getHome, getExploreProperties, getOpeningProperties, getReels, getSiteSettings, isPreview } from '../lib/sanity'
import { homeDescription, homeStructuredData, homeTitle, pageMetadata } from '../lib/seo'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const preview = await isPreview()
  const data = await getHome(preview)
  return pageMetadata({path: '/', title: homeTitle, description: homeDescription, seo: data.homeSeo, noIndex: preview})
}

export default async function Home() {
  const preview = await isPreview()
  const [data, settings, condominiums, rawReels] = await Promise.all([
    getHome(preview),
    getSiteSettings(preview),
    getCondominiums(preview),
    getReels(preview),
  ])
  const reels = rawReels.map(reelPictures)
  const heroMedia: HeroSearchMedia[] = (data.heroBackground?.media || []).flatMap<HeroSearchMedia>((entry) => {
    if (entry._type === 'heroBackgroundVideo' && entry.videoUrl) {
      return [{
        id: entry._key,
        kind: 'video' as const,
        videoUrl: entry.videoUrl,
        posterUrl: entry.poster?.asset ? picture(entry.poster, 16 / 9, 1600).src : null,
      }]
    }
    if (entry._type === 'heroBackgroundImage' && entry.image?.asset) {
      return [{
        id: entry._key,
        kind: 'image' as const,
        photo: picture({...entry.image, alt: entry.alt || entry.image.alt || homeTitle}, 16 / 9, 2400),
      }]
    }
    return []
  })
  const heroPropertyTypes = Array.from(
    new Set([
      ...(data.propertyTypes || []).map(({name}) => name).filter((name) => name && name.trim().toLowerCase() !== 'condomínio'),
      ...data.catalog.map(({propertyType}) => propertyType).filter(Boolean),
    ]),
  ).sort((a, b) => a.localeCompare(b, 'pt-BR'))
  const featured = (data.featured || []).filter((item) => item?.slug && item.cover)
  const contact = whatsappLink(data.whatsapp)
  const explore = getExploreProperties(data)

  const typePhotos = new Map(
    (data.propertyTypes || [])
      .filter((entry) => entry.name && entry.image?.asset)
      .map((entry) => [entry.name.trim().toLowerCase(), entry.image!]),
  )
  const lifestyleMap = new Map<string, LifestyleItem>()
  for (const entry of data.propertyTypes || []) {
    if (!entry.name || !entry.image?.asset) continue
    const type = entry.name.trim().toLowerCase() === 'condomínio' ? 'Condomínio' : entry.name.trim()
    lifestyleMap.set(type, {
      type,
      count: 0,
      image: picture(entry.image, type === 'Condomínio' ? 1.15 : 3 / 4, type === 'Condomínio' ? 1200 : 900),
    })
  }
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
      image: picture(typePhotos.get('condomínio') ?? typePhotos.get('condomínios') ?? condominiums[0].cover, 1.15, 1200),
    })
  }
  const lifestyle = orderLifestyleItems([...lifestyleMap.values()], data.propertyTypeOrder)
  return <>
    {!preview && <JsonLd data={homeStructuredData(settings.organization || undefined)} />}
    {preview && <a className={previewBanner} href="/api/draft-mode/disable">Prévia de rascunhos · Sair</a>}
    <main id="conteudo" className="bg-paper text-espresso">
      <div id="inicio" className="relative">
        <HeroSearch
          media={heroMedia}
          propertyTypes={heroPropertyTypes}
          condominiums={condominiums.map(({slug, name}) => ({slug, name}))}
          headline={data.heroBackground?.headline}
          subheadline={data.heroBackground?.subheadline}
        />
      </div>
      <Lifestyle items={lifestyle} />
      <HomeBanners className={!lifestyle.length ? 'pt-10 sm:pt-14 lg:pt-16' : undefined} items={data.banners.flatMap((banner) => {
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
          {featured.map((item) => {
            const condoName = item.condominium?.name || item.condominiumName
            const condoSlug = item.condominium?.slug
            const refCode = item.refCode?.trim()
            const location = [item.neighborhood?.name, item.city?.name].filter(Boolean).join(', ')
            const area = cardAreaOf(item) || cardAttributesOf(item).find((value) => /^[\d.,]+\s*m²$/i.test(value.trim()))
            const hasSale = !!(item.price && item.price > 0)
            const hasRent = !!(item.rentPrice && item.rentPrice > 0)
            const badgeBase =
              'inline-flex items-center gap-1.5 border border-white/20 bg-black/40 px-2.5 py-1.5 text-[11px] font-medium tracking-wide text-white shadow-[0_6px_18px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-md backdrop-saturate-150'
            return (
              <Reveal className="relative min-w-0" key={item.id}>
                {(condoName || refCode) && (
                  <div className="pointer-events-none absolute top-3.5 right-3.5 left-3.5 z-20 flex flex-wrap items-center gap-1.5 sm:top-4 sm:right-4 sm:left-4">
                    {condoName && (
                      condoSlug ? (
                        <Link
                          href={'/condominios/' + encodeURIComponent(condoSlug)}
                          className={badgeBase + ' pointer-events-auto group/condo max-w-full transition-colors hover:border-white/35 hover:bg-black/55'}
                        >
                          <Building2 aria-hidden="true" size={12} className="shrink-0 text-white/85" />
                          <span className="truncate">{condoName}</span>
                          <ArrowUpRight
                            aria-hidden="true"
                            size={12}
                            className="shrink-0 text-white/75 transition-transform duration-200 group-hover/condo:translate-x-0.5 group-hover/condo:-translate-y-0.5"
                          />
                        </Link>
                      ) : (
                        <span className={badgeBase + ' max-w-full'}>
                          <Building2 aria-hidden="true" size={12} className="shrink-0 text-white/85" />
                          <span className="truncate">{condoName}</span>
                        </span>
                      )
                    )}
                    {refCode && (
                      <span className={badgeBase + ' text-white/90 tabular-nums'}>
                        Cód. {refCode}
                      </span>
                    )}
                  </div>
                )}
                <Link
                  className="group relative isolate flex h-full min-w-0 flex-col sm:aspect-[1.15] sm:flex-row sm:items-end sm:overflow-hidden sm:bg-coal sm:px-6 sm:pt-32 sm:pb-6 sm:shadow-[0_8px_24px_rgba(15,23,42,0.05)] sm:ring-1 sm:ring-inset sm:ring-black/[0.04] sm:transition-shadow sm:duration-300 sm:after:pointer-events-none sm:after:absolute sm:after:inset-0 sm:after:z-10 sm:after:ring-1 sm:after:ring-inset sm:after:ring-white/[0.06] sm:after:transition-colors sm:after:duration-300 sm:hover:after:ring-white/[0.12] dark:sm:shadow-[0_12px_30px_rgba(0,0,0,0.35)] dark:sm:ring-white/[0.05]"
                  href={'/imoveis/' + encodeURIComponent(item.slug)}
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-coal sm:absolute sm:inset-0 sm:-z-10 sm:aspect-auto sm:size-full">
                    <Frame className="size-full object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-104 motion-safe:group-focus-visible:scale-104" photo={picture(item.cover, 1.15, 1400)} sizes="(max-width: 767px) 100vw, 50vw" />
                    {item.alternate && (
                      <div
                        className="absolute inset-0 [clip-path:inset(0_100%_0_0)] group-focus-visible:[clip-path:inset(0)] group-hover:[clip-path:inset(0)] motion-safe:transition-[clip-path] motion-safe:duration-700"
                        aria-hidden="true"
                      >
                        <Frame className="size-full object-cover" photo={picture(item.alternate, 1.15, 1400)} sizes="(max-width: 767px) 100vw, 50vw" />
                      </div>
                    )}
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(to_top,rgba(8,8,8,0.98)_0%,rgba(8,8,8,0.88)_28%,rgba(8,8,8,0.52)_50%,rgba(8,8,8,0.12)_72%,transparent_88%)] sm:block" />
                  </div>
                  <div className="flex flex-1 flex-col pt-4 sm:absolute sm:right-6 sm:bottom-6 sm:left-6 sm:block sm:pt-0 sm:text-white">
                    {item.propertyType && <p className="mb-1.5 text-[11px] font-semibold tracking-wider text-piramide uppercase sm:mb-2 sm:text-xs sm:font-medium sm:tracking-wide sm:text-white/80 sm:normal-case">{item.propertyType}</p>}
                    <h3 className="min-w-0 font-sans text-lg font-semibold leading-snug tracking-tight text-espresso line-clamp-2 sm:text-[clamp(1.35rem,1.8vw,2rem)] sm:leading-tight sm:text-white" title={item.title}>{item.title}</h3>
                    {location && <p className="mt-2 flex items-start gap-1.5 text-sm leading-relaxed text-earth sm:gap-2 sm:text-white/90"><MapPin aria-hidden="true" size={15} className="mt-0.5 shrink-0 text-piramide/80 sm:text-white/90" /><span>{location}</span></p>}
                    {(area || item.specifications?.suites || item.specifications?.parking) && (
                      <ul aria-label="Características do imóvel" className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-medium text-espresso/85 sm:hidden [&>li]:inline-flex [&>li]:items-center [&>li]:gap-1.5 [&>li]:whitespace-nowrap [&>li]:tabular-nums [&>li:not(:first-child)]:before:me-1 [&>li:not(:first-child)]:before:size-1 [&>li:not(:first-child)]:before:rounded-full [&>li:not(:first-child)]:before:bg-earth/40 [&_svg]:shrink-0 [&_svg]:text-piramide">
                        {area && <li><Ruler size={14} strokeWidth={1.7} aria-hidden="true" /><span>{area}</span></li>}
                        {!!item.specifications?.suites && <li><BedDouble size={14} strokeWidth={1.7} aria-hidden="true" /><span>{item.specifications.suites} {item.specifications.suites === 1 ? 'suíte' : 'suítes'}</span></li>}
                        {!!item.specifications?.parking && <li><CarFront size={14} strokeWidth={1.7} aria-hidden="true" /><span>{item.specifications.parking} {item.specifications.parking === 1 ? 'vaga' : 'vagas'}</span></li>}
                      </ul>
                    )}
                    <div className="hidden sm:grid sm:grid-rows-[0fr] sm:opacity-0 sm:transition-[grid-template-rows,opacity] sm:duration-300 sm:ease-out sm:group-hover:grid-rows-[1fr] sm:group-hover:opacity-100 sm:group-focus-visible:grid-rows-[1fr] sm:group-focus-visible:opacity-100 motion-reduce:transition-none">
                      <div className="min-h-0 overflow-hidden">
                        {item.summary && <p className="mt-4 line-clamp-2 max-w-[52ch] text-sm leading-relaxed text-white/80">{item.summary}</p>}
                        <ul aria-label="Características do imóvel" className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-medium text-white [&>li]:inline-flex [&>li]:items-center [&>li]:gap-2 [&>li]:whitespace-nowrap [&>li]:tabular-nums [&>li:not(:first-child)]:before:me-1 [&>li:not(:first-child)]:before:size-1 [&>li:not(:first-child)]:before:rounded-full [&>li:not(:first-child)]:before:bg-white/50 [&_svg]:shrink-0 [&_svg]:text-white/80">
                          {area && <li><Ruler size={16} strokeWidth={1.7} aria-hidden="true" /><span>{area}</span></li>}
                          {!!item.specifications?.suites && <li><BedDouble size={16} strokeWidth={1.7} aria-hidden="true" /><span>{item.specifications.suites} {item.specifications.suites === 1 ? 'suíte' : 'suítes'}</span></li>}
                          {!!item.specifications?.parking && <li><CarFront size={16} strokeWidth={1.7} aria-hidden="true" /><span>{item.specifications.parking} {item.specifications.parking === 1 ? 'vaga' : 'vagas'}</span></li>}
                        </ul>
                      </div>
                    </div>
                    <div className="mt-auto sm:mt-0">
                      {hasSale && hasRent ? (
                        <div className="mt-4 flex flex-wrap items-end gap-x-5 gap-y-2 border-t border-rule pt-3 leading-tight tracking-tight text-espresso tabular-nums sm:border-white/20 sm:text-white">
                          <div>
                            <span className="mb-0.5 block text-[10px] font-semibold tracking-[0.14em] text-earth uppercase sm:text-white/60">Venda</span>
                            <span className="text-[clamp(1.05rem,1.35vw,1.4rem)] font-semibold">{propertyPrice(item.price)}</span>
                          </div>
                          <div className="border-l border-rule pl-5 sm:border-white/20">
                            <span className="mb-0.5 block text-[10px] font-semibold tracking-[0.14em] text-earth uppercase sm:text-white/60">Locação</span>
                            <span className="text-[clamp(1.05rem,1.35vw,1.4rem)] font-semibold">
                              {propertyPrice(item.rentPrice)}
                              <span className="ml-1 text-xs font-medium text-earth sm:text-white/75">/ mês</span>
                            </span>
                          </div>
                        </div>
                      ) : hasRent ? (
                        <div className="mt-4 border-t border-rule pt-3 leading-tight tracking-tight text-espresso tabular-nums sm:border-white/20 sm:text-white">
                          <span className="mb-0.5 block text-[10px] font-semibold tracking-[0.14em] text-earth uppercase sm:text-white/60">Locação</span>
                          <span className="text-[clamp(1.15rem,1.6vw,1.65rem)] font-semibold">
                            {propertyPrice(item.rentPrice)}
                            <span className="ml-1 text-sm font-medium text-earth sm:text-white/75">/ mês</span>
                          </span>
                        </div>
                      ) : (
                        <div className="mt-4 border-t border-rule pt-3 leading-snug tracking-tight text-espresso tabular-nums sm:border-white/20 sm:text-white">
                          <span className="text-[clamp(1.15rem,1.6vw,1.65rem)] font-semibold">{propertyPrice(item.price)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </Reveal>
            )
          })}
        </div>
      </section>}
      {!!explore.length && <Suspense fallback={<p role="status" className={wrap + ' py-12 text-earth'}>Carregando imóveis…</p>}><Catalog items={explore.map(catalogPictures)} showAllLink /></Suspense>}
      {!!explore.length && <SectionDivider />}
      {!!reels.length && <Suspense fallback={null}><ReelsSection reels={reels} /></Suspense>}
      <HomeStats stats={data.stats} intro={settings.statsIntro} />
    </main>
    <ScrollSpy containerId="conteudo" finalSectionIds={['por-que-escolher-a-piramide', 'contato']} />
    <FinalCta contact={contact} marquee={data.marquee} />
    <WhatsAppWidget phone={data.whatsapp} />
  </>
}

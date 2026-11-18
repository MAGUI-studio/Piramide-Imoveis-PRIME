import type {Metadata} from 'next'
import type {ComponentProps, ReactNode} from 'react'
import {notFound} from 'next/navigation'
import {ArrowUpRight, ChevronDown} from 'lucide-react'
import {Header, Footer} from '../../components/chrome'
import {CinemaDetails, PropertyPurchase} from '../../components/cinemaDetails'
import {CinemaIcon} from '../../components/cinemaIcon'
import {Frame, Gallery, ImmersiveCover, WatchVideo} from '../../components/media'
import {PropertyLocation, propertyLocationOf} from '../../components/propertyLocation'
import {PropertyContact, PropertyFAQ, propertyVideos, StoryBackdrop, VideoFrame, type StoryVideo} from '../../components/propertyStory'
import {WhatsAppWidget} from '../../components/whatsappWidget'
import {JsonLd} from '../../components/jsonLd'
import {contentGutter, eyebrow, glassAction, heading, previewBanner, sweepButton, sweepFill, wrap} from '../../lib/classes'
import {picture, type Picture} from '../../lib/image'
import {availabilityLabel, cardAttributesOf, locationOf, whatsappLink, type Property} from '../../lib/model'
import {getProperty, isPreview} from '../../lib/sanity'
import {breadcrumbs, catalogPath, pageMetadata, propertySearchCopy} from '../../lib/seo'

type Props = {params: Promise<{slug: string}>}
const number = new Intl.NumberFormat('pt-BR')
const article = 'pb-[clamp(70px,10vw,120px)]'
const editorialTitle = heading + ' text-[clamp(1.8rem,3vw,2.8rem)]'

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug} = await params
  const preview = await isPreview()
  const data = await getProperty(slug, preview)
  const property = data?.property
  if (!property) return {title: {absolute: 'Página não encontrada | Pirâmide Imóveis Prime'}, robots: {index: false, follow: true}}
  return pageMetadata({
    path: '/' + encodeURIComponent(property.slug),
    ...propertySearchCopy(property),
    seo: property.seo, photo: property.cover, noIndex: preview || property.noIndex === true,
  })
}

function StatusBadges({property, onCover = false}: {property: Property; onCover?: boolean}) {
  const status = availabilityLabel(property.availability)
  const exclusive = !onCover && property.conditions?.exclusive
  const refCode = !onCover && property.refCode?.trim()
  if (!status && !exclusive && !refCode) return null
  const base = 'inline-flex items-center px-2.5 py-1 text-[10px] font-bold tracking-[.13em] uppercase '
  return (
    <div className={'mb-3 flex flex-wrap items-center gap-2 ' + (onCover ? 'justify-center' : '')}>
      {status && (
        <span className={base + (property.availability === 'sold' ? 'bg-zinc-900 text-white' : 'bg-amber-600 text-white')}>
          {status}
        </span>
      )}
      {exclusive && (
        <span className={base + 'bg-piramide text-white'}>
          Exclusividade PRIME
        </span>
      )}
      {refCode && (
        <span className={base + 'border border-zinc-300 text-zinc-700'}>
          Cód. {refCode}
        </span>
      )}
    </div>
  )
}

function PropertyTitle({property, onCover = false, compact = false}: {property: Property; onCover?: boolean; compact?: boolean}) {
  const titleSize = compact ? 'text-[clamp(2.25rem,5vw,5.5rem)]' : onCover ? 'text-[clamp(2.5rem,6.5vw,7.5rem)]' : 'text-[clamp(3.3rem,7vw,7.8rem)]'
  return (
    <>
      <StatusBadges property={property} onCover={onCover} />
      <p className={eyebrow + (onCover ? ' text-white' : ' text-piramide')}>{locationOf(property)}</p>
      <h1 className={heading + ' mt-2.5 wrap-anywhere ' + titleSize}>
        {property.title}
      </h1>
    </>
  )
}

function Attributes({property}: {property: Property}) {
  const attributes = cardAttributesOf(property)
  return (
    <ul className="mt-4 flex flex-wrap gap-4">
      {[property.propertyType, ...attributes].filter(Boolean).map((item, index) => (
        <li className="border-b border-piramide/30 pb-2 text-xs text-zinc-700" key={item + index}>
          {item}
        </li>
      ))}
    </ul>
  )
}

function TechnicalSheet({property, layout}: {property: Property; layout: 'film' | 'essay' | 'standard'}) {
  const specs = property.specifications
  const isLand = property.propertyType === 'Terreno' || property.propertyType === 'Loteamento'
  const isPrivateUnit = property.propertyType === 'Apartamento/Cobertura' || property.propertyType === 'Comercial'
  const areaLabel = isLand && !specs?.landArea ? 'Área do terreno' : isPrivateUnit ? 'Área privativa' : 'Área construída'

  type IconName = ComponentProps<typeof CinemaIcon>['name']
  const items: {label: string; value?: string; icon: IconName}[] = []
  if (specs?.area && specs.area > 0) items.push({label: areaLabel, value: number.format(specs.area) + ' m²', icon: 'area'})
  if (specs?.landArea && specs.landArea > 0) items.push({label: 'Área do terreno', value: number.format(specs.landArea) + ' m²', icon: 'area'})
  if (specs?.bedrooms && specs.bedrooms > 0) items.push({label: 'Dormitórios', value: String(specs.bedrooms), icon: 'bedroom'})
  if (specs?.suites && specs.suites > 0) items.push({label: 'Suítes', value: String(specs.suites), icon: 'suite'})
  if (specs?.bathrooms && specs.bathrooms > 0) items.push({label: 'Banheiros', value: String(specs.bathrooms), icon: 'bath'})
  if (specs?.lavabos && specs.lavabos > 0) items.push({label: 'Lavabos', value: String(specs.lavabos), icon: 'bath'})
  if (specs?.parking && specs.parking > 0) {
    const covered = specs.coveredParking && specs.coveredParking > 0
      ? ` (${specs.coveredParking} ${specs.coveredParking === 1 ? 'coberta' : 'cobertas'})`
      : ''
    items.push({label: 'Vagas de garagem', value: specs.parking + covered, icon: 'parking'})
  }
  if (specs?.floorProfile) items.push({label: 'Perfil / pavimento', value: specs.floorProfile, icon: 'floors'})
  if (specs?.sunOrientation) items.push({label: 'Posição solar', value: specs.sunOrientation, icon: 'sun'})
  if (property.condominiumName) items.push({label: 'Condomínio / edifício', value: property.condominiumName, icon: 'building'})
  if (property.architect) items.push({label: 'Projeto arquitetônico', value: property.architect, icon: 'plan'})
  if (property.refCode) items.push({label: 'Código do imóvel', value: property.refCode, icon: 'reference'})

  if (specs?.hasOffice) items.push({label: 'Escritório / Home office', icon: 'office'})
  if (specs?.hasHobbyBox) items.push({label: 'Hobby box / Depósito privativo', icon: 'storage'})
  if (specs?.hasEvCharger) items.push({label: 'Ponto para carro elétrico', icon: 'charging'})

  if (!items.length) return null

  const factGrid = 'grid grid-cols-2 gap-x-4 gap-y-5 sm:gap-x-7 lg:grid-cols-4'
  function renderFacts(facts: typeof items) {
    if (layout === 'film') {
      return (
        <ul className={factGrid}>
          {facts.map(({label, value, icon}) => (
            <li key={label} className="relative isolate flex min-h-14 min-w-0 flex-col justify-center py-2">
              <CinemaIcon name={icon} className="pointer-events-none absolute end-1 top-1/2 -z-10 size-12! -translate-y-1/2 text-piramide opacity-15 sm:end-4 sm:size-14!" />
              <span className={value ? 'text-xs leading-snug text-[#625768] sm:text-sm' : 'text-sm leading-snug font-semibold sm:text-base'}>{label}</span>
              {value && <span className="mt-1 text-base leading-snug font-semibold wrap-anywhere sm:text-lg">{value}</span>}
            </li>
          ))}
        </ul>
      )
    }
    return (
      <dl className={factGrid}>
        {facts.map(({label, value, icon}) => (
          <div key={label} className="flex min-w-0 items-center gap-3.5 py-1.5 sm:gap-4">
            <CinemaIcon name={icon} className="size-8! shrink-0 text-piramide sm:size-9!" />
            <div className="min-w-0">
              <dt className="text-xs leading-snug text-zinc-600 sm:text-sm">{label}</dt>
              <dd className="mt-0.5 text-base leading-snug font-semibold wrap-anywhere text-zinc-900 sm:text-lg">{value ?? 'Incluído'}</dd>
            </div>
          </div>
        ))}
      </dl>
    )
  }

  return (
    <section className="grid gap-4 border-t border-zinc-300/70 pt-5 sm:pt-6" aria-labelledby="titulo-ficha-tecnica">
      <h2 id="titulo-ficha-tecnica" className={heading + ' text-[clamp(1.45rem,2.5vw,2.25rem)]'}>Ficha técnica</h2>
      {renderFacts(items.slice(0, 4))}
      {items.length > 4 && (
        <details className="group/facts flex flex-col">
          <summary className="inline-flex min-h-10 w-fit cursor-pointer list-none items-center gap-2 text-sm font-semibold text-piramide marker:content-none hover:text-zinc-900 [&::-webkit-details-marker]:hidden">
            <span className="group-open/facts:hidden">Mostrar mais</span>
            <span className="hidden group-open/facts:inline">Mostrar menos</span>
            <ChevronDown aria-hidden="true" size={16} className="motion-safe:transition-transform group-open/facts:rotate-180" />
          </summary>
          <div className="pt-3">{renderFacts(items.slice(4))}</div>
        </details>
      )}
    </section>
  )
}

function StandardHighlights({property}: {property: Property}) {
  const groups = [
    {eyebrow: 'Detalhes do imóvel', title: 'Diferenciais do imóvel', items: property.features, icon: 'sparkle' as const},
    {eyebrow: 'Condomínio e lazer', title: 'Infraestrutura do condomínio', items: property.condoFeatures, icon: 'building' as const},
  ].filter(({items}) => items?.length)
  if (!groups.length) return null
  return (
    <section id="diferenciais" aria-labelledby="standard-highlights" className={wrap + ' scroll-mt-6'}>
      <span id="standard-highlights" className="sr-only">Diferenciais e infraestrutura</span>
      <div className={'grid gap-8 ' + (groups.length > 1 ? 'lg:grid-cols-2 lg:gap-14' : '')}>
        {groups.map(({eyebrow: groupEyebrow, title, items, icon}) => (
          <section className="border-t border-zinc-300/75 pt-6" key={title}>
            <p className={eyebrow + ' text-[.68rem] text-piramide'}>{groupEyebrow}</p>
            <h3 className={heading + ' mt-2 flex items-center gap-3 text-[clamp(1.35rem,2.2vw,1.85rem)]'}>
              <CinemaIcon name={icon} className="size-6! text-piramide" />{title}
            </h3>
            <ul className="mt-5 grid gap-x-6 gap-y-3 text-sm leading-relaxed text-zinc-700 sm:grid-cols-2 sm:text-[0.9375rem]">
              {items?.map((item, index) => (
                <li className="flex items-center gap-3 border-b border-zinc-300/60 pb-2.5" key={item + index}>
                  <span aria-hidden="true" className="size-1.5 shrink-0 bg-piramide" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </section>
  )
}

function PhotoHighlights({property, photos}: {property: Property; photos: [Picture, Picture]}) {
  const rawGroups = [
    {eyebrow: 'Detalhes em foco', title: 'Diferenciais do imóvel', items: property.features ?? []},
    {eyebrow: 'Condomínio e lazer', title: 'Infraestrutura do condomínio', items: property.condoFeatures ?? []},
  ].filter(({items}) => items.length > 0)
  if (!rawGroups.length) return null

  const groups = rawGroups.length === 1 && rawGroups[0].items.length > 2
    ? [
        {...rawGroups[0], items: rawGroups[0].items.slice(0, Math.ceil(rawGroups[0].items.length / 2))},
        {eyebrow: 'Acabamentos e lazer', title: 'Mais diferenciais', items: rawGroups[0].items.slice(Math.ceil(rawGroups[0].items.length / 2))},
      ]
    : rawGroups

  return (
    <section className={contentGutter + ' grid gap-[clamp(3rem,6vw,5.5rem)] overflow-x-clip'} aria-labelledby="photo-notes">
      {groups.map((group, index) => {
        const photo = photos[index] ?? photos[0]
        const reversed = index % 2 === 1
        return (
          <div
            key={group.title + index}
            className={
              'grid items-center gap-8 lg:gap-16 ' +
              (reversed
                ? 'md:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)]'
                : 'md:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)]')
            }
          >
            <figure
              className={
                'relative aspect-[1.42] w-[calc(100%-var(--content-gutter))] overflow-hidden bg-zinc-200 shadow-sm md:w-full ' +
                (reversed
                  ? 'ms-auto rounded-l-full md:order-last'
                  : 'me-auto rounded-r-full')
              }
            >
              <Frame className="absolute inset-0 size-full object-cover" photo={photo} sizes="(max-width: 767px) 92vw, 54vw" />
              {photo.caption && (
                <figcaption className={'absolute bottom-4 max-w-[calc(100%-5rem)] bg-paper/95 px-3 py-2 text-xs text-zinc-800 backdrop-blur-md ' + (reversed ? 'end-4' : 'start-4')}>
                  {photo.caption}
                </figcaption>
              )}
            </figure>
            <div className={reversed ? 'px-(--content-gutter) md:ps-(--content-gutter) md:pe-0' : 'px-(--content-gutter) md:ps-0 md:pe-(--content-gutter)'}>
              <p className={eyebrow + ' text-[.68rem] text-piramide'}>{group.eyebrow}</p>
              <h2 id={index === 0 ? 'photo-notes' : undefined} className={editorialTitle + ' mt-2'}>
                {group.title}
              </h2>
              <ul className="mt-6 grid gap-x-6 gap-y-3.5 sm:grid-cols-2">
                {group.items.map((item, itemIdx) => (
                  <li key={item + itemIdx} className="flex items-center gap-3 border-b border-zinc-300/70 pb-3 text-sm font-medium text-zinc-800 sm:text-[0.9375rem]">
                    <span aria-hidden="true" className="size-1.5 shrink-0 bg-piramide" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )
      })}
    </section>
  )
}

function EditorialDetails({property, link, photos, storyPhoto, detailsPhotos, videos, virtualTour}: {
  property: Property
  link: string | null
  photos: Picture[]
  storyPhoto: Picture
  detailsPhotos: [Picture, Picture]
  videos: StoryVideo[]
  virtualTour: ReactNode
}) {
  return (
    <div className="grid gap-[clamp(3rem,7vw,6.5rem)] pt-[clamp(1.5rem,4vw,3.25rem)]">
      <div className={wrap + ' grid gap-4 sm:gap-5'}>
        <PropertyPurchase property={property} link={link} />
        <TechnicalSheet property={property} layout="essay" />
      </div>
      <StoryBackdrop photo={storyPhoto} property={property} />
      <PhotoHighlights property={property} photos={detailsPhotos} />
      <section className={wrap + ' min-w-0'} aria-labelledby="editorial-gallery">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-5 gap-y-2 sm:mb-6">
          <h2 id="editorial-gallery" className={editorialTitle}>Galeria</h2>
          <span className="text-xs font-medium text-zinc-600 tabular-nums">{photos.length} {photos.length === 1 ? 'foto' : 'fotos'}</span>
        </div>
        <Gallery photos={photos} layout="story" />
      </section>
      <div className={wrap + ' grid gap-[clamp(2.5rem,6vw,5.5rem)]'}>
        {(videos.length > 0 || virtualTour) && (
          <section className="grid gap-5 border-y border-zinc-300/75 py-8 sm:py-10 lg:grid-cols-[minmax(0,.42fr)_minmax(0,1fr)] lg:items-center lg:gap-14" aria-labelledby="editorial-video">
            <div>
              <p className={eyebrow + ' text-[.68rem] text-piramide'}>Tour audiovisual</p>
              <h2 className={editorialTitle + ' mt-2'} id="editorial-video">Vídeos e tour</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {videos.map((video) => <WatchVideo key={video.url} src={video.url} label={video.title} poster={video.poster.src} external={video.external} />)}
              {virtualTour}
            </div>
          </section>
        )}
        <PropertyFAQ property={property} />
      </div>
    </div>
  )
}

function StandardMedia({photo, photoCount, videos, videoPhoto, virtualTour}: {photo: Picture; photoCount: number; videos: StoryVideo[]; videoPhoto?: Picture; virtualTour: ReactNode}) {
  const [lead, ...more] = videos
  if (!lead && !virtualTour) return null
  return (
    <section id="midia" className={wrap + ' grid scroll-mt-6 gap-5'} aria-labelledby="standard-media">
      <div>
        <p className={eyebrow + ' text-[.68rem] text-piramide'}>Galeria multimídia</p>
        <h2 className={editorialTitle + ' mt-2'} id="standard-media">Fotos e tour</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:gap-6">
        <a className="group relative isolate flex aspect-video items-end overflow-hidden bg-zinc-200 p-4 sm:p-6" href="#mosaic-photos">
          <Frame className="absolute inset-0 -z-20 size-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105" photo={photo} sizes="(max-width: 767px) 100vw, 50vw" />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
          <div className="flex w-full flex-wrap items-end justify-between gap-3">
            <div>
              <p className={eyebrow + ' text-[.65rem] text-white/75'}>Ensaio fotográfico</p>
              <p className={heading + ' mt-1 text-lg text-white sm:text-xl'}>{photoCount} {photoCount === 1 ? 'foto do imóvel' : 'fotos do imóvel'}</p>
            </div>
            <span className={glassAction}><CinemaIcon name="photos" /> Ver galeria</span>
          </div>
        </a>
        {lead
          ? <VideoFrame video={videoPhoto ? {...lead, poster: videoPhoto} : lead} />
          : <div className="grid min-h-40 place-items-center bg-zinc-200/55 p-5">{virtualTour}</div>}
      </div>
      {!!lead && (more.length > 0 || virtualTour) && (
        <div className="flex flex-wrap items-center gap-3 pt-1">
          {more.map((video) => <WatchVideo key={video.url} src={video.url} label={video.title} poster={video.poster.src} external={video.external} />)}
          {virtualTour}
        </div>
      )}
    </section>
  )
}

function StandardOverview({property, photo}: {property: Property; photo: Picture}) {
  return (
    <section
      id="sobre"
      className={contentGutter + ' relative isolate grid scroll-mt-6 items-stretch overflow-hidden bg-coal text-ivory md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]'}
      aria-labelledby="standard-about"
    >
      <div className="relative isolate flex flex-col justify-center px-(--content-gutter) py-14 sm:py-20 md:pe-12 lg:pe-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[repeating-linear-gradient(-45deg,#ffffff04_0px,#ffffff04_1px,transparent_1px,transparent_14px)]"
        />
        <p className={eyebrow + ' text-[.68rem] text-piramide'}>Apresentação</p>
        <h2 id="standard-about" className={editorialTitle + ' mt-3 text-ivory'}>Sobre o imóvel</h2>
        <p className="mt-6 max-w-[54ch] border-s border-white/20 ps-5 text-base leading-[1.9] whitespace-pre-line text-ivory/80 sm:ps-6 sm:text-[1.0625rem]">
          {property.description}
        </p>
      </div>
      <figure className="relative aspect-[1.35] min-h-[clamp(20rem,38vw,36rem)] w-full overflow-hidden bg-zinc-900 md:aspect-auto">
        <Frame photo={photo} className="absolute inset-0 size-full object-cover" sizes="(max-width: 767px) 100vw, 55vw" />
        {photo.caption && (
          <figcaption className="absolute bottom-4 start-4 z-1 max-w-[calc(100%-2rem)] border border-white/15 bg-coal/85 px-3 py-2 text-xs text-ivory backdrop-blur-md">
            {photo.caption}
          </figcaption>
        )}
      </figure>
    </section>
  )
}

function PropertyLayout({property, link, hasLocation}: {property: Property; link: string | null; hasLocation: boolean}) {
  const cover = picture(property.cover, 16 / 9, 2400)
  const gallery = property.gallery ?? []
  const photos = gallery.map((photo) => picture(photo, 1.5))
  const storyPhoto = picture(property.sectionPhoto?.asset ? property.sectionPhoto : gallery.at(-1) ?? property.cover, 16 / 9, 2400)
  const detailSources = property.detailsPhotos?.filter((item) => item?.asset) ?? (property.detailsPhoto?.asset ? [property.detailsPhoto] : [])
  const detailsPhotos: [Picture, Picture] = [
    picture(detailSources[0] ?? gallery[0] ?? property.cover, 1.42, 1600),
    picture(detailSources[1] ?? gallery[1] ?? gallery[0] ?? property.cover, 1.42, 1600),
  ]
  const {openingUrl, videos} = propertyVideos(property, cover)
  const virtualTour = property.virtualTourUrl && (
    <a className={sweepButton + ' border-zinc-900/25 bg-white/80 px-5 py-3 text-sm font-semibold text-zinc-900 shadow-2xs'} href={property.virtualTourUrl} target="_blank" rel="noopener noreferrer">
      <span aria-hidden="true" className={sweepFill} />
      <span className="pointer-events-none relative z-10 inline-flex items-center gap-2.5 transition-colors duration-300 group-hover/cta:text-white group-focus-visible/cta:text-white motion-reduce:transition-none">
        <CinemaIcon name="compass" /> Tour Virtual 360° <CinemaIcon name="external" />
      </span>
    </a>
  )

  switch (property.template) {
    case 'immersive':
      return (
        <article>
          <ImmersiveCover photo={cover} src={openingUrl} header={<Header overlay contact={link} />}>
            <PropertyTitle property={property} onCover />
          </ImmersiveCover>
          <CinemaDetails
            property={property}
            link={link}
            photos={[cover, ...photos]}
            storyPhoto={storyPhoto}
            videoTourPhoto={property.videoTourPhoto?.asset ? picture(property.videoTourPhoto, 16 / 9, 1920) : undefined}
            videos={videos}
            virtualTour={virtualTour}
            technicalSheet={<TechnicalSheet property={property} layout="film" />}
          />
        </article>
      )
    case 'mosaic':
      return (
        <article className={article}>
          <div className="relative bg-paper" id="mosaic-photos">
            <Header overlay contact={link} />
            <div className="pointer-events-none absolute inset-x-0 top-0 z-2 h-32 bg-[linear-gradient(180deg,#100e0ca6_0%,transparent_100%)]" aria-hidden="true" />
            <Gallery photos={[cover, ...photos]} layout="mosaic" />
          </div>
          <div className="grid gap-[clamp(2.75rem,6vw,5.5rem)] pt-[clamp(1.5rem,4vw,3.5rem)]">
            <header className={wrap + ' grid gap-7'}>
              <div id="ficha" className="grid scroll-mt-8 gap-4 sm:gap-5">
                <div className="min-w-0">
                  <PropertyTitle property={property} compact />
                  <p className="mt-3 max-w-[70ch] leading-relaxed text-zinc-700">{property.summary}</p>
                </div>
                <PropertyPurchase property={property} link={link} />
                <TechnicalSheet property={property} layout="standard" />
              </div>
              <nav aria-label="Nesta página" className="flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-zinc-300/75 py-3.5 text-xs font-semibold tracking-wider text-zinc-600 uppercase sm:gap-x-8">
                <a className="transition-colors hover:text-piramide" href="#mosaic-photos">Fotos</a>
                <a className="transition-colors hover:text-piramide" href="#ficha">Ficha e valores</a>
                <a className="transition-colors hover:text-piramide" href="#sobre">Sobre o imóvel</a>
                {!!(property.features?.length || property.condoFeatures?.length) && <a className="transition-colors hover:text-piramide" href="#diferenciais">Diferenciais</a>}
                {(videos.length > 0 || virtualTour) && <a className="transition-colors hover:text-piramide" href="#midia">Vídeos e tour</a>}
                {property.faq?.some(({question, answer}) => question.trim() && answer.trim()) && <a className="transition-colors hover:text-piramide" href="#duvidas">Dúvidas</a>}
                {hasLocation && <a className="transition-colors hover:text-piramide" href="#localizacao">Localização</a>}
              </nav>
            </header>
            <StandardOverview photo={storyPhoto} property={property} />
            <StandardHighlights property={property} />
            <StandardMedia photo={property.mediaPhoto?.asset ? picture(property.mediaPhoto, 16 / 9) : photos[0] ?? cover} photoCount={photos.length + 1} videos={videos} videoPhoto={property.mediaVideoPhoto?.asset ? picture(property.mediaVideoPhoto, 16 / 9) : undefined} virtualTour={virtualTour} />
            <div className={wrap + ' empty:hidden'}>
              <PropertyFAQ property={property} />
            </div>
          </div>
        </article>
      )
    default:
      return (
        <article className={article}>
          <div className="relative">
            <Header overlay splitOverlay contact={link} />
            <div className={contentGutter + ' grid items-center gap-[clamp(22px,5vw,75px)] overflow-x-clip min-[801px]:grid-cols-[minmax(0,.88fr)_minmax(0,1.25fr)] min-[801px]:ps-(--content-gutter)'}>
              <div className={wrap + ' pt-2 pb-4 min-[801px]:mx-0 min-[801px]:w-auto min-[801px]:pt-28 min-[801px]:pb-8 lg:pt-32'}>
                <PropertyTitle property={property} />
                <p className="mt-4 leading-relaxed text-zinc-600">{property.summary}</p>
                <Attributes property={property} />
              </div>
              <figure className="relative order-first aspect-[1.04] w-full min-w-0 overflow-hidden bg-zinc-200 after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(180deg,#100e0c7a_0%,transparent_28%)] min-[801px]:order-none min-[801px]:aspect-[1.08] min-[801px]:[clip-path:polygon(0_0,100%_0,100%_100%,clamp(3.5rem,7vw,6.5rem)_100%,0_calc(100%-clamp(3.5rem,7vw,6.5rem)))]">
                <Frame className="size-full object-cover" photo={picture(property.cover, 1.12)} priority sizes="(max-width: 800px) 100vw, 58vw" />
              </figure>
            </div>
          </div>
          <EditorialDetails property={property} link={link} photos={[cover, ...photos]} storyPhoto={storyPhoto} detailsPhotos={detailsPhotos} videos={videos} virtualTour={virtualTour} />
        </article>
      )
  }
}

export default async function PropertyPage({params}: Props) {
  const {slug} = await params
  const preview = await isPreview()
  const data = await getProperty(slug, preview)
  if (!data?.property) notFound()

  const contact = whatsappLink(data.whatsapp, data.property.title, data.property.refCode)
  const location = propertyLocationOf(data.property)
  return (
    <div className="bg-paper text-zinc-900 [color-scheme:light]">
      {!preview && !data.property.noIndex && <JsonLd data={breadcrumbs([
        {name: 'Início', path: '/'},
        {name: 'Empreendimentos', path: catalogPath},
        {name: data.property.title, path: '/' + encodeURIComponent(data.property.slug)},
      ])} />}
      {preview && <a className={previewBanner} href="/api/draft-mode/disable">Prévia de rascunhos · Sair</a>}
      <main id="conteudo" className={data.property.template === 'immersive' ? 'rounded-none **:rounded-none!' : undefined}>
        <PropertyLayout property={data.property} link={contact} hasLocation={!!location} />
      </main>
      <Footer contact={contact} integrated>
        {location && <PropertyLocation title={data.property.title} location={location} />}
        <PropertyContact link={contact} listing={data.property.externalListingUrl} />
      </Footer>
      <WhatsAppWidget phone={data.whatsapp} />
    </div>
  )
}

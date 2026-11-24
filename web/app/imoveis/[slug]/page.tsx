import type {Metadata} from 'next'
import type {ReactNode} from 'react'
import {notFound} from 'next/navigation'
import {ArrowUpRight, ChevronDown} from 'lucide-react'
import {CinemaDetails, PropertyPurchase} from '../../../components/cinemaDetails'
import {CinemaIcon} from '../../../components/cinemaIcon'
import {Frame, Gallery, ImmersiveCover, OpenGalleryTrigger, WatchVideo} from '../../../components/media'
import {PropertyLocation, propertyLocationOf} from '../../../components/propertyLocation'
import {PropertyContact, PropertyFAQ, propertyVideos, StoryBackdrop, VideoFrame, type StoryVideo} from '../../../components/propertyStory'
import {WhatsAppWidget} from '../../../components/whatsappWidget'
import {JsonLd} from '../../../components/jsonLd'
import {SimilarProperties} from '../../../components/similarProperties'
import {similarPropertiesOf} from '../../../lib/similarProperties'
import {eyebrow, glassAction, heading, previewBanner, sweepButton, sweepFill, wrap} from '../../../lib/classes'
import {picture, type Picture} from '../../../lib/image'
import {availabilityLabel, cardAttributesOf, locationOf, whatsappLink, type Property} from '../../../lib/model'
import {technicalFactsOf} from '../../../lib/technicalFacts'
import {getCatalog, getProperty, isPreview} from '../../../lib/sanity'
import {breadcrumbs, catalogPath, pageMetadata, propertySearchCopy} from '../../../lib/seo'

type Props = {params: Promise<{slug: string}>}
const article = 'pb-[clamp(3rem,6vw,5rem)]'
const editorialTitle = heading + ' text-[clamp(1.8rem,3vw,2.8rem)]'

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug} = await params
  const preview = await isPreview()
  const data = await getProperty(slug, preview)
  const property = data?.property
  if (!property) return {title: {absolute: 'Página não encontrada | Pirâmide Imóveis Prime'}, robots: {index: false, follow: true}}
  return pageMetadata({
    path: '/imoveis/' + encodeURIComponent(property.slug),
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
        <span className={base + 'border border-rule text-secondary'}>
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
        <li className="border-b border-piramide/30 pb-2 text-xs text-secondary" key={item + index}>
          {item}
        </li>
      ))}
    </ul>
  )
}

function TechnicalSheet({property, layout}: {property: Property; layout: 'film' | 'essay' | 'standard'}) {
  const items = technicalFactsOf(property)

  if (!items.length) return null

  const factGrid = 'grid grid-cols-2 gap-x-4 gap-y-5 sm:gap-x-7 lg:grid-cols-4'
  function renderFacts(facts: typeof items) {
    if (layout === 'film') {
      return (
        <ul className={factGrid}>
          {facts.map(({label, value, icon, key}) => (
            <li key={key || label} className="relative isolate flex min-h-14 min-w-0 flex-col justify-center py-2">
              <CinemaIcon name={icon} className="pointer-events-none absolute end-1 top-1/2 -z-10 size-12! -translate-y-1/2 text-piramide opacity-15 sm:end-4 sm:size-14!" />
              <span className={value ? 'text-xs leading-snug text-secondary sm:text-sm' : 'text-sm leading-snug font-semibold sm:text-base'}>{label}</span>
              {value && <span className="mt-1 text-base leading-snug font-semibold wrap-anywhere sm:text-lg">{value}</span>}
            </li>
          ))}
        </ul>
      )
    }
    return (
      <dl className={factGrid}>
        {facts.map(({label, value, icon, key}) => (
          <div key={key || label} className="flex min-w-0 items-center gap-3.5 py-1.5 sm:gap-4">
            <CinemaIcon name={icon} className="size-8! shrink-0 text-piramide sm:size-9!" />
            <div className="min-w-0">
              <dt className="text-xs leading-snug text-secondary sm:text-sm">{label}</dt>
              <dd className="mt-0.5 text-base leading-snug font-semibold wrap-anywhere text-ink sm:text-lg">{value ?? 'Incluído'}</dd>
            </div>
          </div>
        ))}
      </dl>
    )
  }

  return (
    <section className="grid gap-4 border-t border-rule pt-5 sm:pt-6" aria-labelledby="titulo-ficha-tecnica">
      <h2 id="titulo-ficha-tecnica" className={heading + ' text-[clamp(1.45rem,2.5vw,2.25rem)]'}>Ficha técnica</h2>
      {renderFacts(items.slice(0, 4))}
      {items.length > 4 && (
        <details className="group/facts flex flex-col">
          <summary className="inline-flex min-h-10 w-fit cursor-pointer list-none items-center gap-2 text-sm font-semibold text-piramide marker:content-none hover:text-ink [&::-webkit-details-marker]:hidden">
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

function StandardPresentation({property, photo}: {property: Property; photo: Picture}) {
  const groups = [
    {eyebrow: 'Detalhes do imóvel', title: 'Diferenciais do imóvel', items: property.features, icon: 'sparkle' as const},
    {eyebrow: 'Condomínio e lazer', title: 'Infraestrutura do condomínio', items: property.condoFeatures, icon: 'building' as const},
  ].filter(({items}) => items?.length)

  return (
    <section
      id="sobre-o-imovel"
      aria-labelledby="standard-about"
      className="relative isolate scroll-mt-6 overflow-hidden bg-coal text-white"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <Frame photo={photo} className="size-full object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0b]/95 via-[#0a0a0b]/80 to-[#0a0a0b]/70" />
      </div>

      <div className={wrap + ' relative z-10 py-16 sm:py-24 lg:py-28'}>
        <div className="max-w-7xl">
          <p className={eyebrow + ' text-[.68rem] text-piramide'}>Apresentação</p>
          <h2 id="standard-about" className={heading + ' mt-3 text-[clamp(2.15rem,4vw,3.6rem)] text-white'}>
            Sobre o imóvel
          </h2>
          <p className="mt-5 text-base leading-[1.85] whitespace-pre-line text-white/90 sm:text-lg">
            {property.description}
          </p>
        </div>

        {groups.length > 0 && (
          <div id="caracteristicas-do-imovel" className={'mt-12 grid scroll-mt-6 gap-10 border-t border-white/15 pt-10 ' + (groups.length > 1 ? 'lg:grid-cols-2 lg:gap-14' : '')}>
            {groups.map(({eyebrow: groupEyebrow, title, items}) => (
              <div key={title}>
                <p className={eyebrow + ' text-[.65rem] text-piramide'}>{groupEyebrow}</p>
                <h3 className={heading + ' mt-2 text-xl text-white sm:text-2xl'}>
                  {title}
                </h3>
                <ul className={'mt-5 grid gap-x-8 gap-y-3.5 ' + (groups.length === 1 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2')}>
                  {items?.map((item, index) => (
                    <li
                      key={item + index}
                      className="flex items-center gap-3 text-sm font-medium text-white/90 sm:text-[0.9375rem]"
                    >
                      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-piramide/20 text-piramide">
                        <CinemaIcon name="check" className="size-4! text-piramide" />
                      </span>
                      <span className="min-w-0 leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function PhotoHighlights({property, photos}: {property: Property; photos: [Picture, Picture]}) {
  const groups = [
    {eyebrow: 'Dentro de casa', title: 'Diferenciais do imóvel', items: property.features ?? [], icon: 'sparkle' as const},
    {eyebrow: 'Além da sua porta', title: 'Infraestrutura do condomínio', items: property.condoFeatures ?? [], icon: 'building' as const},
  ].filter(({items}) => items.length > 0)
  if (!groups.length) return null

  return (
    <section className="w-full" aria-labelledby="photo-notes">
      <h2 id="photo-notes" className="sr-only">Diferenciais e infraestrutura</h2>
      <div className={'grid ' + (groups.length > 1 ? 'sm:grid-cols-2' : '')}>
        {groups.map((group, groupIndex) => <section key={group.title} className="flex min-w-0 flex-col">
          <div className={'grid ' + (groups.length === 1 ? 'sm:grid-cols-2' : '')}>
            {(groups.length === 1 ? photos : [photos[groupIndex]]).map((photo, index) => <figure key={index} className="relative min-w-0">
              <div className="aspect-[1.6] overflow-hidden bg-espresso/5"><Frame photo={photo} className="size-full object-cover" sizes="(max-width: 639px) 100vw, 50vw" /></div>
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-coal via-coal/65 to-transparent sm:h-40 dark:from-[#f4f6f8] dark:via-[#f4f6f8]/65" />
              {photo.caption && <figcaption className="absolute inset-x-0 bottom-0 bg-black/45 px-4 py-2 text-xs leading-relaxed text-white backdrop-blur-sm">{photo.caption}</figcaption>}
            </figure>)}
          </div>
          <div className="relative isolate flex-1 overflow-hidden p-6 sm:p-8 lg:p-10">
            <CinemaIcon name={group.icon} className="pointer-events-none absolute right-4 bottom-4 -z-10 size-40! text-espresso/[.065] sm:right-6 sm:bottom-6 sm:size-48! lg:size-56!" />
            <p className={eyebrow + ' text-[.65rem] text-piramide'}>{group.eyebrow}</p>
            <h3 className="mt-2 text-[clamp(1.5rem,2.3vw,2.2rem)] leading-tight font-medium tracking-tight text-balance">{group.title}</h3>
            <ul className="mt-7 grid gap-x-6 gap-y-4 lg:grid-cols-2">
              {group.items.map((item, index) => <li key={item + index} className="flex min-h-10 items-center gap-3 text-sm leading-relaxed font-medium text-ink sm:gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-piramide/10"><CinemaIcon name="check" className="size-6! text-piramide" /></span><span className="min-w-0">{item}</span></li>)}
            </ul>
          </div>
        </section>)}
      </div>
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
      <div>
        <StoryBackdrop photo={storyPhoto} property={property} />
        <PhotoHighlights property={property} photos={detailsPhotos} />
      </div>
      <section className={wrap + ' min-w-0'} aria-labelledby="editorial-gallery">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-5 gap-y-2 sm:mb-6">
          <h2 id="editorial-gallery" className={editorialTitle}>Galeria</h2>
          <span className="text-xs font-medium text-secondary tabular-nums">{photos.length} {photos.length === 1 ? 'foto' : 'fotos'}</span>
        </div>
        <Gallery photos={photos} layout="story" />
      </section>
      {(videos.length > 0 || virtualTour) && (
        <div className={wrap}>
          <section className="grid gap-5 border-y border-rule py-8 sm:py-10 lg:grid-cols-[minmax(0,.42fr)_minmax(0,1fr)] lg:items-center lg:gap-14" aria-labelledby="editorial-video">
            <div>
              <p className={eyebrow + ' text-[.68rem] text-piramide'}>Tour audiovisual</p>
              <h2 className={editorialTitle + ' mt-2'} id="editorial-video">Vídeos e tour</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {videos.map((video) => <WatchVideo key={video.url} src={video.url} label={video.title} poster={video.poster.src} external={video.external} />)}
              {virtualTour}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

function StandardMedia({photo, photoCount, videos, videoPhoto, virtualTour}: {photo: Picture; photoCount: number; videos: StoryVideo[]; videoPhoto?: Picture; virtualTour: ReactNode}) {
  const [lead, ...more] = videos
  if (!lead && !virtualTour) return null
  return (
    <section id="midia" className="w-full scroll-mt-6" aria-labelledby="standard-media">
      <h2 className="sr-only" id="standard-media">Fotos e tour</h2>
      <div className="grid md:grid-cols-2">
        <OpenGalleryTrigger className="group relative isolate flex aspect-video w-full cursor-pointer items-end overflow-hidden bg-zinc-900 p-4 text-start sm:p-6">
          <Frame className="absolute inset-0 -z-20 size-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105" photo={photo} sizes="(max-width: 767px) 100vw, 50vw" />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
          <div className="flex w-full flex-wrap items-end justify-between gap-3">
            <div>
              <p className={eyebrow + ' text-[.65rem] text-white/75'}>Ensaio fotográfico</p>
              <p className={heading + ' mt-1 text-lg text-white sm:text-xl'}>{photoCount} {photoCount === 1 ? 'foto do imóvel' : 'fotos do imóvel'}</p>
            </div>
            <span className={glassAction}><CinemaIcon name="photos" /> Ver galeria</span>
          </div>
        </OpenGalleryTrigger>
        {lead
          ? <VideoFrame video={videoPhoto ? {...lead, poster: videoPhoto} : lead} />
          : <div className="grid min-h-40 place-items-center bg-coal/95 p-5">{virtualTour}</div>}
      </div>
      {!!lead && (more.length > 0 || virtualTour) && (
        <div className={wrap + ' flex flex-wrap items-center gap-3 pt-5'}>
          {more.map((video) => <WatchVideo key={video.url} src={video.url} label={video.title} poster={video.poster.src} external={video.external} />)}
          {virtualTour}
        </div>
      )}
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
          <ImmersiveCover photo={cover} src={openingUrl}>
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
            <Gallery photos={[cover, ...photos]} layout="mosaic" />
          </div>
          <div className="grid gap-[clamp(2.75rem,6vw,5.5rem)] pt-[clamp(1.5rem,4vw,3.5rem)]">
            <header className={wrap + ' grid gap-7'}>
              <div id="ficha" className="grid scroll-mt-8 gap-4 sm:gap-5">
                <div className="min-w-0">
                  <PropertyTitle property={property} compact />
                  <p className="mt-3 max-w-[70ch] leading-relaxed text-secondary">{property.summary}</p>
                </div>
                <PropertyPurchase property={property} link={link} />
                <TechnicalSheet property={property} layout="standard" />
              </div>
            </header>
            <div>
              <StandardPresentation photo={storyPhoto} property={property} />
              <StandardMedia photo={property.mediaPhoto?.asset ? picture(property.mediaPhoto, 16 / 9) : photos[0] ?? cover} photoCount={photos.length + 1} videos={videos} videoPhoto={property.mediaVideoPhoto?.asset ? picture(property.mediaVideoPhoto, 16 / 9) : undefined} virtualTour={virtualTour} />
            </div>
          </div>
        </article>
      )
    default:
      return (
        <article className={article}>
          <header>
            <figure className="relative w-full">
              <div className="aspect-[1.7] overflow-hidden bg-espresso/5 sm:aspect-[2.5] lg:aspect-[2.9]">
                <Frame className="size-full object-cover" photo={picture(property.cover, 1.9, 2400)} priority sizes="100vw" />
              </div>
              {property.cover.caption && <figcaption className="mt-2 text-xs text-secondary">{property.cover.caption}</figcaption>}
            </figure>
            <div className={wrap + ' pt-8 pb-4 text-center sm:pt-12 sm:pb-6 [&>div]:justify-center'}>
              <StatusBadges property={property} />
              <p className={eyebrow + ' mx-auto max-w-[70ch] text-[.65rem] leading-relaxed text-piramide sm:text-xs'}>{locationOf(property)}</p>
              <h1 className="mx-auto mt-4 max-w-[22ch] text-[clamp(2.5rem,5.5vw,6rem)] leading-[1.03] font-medium tracking-[-.045em] text-balance">{property.title}</h1>
              <p className="mx-auto mt-5 max-w-[65ch] text-sm leading-relaxed text-secondary sm:text-base">{property.summary}</p>
            </div>
          </header>
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
  const similar = similarPropertiesOf(data.property, await getCatalog(preview))
  return (
    <div className="bg-paper text-ink">
      {!preview && !data.property.noIndex && <JsonLd data={breadcrumbs([
        {name: 'Início', path: '/'},
        {name: 'Imóveis', path: catalogPath},
        {name: data.property.title, path: '/imoveis/' + encodeURIComponent(data.property.slug)},
      ])} />}
      {preview && <a className={previewBanner} href="/api/draft-mode/disable">Prévia de rascunhos · Sair</a>}
      <main id="conteudo" className={data.property.template === 'immersive' ? 'rounded-none **:rounded-none!' : undefined}>
        <PropertyLayout property={data.property} link={contact} hasLocation={!!location} />
      </main>
      {location && <PropertyLocation title={data.property.title} location={location} />}
      <div className={wrap + ' pt-[clamp(3rem,6vw,5.5rem)] pb-[clamp(2rem,5vw,4rem)] empty:hidden'}>
        <PropertyFAQ property={data.property} />
      </div>
      <SimilarProperties items={similar} />
      <PropertyContact link={contact} listing={data.property.externalListingUrl} />
      <WhatsAppWidget phone={data.whatsapp} />
    </div>
  )
}

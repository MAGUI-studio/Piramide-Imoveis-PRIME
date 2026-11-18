import type {Metadata} from 'next'
import type {ComponentProps, ReactNode} from 'react'
import {notFound} from 'next/navigation'
import {ArrowUpRight, ChevronDown} from 'lucide-react'
import {Header, Footer} from '../../components/chrome'
import {CinemaDetails, PropertyPurchase} from '../../components/cinemaDetails'
import {CinemaIcon} from '../../components/cinemaIcon'
import {Frame, Gallery, ImmersiveCover, WatchVideo} from '../../components/media'
import {PropertyContact, PropertyFAQ, propertyVideos, StoryBackdrop, VideoFrame, type StoryVideo} from '../../components/propertyStory'
import {WhatsAppWidget} from '../../components/whatsappWidget'
import {button, contentGutter, eyebrow, glassAction, heading, outlineButton, previewBanner, wrap} from '../../lib/classes'
import {picture, type Picture} from '../../lib/image'
import {availabilityLabel, cardAttributesOf, locationOf, whatsappLink, type Property} from '../../lib/model'
import {getProperty, isPreview} from '../../lib/sanity'

type Props = {params: Promise<{slug: string}>}
const number = new Intl.NumberFormat('pt-BR')
const article = 'pb-[clamp(70px,10vw,120px)]'
const editorialTitle = heading + ' text-[clamp(1.8rem,3vw,2.8rem)]'

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug} = await params
  const data = await getProperty(slug, false)
  const property = data?.property
  if (!property) return {robots: {index: false}}
  return {
    title: property.title,
    description: property.summary,
    alternates: {canonical: '/' + slug},
    openGraph: {
      title: property.title,
      description: property.summary,
      url: '/' + slug,
      images: [picture(property.cover, 1200 / 630, 1200).src],
    },
  }
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

function Actions({link, listingUrl}: {link: string | null; listingUrl?: string | null}) {
  if (!link && !listingUrl) return null
  return (
    <div className="flex flex-wrap items-center gap-3">
      {link && (
        <a className={button + ' border-transparent bg-piramide px-5 text-white hover:bg-piramide/90'} href={link} target="_blank" rel="noopener noreferrer">
          Falar pelo WhatsApp <ArrowUpRight size={18} />
        </a>
      )}
      {listingUrl && (
        <a className={outlineButton} href={listingUrl} target="_blank" rel="noopener noreferrer">
          Ver no site da Pirâmide <ArrowUpRight size={18} />
        </a>
      )}
    </div>
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
    {title: 'Diferenciais do imóvel', items: property.features, icon: 'sparkle' as const},
    {title: 'Infraestrutura do condomínio', items: property.condoFeatures, icon: 'building' as const},
  ].filter(({items}) => items?.length)
  if (!groups.length) return null
  return (
    <section id="diferenciais" aria-labelledby="standard-highlights" className="scroll-mt-6 bg-white/55 py-[clamp(2rem,5vw,4rem)]">
      <div className={wrap}>
        <h2 id="standard-highlights" className={editorialTitle + ' mb-6'}>Diferenciais e infraestrutura</h2>
        <div className={'grid gap-6 ' + (groups.length > 1 ? 'lg:grid-cols-2' : '')}>
          {groups.map(({title, items, icon}) => (
            <section className="bg-paper px-4 py-5 sm:px-6" key={title}>
              <h3 className={heading + ' mb-4 flex items-center gap-2.5 text-lg'}><CinemaIcon name={icon} className="text-piramide" />{title}</h3>
              <ul className="grid gap-2.5 text-sm text-zinc-700 sm:grid-cols-2">
                {items?.map((item, index) => <li key={item + index}>{item}</li>)}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </section>
  )
}

function PhotoHighlights({property, photo}: {property: Property; photo: Picture}) {
  const groups = [
    {title: 'Diferenciais do imóvel', items: property.features},
    {title: 'Infraestrutura do condomínio', items: property.condoFeatures},
  ].filter(({items}) => items?.length)
  if (!groups.length) return null
  return (
    <section className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-center lg:gap-14" aria-labelledby="photo-notes">
      <figure className="relative aspect-[1.25] overflow-hidden bg-zinc-200">
        <Frame className="absolute inset-0 size-full object-cover" photo={photo} sizes="(max-width: 767px) 100vw, 52vw" />
        {photo.caption && <figcaption className="absolute bottom-3 start-3 max-w-[calc(100%-1.5rem)] bg-paper/95 px-3 py-2 text-xs">{photo.caption}</figcaption>}
      </figure>
      <div>
        <h2 id="photo-notes" className={editorialTitle}>Detalhes em foco</h2>
        {groups.map(({title, items}) => (
          <section key={title} className="mt-5 border-s border-piramide/45 ps-4">
            <h3 className="mb-2 text-sm font-semibold">{title}</h3>
            <p className="text-sm leading-relaxed text-zinc-700">{items?.join(' · ')}</p>
          </section>
        ))}
      </div>
    </section>
  )
}

function EditorialDetails({property, link, photos, storyPhoto, detailsPhoto, videos, virtualTour}: {
  property: Property
  link: string | null
  photos: Picture[]
  storyPhoto: Picture
  detailsPhoto: Picture
  videos: StoryVideo[]
  virtualTour: ReactNode
}) {
  return (
    <div className="grid gap-[clamp(3rem,7vw,6.5rem)] pt-[clamp(1.5rem,4vw,3.25rem)]">
      <div className={wrap + ' grid gap-4 sm:gap-5'}>
        <PropertyPurchase property={property} link={link} />
        <TechnicalSheet property={property} layout="essay" />
      </div>
      <section className={wrap + ' min-w-0'} aria-labelledby="editorial-gallery">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-5 gap-y-2 sm:mb-6">
          <h2 id="editorial-gallery" className={editorialTitle}>Galeria</h2>
          <span className="text-xs font-medium text-zinc-600 tabular-nums">{photos.length} {photos.length === 1 ? 'foto' : 'fotos'}</span>
        </div>
        <Gallery photos={photos} layout="story" />
      </section>
      <StoryBackdrop photo={storyPhoto} property={property} />
      <div className={wrap + ' grid gap-[clamp(2.5rem,6vw,5.5rem)]'}>
        <PhotoHighlights property={property} photo={detailsPhoto} />
        {(videos.length > 0 || virtualTour) && <section aria-labelledby="editorial-video">
          <h2 className={heading + ' text-xl sm:text-2xl'} id="editorial-video">Vídeos e tour</h2>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {videos.map((video) => <WatchVideo key={video.url} src={video.url} label={video.title} poster={video.poster.src} external={video.external} glassActions />)}
            {virtualTour}
          </div>
        </section>}
        <PropertyFAQ property={property} layout="essay" />
        <PropertyContact link={link} listing={property.externalListingUrl} layout="essay" />
      </div>
    </div>
  )
}

function StandardMedia({photo, videos, videoPhoto, virtualTour}: {photo: Picture; videos: StoryVideo[]; videoPhoto?: Picture; virtualTour: ReactNode}) {
  const [lead, ...more] = videos
  if (!lead && !virtualTour) return null
  return (
    <section id="midia" className={wrap + ' grid scroll-mt-6 gap-4'} aria-labelledby="standard-media">
      <h2 className={editorialTitle} id="standard-media">Fotos e tour</h2>
      <div className="grid gap-3 md:grid-cols-2">
        <a className="group relative isolate flex aspect-video items-end overflow-hidden bg-zinc-200 p-3 sm:p-5" href="#mosaic-photos">
          <Frame className="absolute inset-0 -z-10 size-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105" photo={photo} sizes="(max-width: 767px) 100vw, 50vw" />
          <span className={glassAction}><CinemaIcon name="photos" /> Ver galeria de fotos</span>
        </a>
        {lead
          ? <VideoFrame video={videoPhoto ? {...lead, poster: videoPhoto} : lead} />
          : <div className="grid min-h-40 place-items-center bg-zinc-200/55 p-5">{virtualTour}</div>}
      </div>
      {!!lead && (more.length > 0 || virtualTour) && <div className="flex flex-wrap gap-2.5">
        {more.map((video) => <WatchVideo key={video.url} src={video.url} label={video.title} poster={video.poster.src} external={video.external} glassActions />)}
        {virtualTour}
      </div>}
    </section>
  )
}

function StandardOverview({property, photo}: {property: Property; photo: Picture}) {
  return (
    <section id="sobre" className={wrap + ' grid scroll-mt-6 bg-zinc-100 md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]'} aria-labelledby="standard-about">
      <div className="self-center p-[clamp(1.25rem,4.5vw,4.5rem)]">
        <h2 id="standard-about" className={editorialTitle}>Sobre o imóvel</h2>
        <p className="mt-4 max-w-[55ch] text-sm leading-[1.85] whitespace-pre-line text-zinc-700 sm:text-base">{property.description}</p>
      </div>
      <div className="relative min-h-[clamp(14rem,34vw,32rem)] overflow-hidden bg-zinc-200">
        <Frame photo={photo} className="absolute inset-0 size-full object-cover" sizes="(max-width: 767px) 100vw, 55vw" />
      </div>
    </section>
  )
}

function PropertyLayout({property, link}: {property: Property; link: string | null}) {
  const cover = picture(property.cover, 16 / 9, 2400)
  const gallery = property.gallery ?? []
  const photos = gallery.map((photo) => picture(photo, 1.5))
  const storyPhoto = picture(property.sectionPhoto?.asset ? property.sectionPhoto : gallery.at(-1) ?? property.cover, 16 / 9, 2400)
  const {openingUrl, videos} = propertyVideos(property, cover)
  const virtualTour = property.virtualTourUrl && (
    <a className={glassAction} href={property.virtualTourUrl} target="_blank" rel="noopener noreferrer">
      <CinemaIcon name="compass" /> Tour Virtual 360° <CinemaIcon name="external" />
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
              <nav aria-label="Nesta página" className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-zinc-700 sm:gap-x-7">
                <a className="hover:text-piramide" href="#ficha">Ficha e valores</a>
                <a className="hover:text-piramide" href={videos.length || virtualTour ? '#midia' : '#mosaic-photos'}>Fotos e mídias</a>
                <a className="hover:text-piramide" href="#sobre">Sobre o imóvel</a>
                {!!(property.features?.length || property.condoFeatures?.length) && <a className="hover:text-piramide" href="#diferenciais">Diferenciais</a>}
                {property.faq?.some(({question, answer}) => question.trim() && answer.trim()) && <a className="hover:text-piramide" href="#duvidas">Dúvidas</a>}
              </nav>
            </header>
            <StandardMedia photo={property.mediaPhoto?.asset ? picture(property.mediaPhoto, 16 / 9) : photos[0] ?? cover} videos={videos} videoPhoto={property.mediaVideoPhoto?.asset ? picture(property.mediaVideoPhoto, 16 / 9) : undefined} virtualTour={virtualTour} />
            <StandardOverview photo={storyPhoto} property={property} />
            <StandardHighlights property={property} />
            <div className={wrap + ' grid gap-[clamp(2.75rem,6vw,5.5rem)]'}>
              <PropertyFAQ property={property} layout="standard" />
              <PropertyContact link={link} listing={property.externalListingUrl} layout="standard" />
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
                <div className="mt-5"><Actions link={link} listingUrl={property.externalListingUrl} /></div>
              </div>
              <figure className="relative order-first aspect-[1.04] w-full min-w-0 overflow-hidden bg-coal [clip-path:polygon(0_0,100%_0,100%_90%,90%_100%,0_100%)] after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(180deg,#100e0c7a_0%,transparent_28%)] motion-safe:animate-image-in min-[801px]:order-none min-[801px]:aspect-[1.08] min-[801px]:[clip-path:polygon(7%_0,100%_0,100%_100%,0_100%,0_86%)]">
                <Frame className="size-full object-cover" photo={picture(property.cover, 1.12)} priority sizes="(max-width: 800px) 100vw, 58vw" />
              </figure>
            </div>
          </div>
          <EditorialDetails property={property} link={link} photos={[cover, ...photos]} storyPhoto={storyPhoto} detailsPhoto={property.detailsPhoto?.asset ? picture(property.detailsPhoto, 1.25) : photos[0] ?? cover} videos={videos} virtualTour={virtualTour} />
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
  return (
    <div className={'bg-paper text-zinc-900 [color-scheme:light]' + (data.property.template === 'immersive' ? ' rounded-none **:rounded-none!' : '')}>
      {preview && <a className={previewBanner} href="/api/draft-mode/disable">Prévia de rascunhos · Sair</a>}
      <main id="conteudo">
        <PropertyLayout property={data.property} link={contact} />
      </main>
      <Footer light contact={whatsappLink(data.whatsapp)} />
      <WhatsAppWidget phone={data.whatsapp} />
    </div>
  )
}

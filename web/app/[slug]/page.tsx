import type {Metadata} from 'next'
import type {ComponentProps, ReactNode} from 'react'
import {notFound} from 'next/navigation'
import {ArrowUpRight, Compass} from 'lucide-react'
import {Header, Footer} from '../../components/chrome'
import {CinemaDetails, PropertyPurchase} from '../../components/cinemaDetails'
import {CinemaIcon} from '../../components/cinemaIcon'
import {Frame, Gallery, ImmersiveCover, WatchVideo} from '../../components/media'
import {WhatsAppWidget} from '../../components/whatsappWidget'
import {button, contentGutter, eyebrow, glassAction, heading, outlineButton, previewBanner, wrap} from '../../lib/classes'
import {picture} from '../../lib/image'
import {availabilityLabel, cardAttributesOf, locationOf, whatsappLink, type Property} from '../../lib/model'
import {getProperty, isPreview} from '../../lib/sanity'

type Props = {params: Promise<{slug: string}>}
const currency = new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'})
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

function Terms({property, link}: {property: Property; link: string | null}) {
  const fees: string[] = []
  if (property.condoFee != null) {
    fees.push(property.condoFee > 0 ? 'Condomínio ' + currency.format(property.condoFee) + '/mês' : 'Condomínio isento')
  }
  if (property.iptu != null) {
    fees.push(property.iptu > 0 ? 'IPTU ' + currency.format(property.iptu) + '/ano' : 'IPTU isento')
  }
  const conditionTags = [
    property.conditions?.furnished && 'Mobiliado / Porteira fechada',
    property.conditions?.acceptsTrade && 'Analisa permuta',
    property.conditions?.acceptsFinancing && 'Aceita financiamento',
  ].filter((item): item is string => Boolean(item))

  return (
    <div className="grid content-start gap-3">
      <div>
        <p className="text-[clamp(1.45rem,2.6vw,2.1rem)] leading-tight font-semibold tabular-nums">
          {property.price ? currency.format(property.price) : 'Valor sob consulta'}
        </p>
        {!!fees.length && (
          <p className="mt-1.5 text-xs text-zinc-600 tabular-nums">
            {fees.join(' · ')}
          </p>
        )}
      </div>
      {!!conditionTags.length && (
        <ul className="flex flex-wrap gap-1.5">
          {conditionTags.map((tag) => (
            <li key={tag} className="border border-zinc-300 bg-white/70 px-2.5 py-1 text-[11px] font-medium text-zinc-700">
              {tag}
            </li>
          ))}
        </ul>
      )}
      <Actions link={link} listingUrl={property.externalListingUrl} />
    </div>
  )
}

function Description({property}: {property: Property}) {
  return (
    <section aria-labelledby="property-description">
      <h2 id="property-description" className={editorialTitle}>Sobre o imóvel</h2>
      <p className="mt-4 max-w-[66ch] text-sm leading-[1.85] whitespace-pre-line text-zinc-700 sm:text-base">{property.description}</p>
    </section>
  )
}

function TechnicalSheet({property}: {property: Property}) {
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

  return (
    <section aria-labelledby="titulo-ficha-tecnica">
      <h2 id="titulo-ficha-tecnica" className={heading + ' text-[clamp(1.65rem,3vw,2.7rem)]'}>Ficha técnica</h2>
      <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 lg:gap-y-4">
        {items.map(({label, value, icon}) => (
          <li key={label} className="relative isolate flex min-h-18 min-w-0 flex-col justify-center py-2 sm:min-h-22">
            <CinemaIcon name={icon} className="pointer-events-none absolute end-1 top-1/2 -z-10 size-14! -translate-y-1/2 text-piramide opacity-15 sm:end-4 sm:size-18!" />
            <span className={value ? 'text-xs leading-snug text-[#625768] sm:text-sm' : 'text-sm leading-snug font-semibold sm:text-base'}>{label}</span>
            {value && <span className="mt-1 text-sm leading-snug font-semibold wrap-anywhere sm:text-base">{value}</span>}
          </li>
        ))}
      </ul>
    </section>
  )
}

function FeatureList({title, items}: {title: string; items?: string[] | null}) {
  if (!items?.length) return null
  return (
    <section>
      <h2 className={heading + ' mb-4 text-xl sm:text-2xl'}>{title}</h2>
      <ul className="grid gap-3">
        {items.map((feature, index) => (
          <li className="flex items-center gap-2.5 text-sm leading-relaxed text-zinc-700" key={feature + index}>
            <CinemaIcon name="sparkle" className="text-piramide" />
            {feature}
          </li>
        ))}
      </ul>
    </section>
  )
}

function Features({property}: {property: Property}) {
  const hasPropertyFeatures = !!property.features?.length
  const hasCondoFeatures = !!property.condoFeatures?.length
  if (!hasPropertyFeatures && !hasCondoFeatures) return null
  if (hasPropertyFeatures && hasCondoFeatures) {
    return (
      <div className="grid gap-10 md:grid-cols-2">
        <FeatureList title="Diferenciais do imóvel" items={property.features} />
        <FeatureList title="Infraestrutura do condomínio" items={property.condoFeatures} />
      </div>
    )
  }
  return (
    <>
      <FeatureList title="Diferenciais do imóvel" items={property.features} />
      <FeatureList title="Infraestrutura do condomínio" items={property.condoFeatures} />
    </>
  )
}

function EditorialDetails({property, link, photos, galleryActions}: {
  property: Property
  link: string | null
  photos: ReturnType<typeof picture>[]
  galleryActions: ReactNode
}) {
  return (
    <div className={wrap + ' grid gap-[clamp(3rem,7vw,6.5rem)] pt-[clamp(2.25rem,4.5vw,4.75rem)]'}>
      <section className="min-w-0" aria-labelledby="editorial-gallery">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-5 gap-y-2 sm:mb-6">
          <h2 id="editorial-gallery" className={editorialTitle}>Galeria</h2>
          <span className="text-xs font-medium text-zinc-600 tabular-nums">{photos.length} {photos.length === 1 ? 'foto' : 'fotos'}</span>
        </div>
        <Gallery photos={photos} layout="story">{galleryActions}</Gallery>
      </section>

      <section aria-labelledby="editorial-about" className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-12">
        <h2 id="editorial-about" className={editorialTitle}>Sobre o imóvel</h2>
        <p className="max-w-[68ch] text-base leading-[1.85] whitespace-pre-line text-zinc-700">{property.description}</p>
      </section>

      <TechnicalSheet property={property} />

      <div className="grid gap-9 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-14">
        <Features property={property} />
        <section aria-labelledby="editorial-sale" className="self-start">
          <h2 id="editorial-sale" className={eyebrow + ' mb-3 text-piramide'}>Valor de venda</h2>
          <Terms property={property} link={link} />
        </section>
      </div>
    </div>
  )
}

function PropertyLayout({property, link}: {property: Property; link: string | null}) {
  const cover = picture(property.cover, 16 / 9, 2400)
  const photos = (property.gallery || []).map((photo) => picture(photo, 1.5))
  const cinemaLayout = property.template === 'immersive'
  const glassMedia = property.template !== 'mosaic'
  const tour = property.tour && <WatchVideo cinemaLayout={cinemaLayout} glassActions={glassMedia} label="Assistir ao tour" src={property.tour} poster={cover.src} />
  const clip = property.clip && <WatchVideo glassActions={glassMedia} label="Ver clipe" src={property.clip} poster={cover.src} />
  const externalVideo = property.externalVideoUrl && <WatchVideo cinemaLayout={cinemaLayout} glassActions={glassMedia} external label="Assistir ao vídeo completo" src={property.externalVideoUrl} poster={cover.src} />
  const virtualTour = property.virtualTourUrl && (
    <a className={glassMedia ? glassAction : outlineButton} href={property.virtualTourUrl} target="_blank" rel="noopener noreferrer">
      {glassMedia ? <CinemaIcon name="compass" /> : <Compass size={16} />}
      Tour Virtual 360°
      {glassMedia ? <CinemaIcon name="external" /> : <ArrowUpRight size={15} />}
    </a>
  )

  switch (property.template) {
    case 'immersive':
      return (
        <article>
          <ImmersiveCover photo={cover} src={property.clip} header={<Header overlay contact={link} />}>
            <PropertyTitle property={property} onCover />
          </ImmersiveCover>
          <CinemaDetails
            property={property}
            link={link}
            photos={[cover, ...photos]}
            mediaActions={<>{tour}{externalVideo}{virtualTour}</>}
            technicalSheet={<TechnicalSheet property={property} />}
          />
        </article>
      )
    case 'mosaic':
      return (
        <article className={article}>
          <div className="relative bg-paper">
            <Header overlay contact={link} />
            <div className="pointer-events-none absolute inset-x-0 top-0 z-2 h-32 bg-[linear-gradient(180deg,#100e0ca6_0%,transparent_100%)]" aria-hidden="true" />
            <Gallery photos={[cover, ...photos]} layout="mosaic">{clip}{tour}{externalVideo}{virtualTour}</Gallery>
          </div>
          <div className={wrap + ' grid gap-[clamp(2.75rem,6vw,5.5rem)] pt-[clamp(1.5rem,4vw,3.5rem)]'}>
            <header className="grid items-start gap-7 lg:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)] lg:gap-14">
              <div className="min-w-0">
                <PropertyTitle property={property} compact />
                <p className="mt-4 max-w-[55ch] leading-relaxed text-zinc-700">{property.summary}</p>
              </div>
              <div className="lg:pt-1"><PropertyPurchase property={property} link={link} /></div>
            </header>
            <Description property={property} />
            <div id="ficha" className="scroll-mt-8"><TechnicalSheet property={property} /></div>
            <Features property={property} />
          </div>
        </article>
      )
    default:
      return (
        <article className={article}>
          <div className="relative">
            <Header overlay splitOverlay contact={link} />
            <div className={contentGutter + ' grid items-center gap-[clamp(22px,5vw,75px)] min-[801px]:grid-cols-[minmax(0,.88fr)_minmax(0,1.25fr)] min-[801px]:ps-(--content-gutter)'}>
              <div className={wrap + ' pt-2 pb-4 min-[801px]:mx-0 min-[801px]:w-auto min-[801px]:pt-28 min-[801px]:pb-8 lg:pt-32'}>
                <PropertyTitle property={property} />
                <p className="mt-4 leading-relaxed text-zinc-600">{property.summary}</p>
                <Attributes property={property} />
                <div className="mt-5"><Actions link={link} listingUrl={property.externalListingUrl} /></div>
              </div>
              <figure className="relative order-first aspect-[1.04] overflow-hidden bg-coal [clip-path:polygon(0_0,100%_0,100%_90%,90%_100%,0_100%)] after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(180deg,#100e0c7a_0%,transparent_28%)] motion-safe:animate-image-in min-[801px]:order-none min-[801px]:aspect-[1.08] min-[801px]:[clip-path:polygon(7%_0,100%_0,100%_100%,0_100%,0_86%)]">
                <Frame className="size-full object-cover" photo={picture(property.cover, 1.12)} priority sizes="(max-width: 800px) 100vw, 58vw" />
              </figure>
            </div>
          </div>
          <EditorialDetails property={property} link={link} photos={[cover, ...photos]} galleryActions={<>{clip}{tour}{externalVideo}{virtualTour}</>} />
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

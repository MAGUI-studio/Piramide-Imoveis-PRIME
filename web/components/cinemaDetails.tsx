import type {ReactNode} from 'react'
import {eyebrow, heading, wrap} from '../lib/classes'
import type {Picture} from '../lib/image'
import {propertyPrice, type Property} from '../lib/model'
import {CinemaIcon} from './cinemaIcon'
import {Frame, Gallery} from './media'
import {PropertyContact, PropertyFAQ, VideoTour, type StoryVideo} from './propertyStory'

const currency = new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'})
const label = eyebrow + ' text-[.68rem] text-piramide'

export function PropertyPurchase({property}: {property: Property}) {
  const fees = [
    {label: 'Condomínio mensal', value: property.condoFee},
    {label: 'IPTU anual', value: property.iptu},
  ].filter(({value}) => value != null)
  const conditions = [
    property.conditions?.furnished && 'Porteira fechada',
    property.conditions?.acceptsTrade && 'Analisa permuta',
    property.conditions?.acceptsFinancing && 'Aceita financiamento',
  ].filter(Boolean)

  return (
    <aside className="flex min-w-0 flex-wrap items-end gap-x-10 gap-y-4 pb-2 lg:gap-x-14" aria-labelledby="property-purchase">
      <div>
        <h2 id="property-purchase" className={label}>Valor de venda</h2>
        <p className="mt-1.5 text-[clamp(1.45rem,2.55vw,2.35rem)] leading-tight font-semibold tracking-tight tabular-nums">{propertyPrice(property.price)}</p>
      </div>
        {!!fees.length && (
          <dl className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-[#625768] lg:gap-x-10">
            {fees.map(({label, value}) => <div key={label}><dt>{label}</dt><dd className="mt-1 text-sm font-semibold text-[#251d29] tabular-nums">{value ? currency.format(value) : 'Isento'}</dd></div>)}
          </dl>
        )}
        {!!conditions.length && <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-medium text-piramide lg:ms-auto">{conditions.map((condition) => <li key={String(condition)}>{condition}</li>)}</ul>}
    </aside>
  )
}

function FeaturePanel({items, title, icon}: {items?: string[] | null; title: string; icon: 'sparkle' | 'building'}) {
  if (!items?.length) return null
  return (
    <section>
      <h2 className={heading + ' flex items-start gap-2.5 text-xl sm:text-2xl'}>
        <CinemaIcon name={icon} className="mt-0.5 text-piramide" />{title}
      </h2>
      <ul className="mt-4 grid gap-2.5 ps-8 text-sm leading-relaxed text-[#514954]">
        {items.map((item, index) => <li className="relative before:absolute before:top-[.65em] before:-start-4 before:size-1 before:bg-piramide/75" key={item + index}>{item}</li>)}
      </ul>
    </section>
  )
}

export function CinemaDetails({property, link, photos, storyPhoto, videoTourPhoto, videos, virtualTour, technicalSheet}: {
  property: Property
  link: string | null
  photos: Picture[]
  storyPhoto: Picture
  videoTourPhoto?: Picture
  videos: StoryVideo[]
  virtualTour?: ReactNode
  technicalSheet: ReactNode
}) {
  const featurePanels = property.features?.length || property.condoFeatures?.length
  return (
    <div className="grid gap-[clamp(3rem,6vw,6rem)] bg-paper pb-[clamp(3rem,7vw,7rem)] text-[#251d29]">
      <div className={wrap + ' grid gap-4 pt-[clamp(1rem,3vw,2.5rem)] sm:gap-5'}>
        <PropertyPurchase property={property} />
        {technicalSheet}
      </div>
      <VideoTour videos={videos} virtualTour={virtualTour} leadPhoto={videoTourPhoto} />
      <section className="relative isolate flex min-h-[clamp(23rem,41vw,38rem)] items-center bg-zinc-200" aria-labelledby="cinema-description">
        <Frame photo={storyPhoto} className="absolute inset-0 -z-10 size-full object-cover" />
        <div className={wrap + ' py-7 sm:py-12'}>
          <div className="max-w-[32rem] bg-paper/95 p-[clamp(1.2rem,4vw,2.75rem)] backdrop-blur-md">
            <h2 id="cinema-description" className={heading + ' text-[clamp(1.65rem,3vw,2.7rem)]'}>Por dentro do imóvel</h2>
            <p className="mt-4 text-sm leading-[1.8] whitespace-pre-line text-zinc-700 sm:text-base">{property.description}</p>
          </div>
        </div>
      </section>
      {!!featurePanels && <section className={wrap + ' grid gap-7 lg:grid-cols-[minmax(0,.7fr)_minmax(0,1fr)_minmax(0,1fr)] lg:gap-12'} aria-labelledby="cinema-highlights">
        <h2 id="cinema-highlights" className={heading + ' text-[clamp(1.6rem,3vw,2.65rem)]'}>Destaques da visita</h2>
        <FeaturePanel title="Diferenciais do imóvel" items={property.features} icon="sparkle" />
        <FeaturePanel title="Infraestrutura do condomínio" items={property.condoFeatures} icon="building" />
      </section>}
      <section className={wrap} aria-labelledby="cinema-gallery">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 id="cinema-gallery" className={heading + ' text-[clamp(1.75rem,3vw,2.75rem)]'}>Fotos do imóvel</h2>
          <p className="shrink-0 text-xs text-[#625768] tabular-nums">{photos.length} {photos.length === 1 ? 'foto' : 'fotos'}</p>
        </div>
        <Gallery photos={photos} layout="strip" />
      </section>
      <div className={wrap + ' grid gap-9'}>
        <PropertyFAQ property={property} layout="film" />
        <PropertyContact link={link} listing={property.externalListingUrl} layout="film" />
      </div>
    </div>
  )
}

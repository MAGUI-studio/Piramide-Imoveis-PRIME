import type {ReactNode} from 'react'
import {ArrowUpRight} from 'lucide-react'
import {eyebrow, heading, sweepButton, sweepFill, wrap} from '../lib/classes'
import type {Picture} from '../lib/image'
import {propertyPrice, type Property} from '../lib/model'
import {CinemaIcon} from './cinemaIcon'
import {Frame, Gallery, SharePropertyButton} from './media'
import {PropertyFAQ, VideoTour, type StoryVideo} from './propertyStory'

const currency = new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'})
const label = eyebrow + ' text-[.68rem] text-piramide'

export function PropertyPurchase({property, link}: {property: Property; link?: string | null}) {
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
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 lg:ms-auto">
        {!!conditions.length && <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-medium text-piramide">{conditions.map((condition) => <li key={String(condition)}>{condition}</li>)}</ul>}
        <div className="flex items-center gap-2">
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className={sweepButton + ' border-zinc-900/30 px-3.5 py-2 text-xs font-medium text-zinc-900 sm:px-4 sm:py-2.5 sm:text-sm'}
            >
              <span aria-hidden="true" className={sweepFill} />
              <span className="pointer-events-none relative z-10 inline-flex items-center justify-center gap-2 transition-colors duration-300 group-hover/cta:text-white group-focus-visible/cta:text-white motion-reduce:transition-none">
                Falar pelo WhatsApp <ArrowUpRight size={16} className="transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5 motion-reduce:transition-none" />
              </span>
            </a>
          )}
          <SharePropertyButton title={property.title} />
        </div>
      </div>
    </aside>
  )
}

function FeaturePanel({items, title, eyebrowText, icon}: {items?: string[] | null; title: string; eyebrowText: string; icon: 'sparkle' | 'building'}) {
  if (!items?.length) return null
  return (
    <section className="border-t border-white/15 pt-6">
      <p className={label}>{eyebrowText}</p>
      <h2 className={heading + ' mt-2 flex items-center gap-3 text-[clamp(1.35rem,2.2vw,1.85rem)] text-ivory'}>
        <CinemaIcon name={icon} className="size-6! text-piramide" />{title}
      </h2>
      <ul className="mt-5 grid gap-x-6 gap-y-3 text-sm leading-relaxed text-ivory/80 sm:grid-cols-2 sm:text-[0.9375rem]">
        {items.map((item, index) => (
          <li className="flex items-center gap-3 border-b border-white/10 pb-2.5" key={item + index}>
            <span aria-hidden="true" className="size-1.5 shrink-0 bg-piramide" />
            <span>{item}</span>
          </li>
        ))}
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
  const featurePanels = (property.features?.length ? 1 : 0) + (property.condoFeatures?.length ? 1 : 0)
  return (
    <div className="grid gap-[clamp(3rem,6vw,6rem)] bg-paper pb-[clamp(3rem,7vw,7rem)] text-[#251d29]">
      <div className={wrap + ' grid gap-4 pt-[clamp(1rem,3vw,2.5rem)] sm:gap-5'}>
        <PropertyPurchase property={property} link={link} />
        {technicalSheet}
      </div>
      <VideoTour videos={videos} virtualTour={virtualTour} leadPhoto={videoTourPhoto} />
      <section className={wrap} aria-labelledby="cinema-gallery">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 id="cinema-gallery" className={heading + ' text-[clamp(1.75rem,3vw,2.75rem)]'}>Fotos do imóvel</h2>
          <p className="shrink-0 text-xs text-[#625768] tabular-nums">{photos.length} {photos.length === 1 ? 'foto' : 'fotos'}</p>
        </div>
        <Gallery photos={photos} layout="strip" />
      </section>
      <div className="bg-coal text-ivory">
        <section className="relative isolate flex min-h-[clamp(23rem,41vw,38rem)] items-center bg-zinc-900" aria-labelledby="cinema-description">
          <Frame photo={storyPhoto} className="absolute inset-0 -z-10 size-full object-cover" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-linear-to-t from-coal via-coal/65 to-transparent" />
          <div className={wrap + ' py-7 sm:py-12'}>
            <div className="max-w-[32rem] border border-white/15 bg-coal/90 p-[clamp(1.2rem,4vw,2.75rem)] text-ivory backdrop-blur-md">
              <p className={label}>Apresentação</p>
              <h2 id="cinema-description" className={heading + ' mt-2 text-[clamp(1.65rem,3vw,2.7rem)] text-ivory'}>Por dentro do imóvel</h2>
              <p className="mt-4 text-sm leading-[1.8] whitespace-pre-line text-ivory/80 sm:text-base">{property.description}</p>
            </div>
          </div>
        </section>
        {featurePanels > 0 && (
          <div className={wrap + ' grid gap-8 py-[clamp(2.5rem,5vw,4.5rem)] ' + (featurePanels > 1 ? 'lg:grid-cols-2 lg:gap-14' : '')}>
            <FeaturePanel eyebrowText="Detalhes do imóvel" title="Diferenciais do imóvel" items={property.features} icon="sparkle" />
            <FeaturePanel eyebrowText="Condomínio e lazer" title="Infraestrutura do condomínio" items={property.condoFeatures} icon="building" />
          </div>
        )}
      </div>
      <div className={wrap + ' empty:hidden'}>
        <PropertyFAQ property={property} />
      </div>
    </div>
  )
}

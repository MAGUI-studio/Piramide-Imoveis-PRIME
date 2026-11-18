import type {ReactNode} from 'react'
import {cinemaAction, eyebrow, heading, wrap} from '../lib/classes'
import type {Picture} from '../lib/image'
import type {Property} from '../lib/model'
import {CinemaIcon} from './cinemaIcon'
import {Gallery} from './media'

const currency = new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'})
const label = eyebrow + ' text-[.68rem] text-piramide'

export function PropertyPurchase({property, link}: {property: Property; link: string | null}) {
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
    <aside className="min-w-0" aria-labelledby="cinema-purchase">
      <h2 id="cinema-purchase" className={label}>Valor de venda</h2>
      <p className="mt-2 mb-3 text-[clamp(1.45rem,2.55vw,2.35rem)] leading-tight font-semibold tracking-tight tabular-nums">{property.price ? currency.format(property.price) : 'Sob consulta'}</p>
      {!!fees.length && (
        <dl className="flex flex-wrap gap-x-6 gap-y-3 text-xs text-[#625768]">
          {fees.map(({label, value}) => <div key={label}><dt>{label}</dt><dd className="mt-0.5 font-medium text-[#251d29] tabular-nums">{value ? currency.format(value) : 'Isento'}</dd></div>)}
        </dl>
      )}
      {!!conditions.length && <ul className="mt-3.5 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-piramide">{conditions.map((condition) => <li key={String(condition)}>{condition}</li>)}</ul>}
      {(link || property.externalListingUrl) && (
        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          {link && <a className={cinemaAction + ' border-transparent bg-piramide text-white hover:bg-[#794074]'} href={link} target="_blank" rel="noopener noreferrer"><CinemaIcon name="chat" /> Falar pelo WhatsApp <CinemaIcon name="external" /></a>}
          {property.externalListingUrl && <a className={cinemaAction + ' border-piramide/20 bg-white/70 text-piramide backdrop-blur-sm hover:border-piramide hover:bg-white'} href={property.externalListingUrl} target="_blank" rel="noopener noreferrer">Ver no site da Pirâmide <CinemaIcon name="external" /></a>}
        </div>
      )}
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

export function CinemaDetails({property, link, photos, mediaActions, technicalSheet}: {
  property: Property
  link: string | null
  photos: Picture[]
  mediaActions: ReactNode
  technicalSheet: ReactNode
}) {
  const featurePanels = property.features?.length || property.condoFeatures?.length
  return (
    <div className="bg-paper pb-[clamp(3rem,7vw,7rem)] text-[#251d29]">
      <section className={wrap + ' grid gap-[clamp(1.75rem,5vw,5rem)] pt-[clamp(2rem,4.5vw,4.5rem)] pb-2 min-[53rem]:grid-cols-[minmax(0,1.6fr)_minmax(17.5rem,1fr)]'} aria-labelledby="cinema-overview">
        <div>
          <h2 id="cinema-overview" className={label}>{property.propertyType}</h2>
          <p className="mt-2.5 max-w-[52ch] text-[clamp(1rem,1.3vw,1.125rem)] leading-relaxed text-[#625768]">{property.summary}</p>
        </div>
        <PropertyPurchase property={property} link={link} />
      </section>
      <section className="pt-[clamp(1.75rem,4vw,3.5rem)] pb-[clamp(2.5rem,6vw,5rem)]" aria-labelledby="cinema-gallery">
        <div className={wrap}>
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 id="cinema-gallery" className={heading + ' text-[clamp(2rem,4vw,3.65rem)]'}>Galeria</h2>
            <p className="shrink-0 text-xs text-[#625768] tabular-nums">{photos.length} {photos.length === 1 ? 'foto' : 'fotos'}</p>
          </div>
          <Gallery photos={photos} layout="strip">{mediaActions}</Gallery>
        </div>
      </section>
      <div className={wrap + ' grid gap-[clamp(2.75rem,6vw,5rem)] pt-3 sm:pt-6'}>
        <section className="grid gap-4 lg:grid-cols-4 lg:gap-8" aria-labelledby="cinema-description">
          <h2 id="cinema-description" className={heading + ' text-[clamp(1.65rem,3vw,2.7rem)]'}>Sobre o imóvel</h2>
          <p className="max-w-[68ch] text-base leading-[1.8] whitespace-pre-line text-[#514954] lg:col-span-3">{property.description}</p>
        </section>
        {technicalSheet}
        {!!featurePanels && <div className="grid gap-9 sm:grid-cols-2 sm:gap-8">
          <FeaturePanel title="Diferenciais do imóvel" items={property.features} icon="sparkle" />
          <FeaturePanel title="Infraestrutura do condomínio" items={property.condoFeatures} icon="building" />
        </div>}
      </div>
    </div>
  )
}

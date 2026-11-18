import {ArrowUpRight} from 'lucide-react'
import {heading, wrap} from '../lib/classes'
import type {Property} from '../lib/model'
import {PropertyMap} from './propertyMap'

export function propertyLocationOf(property: Property) {
  const address = property.address
  const street = [address?.street?.trim(), address?.number?.trim()].filter(Boolean).join(', ')
  const complement = address?.complement?.trim()
  const postalCode = address?.postalCode?.trim().replace(/^(\d{5})(\d{3})$/, '$1-$2')
  const city = [property.city?.name, address?.state].filter(Boolean).join(' – ')
  const locality = [property.neighborhood?.name, city].filter(Boolean).join(', ')
  const point = address?.point
  const coordinates = point && Number.isFinite(point.lat) && Number.isFinite(point.lng) &&
    Math.abs(point.lat) <= 85.05112878 && Math.abs(point.lng) <= 180 ? point : null

  if (!street && !complement && !postalCode && !address?.state && !coordinates) return null
  const lines = [street, complement, locality, postalCode && 'CEP ' + postalCode].filter(Boolean)
  return {lines, coordinates, approximate: address?.approximate === true}
}

export function PropertyLocation({title, location}: {title: string; location: NonNullable<ReturnType<typeof propertyLocationOf>>}) {
  const {lines, coordinates, approximate} = location
  const href = coordinates
    ? 'https://www.openstreetmap.org/?mlat=' + coordinates.lat + '&mlon=' + coordinates.lng + '#map=' + (approximate ? 15 : 17) + '/' + coordinates.lat + '/' + coordinates.lng
    : 'https://www.openstreetmap.org/search?query=' + encodeURIComponent(lines.join(', '))
  return (
    <section id="localizacao" aria-labelledby="titulo-localizacao" className="w-full scroll-mt-6 bg-paper">
      <div className={wrap + ' flex flex-wrap items-end justify-between gap-x-6 gap-y-4 pb-5 sm:pb-6'}>
        <div className="grid gap-2">
          <h2 id="titulo-localizacao" className={heading + ' text-[clamp(1.65rem,3vw,2.65rem)] text-zinc-900'}>Localização</h2>
          {!!lines.length && (
            <address className="text-sm leading-relaxed font-medium not-italic text-zinc-700 sm:text-[.9375rem]">
              {lines.map((line, index) => <div key={index}>{line}</div>)}
            </address>
          )}
          {approximate && coordinates && <p className="text-xs leading-relaxed text-zinc-600">Ponto aproximado no mapa</p>}
        </div>
        <a href={href} target="_blank" rel="noreferrer" className="inline-flex min-h-11 w-fit items-center gap-2.5 border border-[#dedbd4] bg-white px-4 text-sm font-semibold text-zinc-900 transition-colors hover:border-piramide hover:text-piramide">
          Ver no mapa
          <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </div>
      {coordinates && (
        <div className="h-[clamp(18rem,34vw,30rem)] w-full border-t border-[#dedbd4]">
          <PropertyMap {...coordinates} title={title} approximate={approximate} />
        </div>
      )}
    </section>
  )
}

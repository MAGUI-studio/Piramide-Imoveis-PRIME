import {ArrowUpRight, MapPin} from 'lucide-react'
import {eyebrow, heading, wrap} from '../lib/classes'
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
    <section id="localizacao" aria-labelledby="titulo-localizacao" className="w-full scroll-mt-6 bg-paper text-espresso">
      <div className={wrap + ' grid items-center gap-x-[clamp(2rem,6vw,6rem)] gap-y-5 pb-7 md:grid-cols-[minmax(0,.85fr)_minmax(0,1fr)] md:pb-9'}>
        <div className="grid gap-2.5">
          <p className={eyebrow + ' text-piramide'}>Conheça o entorno</p>
          <h2 id="titulo-localizacao" className={heading + ' text-[clamp(2rem,4vw,3.5rem)]'}>Localização</h2>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4 md:gap-x-8">
          {(lines.length > 0 || (approximate && coordinates)) && (
            <div className="flex min-w-0 items-start gap-3">
              <MapPin className="mt-0.5 size-5 shrink-0 text-piramide" aria-hidden="true" />
              <div className="min-w-0">
                {!!lines.length && (
                  <address className="text-sm leading-relaxed font-medium not-italic text-espresso sm:text-base">
                    {lines.map((line, index) => <div key={index}>{line}</div>)}
                  </address>
                )}
                {approximate && coordinates && <p className="text-xs leading-relaxed text-earth">Ponto aproximado no mapa</p>}
              </div>
            </div>
          )}
          <a href={href} target="_blank" rel="noreferrer" className="inline-flex min-h-11 shrink-0 items-center gap-2 border border-rule px-3.5 text-sm font-semibold transition-colors hover:border-piramide hover:text-piramide">
            Ver no mapa
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </div>
      </div>
      {coordinates && (
        <div className="prime-map relative isolate h-[clamp(18rem,34vw,30rem)] w-full overflow-hidden rounded-t-xl bg-[#eeece7] md:rounded-t-2xl">
          <PropertyMap {...coordinates} title={title} approximate={approximate} />
          <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer"
            className="absolute end-0 bottom-0 z-500 bg-coal/90 px-2 py-0.5 text-[11px] text-zinc-200 underline-offset-2 hover:underline">
            © OpenStreetMap contributors
          </a>
        </div>
      )}
    </section>
  )
}

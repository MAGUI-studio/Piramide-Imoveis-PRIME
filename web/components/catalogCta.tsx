import {ArrowUpRight} from 'lucide-react'
import {heading, sweepButton, sweepFill, wrap} from '../lib/classes'
import {footerPhoto} from '../lib/image'
import {Frame} from './media'
import {Reveal} from './motion'

export function CatalogCta({contact}: {contact: string | null}) {
  return (
    <section className="relative isolate overflow-hidden bg-coal text-white" aria-labelledby="catalog-contact-title">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <Frame photo={footerPhoto} className="size-full object-cover object-[65%_center] opacity-50" />
        <div className="absolute inset-0 bg-linear-to-r from-coal/95 via-coal/65 to-coal/20" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-coal to-transparent" />
      </div>
      <Reveal className={wrap + ' py-16 sm:py-24 motion-safe:opacity-0 motion-safe:data-[entered=true]:opacity-100 motion-safe:data-[entered=true]:animate-enter'}>
        <h2 id="catalog-contact-title" className={heading + ' max-w-[20ch] text-[clamp(2rem,4vw,4rem)]'}>
          Ainda procura o imóvel ideal?
        </h2>
        <p className="mt-5 max-w-[48ch] text-base leading-relaxed text-white/85 sm:text-lg">
          Conte quais regiões, características e valores fazem sentido para você. Nossa equipe ajuda a selecionar as opções.
        </p>
        {contact && (
          <a href={contact} target="_blank" rel="noreferrer" className={sweepButton + ' mt-7 border-white/65 bg-white px-5 py-3.5 text-sm font-semibold text-espresso'}>
            <span aria-hidden="true" className={sweepFill} />
            <span className="relative z-10 inline-flex items-center gap-3 group-hover/cta:text-white group-focus-visible/cta:text-white">
              Falar com um especialista <ArrowUpRight size={17} aria-hidden="true" />
            </span>
          </a>
        )}
      </Reveal>
    </section>
  )
}

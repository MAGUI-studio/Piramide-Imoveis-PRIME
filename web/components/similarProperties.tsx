import Link from 'next/link'
import {ArrowUpRight, BedDouble, CarFront, MapPin, Ruler} from 'lucide-react'
import {eyebrow, homeSectionHeading, wrap} from '../lib/classes'
import {picture} from '../lib/image'
import {cardAreaOf, locationOf, propertyPrice, propertyRentPrice, type PropertyCard} from '../lib/model'
import {DragCarousel} from './dragCarousel'
import {Frame} from './media'

export function SimilarProperties({items}: {items: PropertyCard[]}) {
  if (!items.length) return null
  return <section aria-labelledby="similar-properties-title" className="bg-paper py-12 text-ink sm:py-16">
    <div className={wrap + ' mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-8'}>
      <div><p className={eyebrow + ' mb-2 text-[.65rem] text-piramide'}>Continue explorando</p><h2 id="similar-properties-title" className={homeSectionHeading}>Imóveis semelhantes</h2></div>
      <Link href="/imoveis" className="group/all inline-flex min-h-11 items-center gap-2 text-sm font-medium text-piramide">Ver todos os imóveis <ArrowUpRight size={16} aria-hidden="true" className="motion-safe:transition-[translate] motion-safe:group-hover/all:translate-x-1 motion-safe:group-hover/all:-translate-y-1" /></Link>
    </div>
    <div className={wrap}>
      <DragCarousel className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden">
        {items.map((item) => <article key={item.id} className="w-[84%] shrink-0 snap-start sm:w-[62%] md:w-auto md:min-w-0">
          <Link href={'/' + item.slug} draggable={false} className="group/card flex h-full flex-col">
            <div className="relative aspect-[1.35] overflow-hidden bg-espresso/5">
              <Frame photo={picture(item.cover, 1.35, 1200)} sizes="(max-width: 639px) 84vw, (max-width: 767px) 62vw, 33vw" className="size-full object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover/card:scale-105 motion-safe:group-focus-visible/card:scale-105" />
              <span className="absolute top-4 right-4 grid size-9 place-items-center rounded-full bg-white/90 text-coal opacity-0 motion-safe:-translate-x-1 motion-safe:translate-y-1 transition-[opacity,translate] duration-300 group-hover/card:opacity-100 group-focus-visible/card:opacity-100 motion-safe:group-hover/card:translate-x-0 motion-safe:group-hover/card:translate-y-0 motion-safe:group-focus-visible/card:translate-x-0 motion-safe:group-focus-visible/card:translate-y-0 motion-reduce:transition-none"><ArrowUpRight size={18} aria-hidden="true" /></span>
              {item.propertyType && <span className="absolute bottom-4 left-4 bg-black/35 px-2.5 py-1.5 text-[10px] font-medium text-white backdrop-blur-sm">{item.propertyType}</span>}
            </div>
            <div className="flex flex-1 flex-col pt-4">
              <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-secondary"><MapPin size={13} className="mt-0.5 shrink-0" aria-hidden="true" /><span className="line-clamp-2">{locationOf(item)}</span></p>
              <h3 className="mt-2 line-clamp-2 text-xl leading-tight font-medium tracking-tight sm:text-2xl">{item.title}</h3>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-secondary">
                {cardAreaOf(item) && <span className="inline-flex items-center gap-1.5"><Ruler size={14} aria-hidden="true" />{cardAreaOf(item)}</span>}
                {!!item.specifications?.suites && <span className="inline-flex items-center gap-1.5"><BedDouble size={14} aria-hidden="true" />{item.specifications.suites} {item.specifications.suites === 1 ? 'suíte' : 'suítes'}</span>}
                {!!item.specifications?.parking && <span className="inline-flex items-center gap-1.5"><CarFront size={14} aria-hidden="true" />{item.specifications.parking} {item.specifications.parking === 1 ? 'vaga' : 'vagas'}</span>}
              </div>
              <div className="mt-auto flex flex-wrap items-end gap-x-4 gap-y-2 pt-5 tracking-tight text-ink tabular-nums">
                {item.price && item.price > 0 && item.rentPrice && item.rentPrice > 0 ? (
                  <>
                    <div>
                      <span className="mb-0.5 block text-[10px] font-semibold tracking-[0.14em] text-secondary uppercase">Venda</span>
                      <span className="text-base font-semibold sm:text-lg">{propertyPrice(item.price)}</span>
                    </div>
                    <div className="border-l border-rule pl-4">
                      <span className="mb-0.5 block text-[10px] font-semibold tracking-[0.14em] text-secondary uppercase">Locação</span>
                      <span className="text-base font-semibold sm:text-lg">
                        {propertyPrice(item.rentPrice)}
                        <span className="ml-1 text-xs font-medium text-secondary">/ mês</span>
                      </span>
                    </div>
                  </>
                ) : item.rentPrice && item.rentPrice > 0 ? (
                  <div>
                    <span className="mb-0.5 block text-[10px] font-semibold tracking-[0.14em] text-secondary uppercase">Locação</span>
                    <span className="text-lg font-semibold">
                      {propertyPrice(item.rentPrice)}
                      <span className="ml-1 text-xs font-medium text-secondary">/ mês</span>
                    </span>
                  </div>
                ) : (
                  <span className="text-lg font-semibold">{propertyPrice(item.price)}</span>
                )}
              </div>
            </div>
          </Link>
        </article>)}
      </DragCarousel>
    </div>
  </section>
}

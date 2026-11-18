import Link from 'next/link'
import {ArrowUpRight} from 'lucide-react'
import {eyebrow, homeSectionHeading, wrap} from '../lib/classes'
import type {Picture} from '../lib/image'
import {DragCarousel} from './dragCarousel'
import {Frame} from './media'
import {Reveal} from './motion'

export type LifestyleItem = {type: string; count: number; image: Picture}

export function Lifestyle({items}: {items: LifestyleItem[]}) {
  if (!items.length) return null
  return (
    <div id="estilos-de-vida" className="group pt-12 pb-16 sm:pt-20 sm:pb-24">
      <div className={wrap + ' mb-6 sm:mb-8 flex flex-wrap items-end justify-between gap-4'}>
        <div>
          <p className={eyebrow + ' mb-2 text-[.68rem] text-piramide'}>Curadoria por perfil</p>
          <h2 className={homeSectionHeading + ' text-espresso'}>Qual imóvel você procura?</h2>
        </div>
        <p className="max-w-[38ch] text-sm leading-relaxed text-earth sm:text-base">
          Selecione um tipo de imóvel para ver os empreendimentos disponíveis.
        </p>
      </div>
      <DragCarousel className="ml-4 flex gap-4 overflow-x-auto [scrollbar-width:none] after:block after:w-0 after:shrink-0 md:ml-7 md:after:w-3 xl:ml-[max(2.5rem,calc((100%_-_102rem)/2))] xl:after:w-[max(1.5rem,calc((100%_-_102rem)/2_-_1rem))] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => (
          <Reveal key={item.type} className="w-[72vw] shrink-0 sm:w-[44vw] md:w-[31vw] lg:w-[23.5vw] xl:w-[21.5rem] motion-safe:opacity-0 motion-safe:data-[entered=true]:opacity-100 motion-safe:data-[entered=true]:animate-enter">
            <Link
              href={'/?tipo=' + encodeURIComponent(item.type) + '#empreendimentos'}
              draggable={false}
              className="group/card relative isolate block aspect-[3/4] w-full overflow-hidden"
            >
              <div className="absolute inset-0 -z-1">
                <Frame photo={item.image} className="size-full object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out motion-safe:group-hover/card:scale-104 motion-safe:group-focus-visible/card:scale-104" sizes="(max-width: 640px) 72vw, (max-width: 1024px) 44vw, 22rem" />
                <div className="absolute inset-0 bg-[linear-gradient(0deg,#161616e6_0%,#16161666_45%,transparent_75%)]" />
              </div>
              <div className="flex h-full flex-col justify-end p-5 text-ivory sm:p-6">
                <span className="text-[11px] tracking-wider text-ivory/70 uppercase">{item.count} {item.count === 1 ? 'imóvel' : 'imóveis'}</span>
                <div className="mt-1.5 flex items-center justify-between gap-3">
                  <h3 className="min-w-0 text-xl leading-tight font-medium break-words sm:text-2xl">{item.type}</h3>
                  <ArrowUpRight
                    aria-hidden="true"
                    size={18}
                    strokeWidth={1.7}
                    className="shrink-0 text-white opacity-0 group-hover/card:opacity-100 group-focus-visible/card:opacity-100 motion-safe:-translate-x-1 motion-safe:transition-[translate,opacity] motion-safe:duration-300 motion-safe:group-hover/card:translate-x-0 motion-safe:group-focus-visible/card:translate-x-0"
                  />
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </DragCarousel>
    </div>
  )
}

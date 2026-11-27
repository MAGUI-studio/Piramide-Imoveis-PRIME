import Link from 'next/link'
import {ArrowUpRight} from 'lucide-react'
import {eyebrow, homeSectionHeading, wrap} from '../lib/classes'
import type {Picture} from '../lib/image'
import {DragCarousel} from './dragCarousel'
import {Frame} from './media'
import {Reveal} from './motion'

export type LifestyleItem = {type: string; count: number; image: Picture}

function isCondominiumType(type: string) {
  const key = type.normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().toLocaleLowerCase('pt-BR')
  return key === 'condominio' || key === 'condominios'
}

export function Lifestyle({items}: {items: LifestyleItem[]}) {
  if (!items.length) return null
  return (
    <div id="tipos-de-imoveis" className="group pt-12 pb-6 sm:pt-20 sm:pb-8">
      <div className={wrap + ' mb-6 sm:mb-8 flex flex-wrap items-end justify-between gap-4'}>
        <div>
          <p className={eyebrow + ' mb-2 text-[.68rem] text-piramide'}>Curadoria por perfil</p>
          <h2 className={homeSectionHeading + ' text-espresso'}>Qual imóvel você procura?</h2>
        </div>
        <p className="max-w-[38ch] text-sm leading-relaxed text-earth sm:text-base">
          Selecione um tipo de imóvel para ver as opções disponíveis.
        </p>
      </div>
      <Reveal className="motion-safe:opacity-0 motion-safe:data-[entered=true]:opacity-100 motion-safe:data-[entered=true]:animate-enter">
        <DragCarousel className="ml-4 flex gap-4 overflow-x-auto [scrollbar-width:none] after:block after:w-0 after:shrink-0 md:ml-7 md:after:w-3 xl:ml-[max(2.5rem,calc((100%_-_var(--content-max-width))/2))] xl:after:w-[max(1.5rem,calc((100%_-_var(--content-max-width))/2_-_1rem))] [&::-webkit-scrollbar]:hidden">
          {items.map((item) => {
            const isCondo = isCondominiumType(item.type)
            return (
              <div key={item.type} className={(isCondo ? 'w-[78vw] sm:w-[64vw] md:w-[46vw] lg:w-[36vw] xl:w-[33rem]' : 'w-[72vw] sm:w-[44vw] md:w-[31vw] lg:w-[23.5vw] xl:w-[21.5rem]') + ' shrink-0'}>
                <Link
                  href={isCondo ? '/condominios' : '/imoveis?tipo=' + encodeURIComponent(item.type)}
                  draggable={false}
                  className="group/card relative isolate block h-[96vw] w-full overflow-hidden sm:h-[58.667vw] md:h-[41.333vw] lg:h-[31.333vw] xl:h-[28.667rem]"
                >
                  <div className="absolute inset-0 -z-1">
                    <Frame photo={item.image} className="size-full object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out motion-safe:group-hover/card:scale-104 motion-safe:group-focus-visible/card:scale-104" sizes={isCondo ? '(max-width: 639px) 78vw, (max-width: 767px) 64vw, (max-width: 1023px) 46vw, (max-width: 1279px) 36vw, 33rem' : '(max-width: 639px) 72vw, (max-width: 767px) 44vw, (max-width: 1023px) 31vw, (max-width: 1279px) 23.5vw, 21.5rem'} />
                    <div className="absolute inset-0 bg-[linear-gradient(0deg,#0a0a0be6_0%,#0a0a0b66_45%,transparent_75%)]" />
                  </div>
                  <div className="flex h-full flex-col justify-end p-5 text-ivory sm:p-6">
                    <span className="text-[11px] tracking-wider text-ivory/70 uppercase">{isCondo ? 'Explore os condomínios' : item.count + (item.count === 1 ? ' imóvel' : ' imóveis')}</span>
                    <div className="mt-1.5">
                      <h3 title={item.type} className="min-w-0 line-clamp-1 text-xl leading-tight font-medium sm:text-2xl">{item.type}</h3>
                      <ArrowUpRight
                        aria-hidden="true"
                        size={18}
                        strokeWidth={1.7}
                        className="absolute top-5 right-5 text-white opacity-0 group-hover/card:opacity-100 group-focus-visible/card:opacity-100 sm:top-6 sm:right-6 motion-safe:-translate-x-1 motion-safe:transition-[translate,opacity] motion-safe:duration-300 motion-safe:group-hover/card:translate-x-0 motion-safe:group-focus-visible/card:translate-x-0"
                      />
                    </div>
                  </div>
                </Link>
              </div>
            )
          })}
        </DragCarousel>
      </Reveal>
    </div>
  )
}

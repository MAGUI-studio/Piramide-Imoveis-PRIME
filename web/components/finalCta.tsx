import {ArrowUp, ArrowUpRight} from 'lucide-react'
import {heading, wrap} from '../lib/classes'
import type {MarqueeItem} from '../lib/model'
import {Frame} from './media'
import {Reveal} from './motion'
import {ValueProposition} from './valueProposition'

const ctaSlider = 'pointer-events-none absolute inset-0 translate-y-full bg-piramide transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/cta:translate-y-0'

function PropertyMarquee({items}: {items: MarqueeItem[]}) {
  return (
    <section aria-label="Imóveis de alto padrão à venda" className="relative overflow-hidden border-y border-espresso/10 bg-paper py-3.5 text-espresso">
      <div className="flex motion-safe:w-max motion-safe:animate-property-marquee">
        {[false, true].map((duplicate) => (
          <ul key={String(duplicate)} aria-hidden={duplicate || undefined} className={'flex items-center gap-x-8 gap-y-2 px-5 motion-safe:min-w-[110rem] motion-safe:shrink-0 motion-safe:justify-between motion-safe:whitespace-nowrap motion-reduce:flex-wrap ' + (duplicate ? 'motion-reduce:hidden' : '')}>
            {items.map(({_key, title, description}, index) => (
              <li key={_key} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs">
                <span aria-hidden="true" className="font-bold text-piramide">{String(index + 1).padStart(2, '0')}</span>
                <strong className="font-extrabold tracking-wide uppercase">{title}</strong>
                <span className="text-earth">— {description}</span>
                <span aria-hidden="true" className="ml-4 font-bold text-espresso/25 motion-reduce:hidden">/</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  )
}

export function FinalCta({contact, marquee}: {contact: string | null; marquee: MarqueeItem[]}) {
  return (
    <>
      {!!marquee.length && <PropertyMarquee items={marquee} />}
      <div className="relative isolate overflow-hidden bg-coal text-white">
        <div className="absolute inset-0 -z-2 opacity-[.28] md:opacity-100">
          <Frame photo={{src: '/brand/home/residencia-ao-anoitecer.webp', alt: ''}} className="size-full object-cover object-[65%_center] md:object-center" />
        </div>
        <div aria-hidden="true" className="absolute inset-0 -z-1 md:bg-[linear-gradient(90deg,#101010d9_0%,#101010a6_44%,#10101052_75%,#10101038_100%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -z-1 h-[clamp(10rem,20vw,21rem)] bg-linear-to-t from-coal from-25% via-coal/85 via-50% to-transparent" />
        <ValueProposition />
        <Reveal id="contato" className={wrap + ' flex min-h-[24rem] flex-col items-start justify-center pt-8 pb-24 motion-safe:data-[entered=true]:animate-enter md:min-h-[30rem] md:pb-28 lg:pb-32'}>
          <h2 className={heading + ' max-w-[16ch] text-[clamp(2.4rem,5.6vw,5.5rem)]'}>
            Encontre o imóvel certo com um especialista
          </h2>
          <p className="mt-6 max-w-[48ch] text-base font-normal text-white/90 sm:text-lg">
            Conte o que você procura e receba uma seleção de imóveis de acordo com suas preferências.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            {contact && (
              <a href={contact} target="_blank" rel="noreferrer" className="group/cta relative inline-flex select-none items-center justify-center overflow-hidden border border-white/65 bg-white px-5 py-3.5 text-sm font-medium text-espresso transition-all duration-300 hover:border-piramide active:scale-[0.98] sm:text-base">
                <span aria-hidden="true" className={ctaSlider} />
                <span className="relative z-10 inline-flex items-center gap-2.5 transition-colors duration-300 group-hover/cta:text-white">
                  Falar com especialista <ArrowUpRight size={18} className="transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5 motion-reduce:transition-none" />
                </span>
              </a>
            )}
            <a href="#empreendimentos" className="group/explore inline-flex items-center gap-2.5 text-sm font-medium text-white transition-colors hover:text-white/75 sm:text-base">
              Ver imóveis <ArrowUp aria-hidden="true" size={18} className="transition-transform duration-300 group-hover/explore:-translate-y-1 motion-reduce:transition-none" />
            </a>
          </div>
        </Reveal>
      </div>
    </>
  )
}

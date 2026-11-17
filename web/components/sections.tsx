import Link from 'next/link'
import {ArrowUp, ArrowUpRight} from 'lucide-react'
import {eyebrow, heading, homeSectionHeading, wrap} from '../lib/classes'
import type {Picture} from '../lib/image'
import type {MarqueeItem} from '../lib/model'
import {Frame} from './media'
import {DragCarousel} from './dragCarousel'
import {Reveal} from './motion'

const hidden = 'opacity-0 motion-reduce:opacity-100 group-data-[entered=true]:animate-rise motion-reduce:animate-none'

function Words({text, className = '', start = 0, step = 70}: {text: string; className?: string; start?: number; step?: number}) {
  return <span className={className}>
    {text.split(' ').map((word, i) => (
      <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
        <span className={'inline-block ' + hidden} style={{animationDelay: start + i * step + 'ms'}}>{word}&nbsp;</span>
      </span>
    ))}
  </span>
}

function Arrow({size = 18}: {size?: number}) {
  return <ArrowUpRight size={size} className="transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5 motion-reduce:transition-none" />
}

const ctaSlider = 'pointer-events-none absolute inset-0 translate-y-full bg-piramide transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/cta:translate-y-0'

/* 1. Proposta de valor */
const pillars = [
  {title: 'Curadoria', text: 'Cada imóvel é visitado e avaliado antes de chegar até você.'},
  {title: 'Atendimento exclusivo', text: 'Um especialista dedicado do primeiro contato à entrega das chaves.'},
  {title: 'Negociação segura', text: 'Assessoria jurídica e documental em todas as etapas.'},
]

export function ValueProposition() {
  return <Reveal id="diferenciais" className={'group ' + wrap + ' py-[clamp(48px,7vw,104px)]'}>
    <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
      <h2 className={homeSectionHeading + ' max-w-[24ch] text-espresso'}>
        <Words text="O endereço certo começa com quem entende de alto padrão." start={120} />
      </h2>
      <p className={'max-w-[56ch] text-sm font-light leading-relaxed text-earth sm:text-base lg:justify-self-end ' + hidden} style={{animationDelay: '600ms'}}>
        Selecionamos os imóveis mais desejados da região e conduzimos cada negociação com discrição, técnica e cuidado.
      </p>
    </div>
    <div className="mt-12 grid gap-10 sm:mt-14 md:grid-cols-3 md:gap-12">
      {pillars.map((pillar, i) => (
        <div key={pillar.title} className="relative isolate py-4">
          <span aria-hidden="true" className="pointer-events-none absolute -top-2 right-0 -z-1 select-none text-[clamp(5.5rem,8vw,8rem)] leading-none font-bold tracking-tighter text-espresso/[0.045]">
            0{i + 1}
          </span>
          <div className={hidden} style={{animationDelay: 800 + i * 150 + 'ms'}}>
            <h3 className="text-lg font-medium tracking-tight text-espresso sm:text-xl">{pillar.title}</h3>
            <p className="mt-2.5 max-w-[32ch] text-sm font-light leading-relaxed text-earth">{pillar.text}</p>
          </div>
        </div>
      ))}
    </div>
  </Reveal>
}

/* 4. Busca por estilo de vida */
export type LifestyleItem = {type: string; count: number; image: Picture}

export function Lifestyle({items}: {items: LifestyleItem[]}) {
  if (!items.length) return null
  return <Reveal id="estilos-de-vida" className="group py-[clamp(56px,8vw,120px)]">
    <div className={wrap + ' mb-10 flex flex-wrap items-end justify-between gap-4'}>
      <h2 className={homeSectionHeading + ' text-espresso'}><Words text="Qual imóvel você procura?" start={100} /></h2>
      <p className={'max-w-[38ch] text-sm font-light text-earth sm:text-base ' + hidden} style={{animationDelay: '400ms'}}>Selecione um tipo de imóvel para ver os empreendimentos disponíveis.</p>
    </div>
    <DragCarousel className="ml-[1.125rem] flex gap-4 overflow-x-auto [scrollbar-width:none] after:block after:w-[0.125rem] after:shrink-0 md:ml-[2.25rem] md:after:w-[1.25rem] xl:ml-[max(3.5rem,calc((100%_-_96rem)/2))] xl:after:w-[max(2.5rem,calc((100%_-_96rem)/2_-_1rem))] [&::-webkit-scrollbar]:hidden">
      {items.map((item, i) => (
        <Link key={item.type} href={'/?tipo=' + encodeURIComponent(item.type) + '#empreendimentos'}
          draggable={false}
          className={'group/card relative isolate block aspect-[3/4] w-[72vw] shrink-0 snap-start overflow-hidden sm:w-[44vw] md:w-[31vw] lg:w-[23.5vw] xl:w-[21.5rem] ' + hidden}
          style={{animationDelay: 300 + i * 120 + 'ms'}}>
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
      ))}
    </DragCarousel>
  </Reveal>
}

/* 8. CTA final */
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

export function FinalCta({image, contact, marquee}: {image?: Picture; contact: string | null; marquee: MarqueeItem[]}) {
  return <>
    {!!marquee.length && <PropertyMarquee items={marquee} />}
    <section id="contato" className="relative isolate overflow-hidden bg-coal text-white">
      {image && <div aria-hidden="true" className="absolute inset-0 -z-2 overflow-hidden">
        <Frame photo={image} className="size-full object-cover object-center" sizes="(min-width: 1760px) 1760px, 100vw" />
      </div>}
      <div aria-hidden="true" className="absolute inset-0 -z-1 bg-[linear-gradient(0deg,#101010f5_0%,#101010d9_40%,#1010108c_70%,#1010101a_100%)] md:bg-[linear-gradient(90deg,#101010e6_0%,#101010bd_35%,#10101060_58%,#1010100d_85%)]" />
      {image && <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -z-1 h-[clamp(10rem,20vw,21rem)] bg-linear-to-t from-coal from-25% via-coal/85 via-50% to-transparent" />}
      <Reveal className={wrap + ' flex min-h-[31rem] flex-col items-start justify-end pt-32 pb-24 motion-safe:data-[entered=true]:animate-enter md:min-h-[36rem] md:justify-center md:pt-20 md:pb-28 lg:pt-28 lg:pb-32'}>
        <h2 className={heading + ' max-w-[16ch] text-[clamp(2.4rem,5.6vw,5.5rem)]'}>
          Encontre o imóvel certo com um especialista
        </h2>
        <p className="mt-6 max-w-[48ch] text-base font-normal text-white/90 sm:text-lg">
          Conte o que você procura e receba uma seleção de imóveis de acordo com suas preferências.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
          {contact && <a href={contact} target="_blank" rel="noreferrer" className="group/cta relative inline-flex select-none items-center justify-center overflow-hidden border border-white/65 bg-white px-5 py-3.5 text-sm font-medium text-espresso transition-all duration-300 hover:border-piramide active:scale-[0.98] sm:text-base">
            <span aria-hidden="true" className={ctaSlider} />
            <span className="relative z-10 inline-flex items-center gap-2.5 transition-colors duration-300 group-hover/cta:text-white">Falar com especialista <Arrow /></span>
          </a>}
          <a href="#empreendimentos" className="group/explore inline-flex items-center gap-2.5 text-sm font-medium text-white transition-colors hover:text-white/75 sm:text-base">
            Ver imóveis <ArrowUp aria-hidden="true" size={18} className="transition-transform duration-300 group-hover/explore:-translate-y-1 motion-reduce:transition-none" />
          </a>
        </div>
      </Reveal>
    </section>
  </>
}

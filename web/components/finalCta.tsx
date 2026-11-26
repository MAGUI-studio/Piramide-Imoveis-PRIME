import {ArrowUpRight} from 'lucide-react'
import {sweepButton, sweepFill, sweepSolid, sweepContent, wrap} from '../lib/classes'
import {picture} from '../lib/image'
import {getSiteSettings, isPreview} from '../lib/sanity'
import type {MarqueeItem} from '../lib/model'
import {Frame} from './media'
import {Reveal} from './motion'
import {ValueProposition} from './valueProposition'


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

export async function FinalCta({contact, marquee}: {contact: string | null; marquee: MarqueeItem[]}) {
  const settings = await getSiteSettings(await isPreview())
  const content = settings.homeCta
  return (
    <>
      {!!marquee.length && <PropertyMarquee items={marquee} />}
      <div className="relative isolate overflow-hidden bg-[#070708] text-[#f5f2ec]">
        <div className="absolute inset-0 -z-2 opacity-75 md:opacity-90">
          {content?.image?.asset && <Frame photo={picture(content.image, 16 / 9)} className="size-full object-cover object-[65%_center] md:object-center" />}
        </div>
        <div aria-hidden="true" className="absolute inset-0 -z-1 bg-linear-to-r from-[#070708]/80 via-[#070708]/50 to-[#070708]/20" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -z-1 h-28 bg-linear-to-t from-[#070708] via-[#070708]/55 to-transparent" />
        <ValueProposition content={settings.differentiators} />
        {content?.title && (
          <Reveal
            id="contato"
            className={
              wrap +
              ' flex flex-col items-start justify-between gap-8 py-20 sm:py-28 lg:flex-row lg:items-center lg:gap-12 motion-safe:data-[entered=true]:animate-enter'
            }
          >
            <div className="min-w-0 flex-1 space-y-4">
              <h2 className="font-sans text-[clamp(2rem,3.6vw,3.35rem)] leading-[1.08] font-semibold tracking-tight text-white">
                {content.title}
              </h2>
              {content.description && (
                <p className="text-sm leading-relaxed text-zinc-300 sm:text-base">
                  {content.description}
                </p>
              )}
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-4">
              {contact && content.buttonLabel && (
                <a
                  href={contact}
                  target="_blank"
                  rel="noreferrer"
                  className={
                    sweepButton +
                    ' min-h-13 shrink-0 px-7 py-3.5 text-sm font-semibold sm:text-base ' +
                    sweepSolid
                  }
                >
                  <span aria-hidden="true" className={sweepFill} />
                  <span className={sweepContent + ' gap-2.5'}>
                    <span>{content.buttonLabel}</span>
                    <ArrowUpRight
                      size={18}
                      aria-hidden="true"
                      className="shrink-0 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5 motion-reduce:transition-none"
                    />
                  </span>
                </a>
              )}

            </div>
          </Reveal>
        )}
      </div>
    </>
  )
}

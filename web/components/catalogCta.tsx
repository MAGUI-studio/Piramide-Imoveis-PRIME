import {ArrowUpRight} from 'lucide-react'
import {sweepButton, sweepContent, sweepFill, sweepSolid, wrap} from '../lib/classes'
import {picture} from '../lib/image'
import {getSiteSettings, isPreview} from '../lib/sanity'
import {Frame} from './media'
import {Reveal} from './motion'

export async function CatalogCta({contact}: {contact: string | null}) {
  const content = (await getSiteSettings(await isPreview())).catalogCta
  if (!content?.title) return null

  return (
    <section
      className="relative isolate overflow-hidden bg-[#070708] text-[#f5f2ec]"
      aria-labelledby="catalog-contact-title"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {content.image?.asset && (
          <Frame
            photo={picture(content.image, 16 / 9)}
            className="size-full object-cover object-[65%_center] opacity-75 md:opacity-90"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-r from-[#070708]/80 via-[#070708]/50 to-[#070708]/20" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-[#070708] via-[#070708]/55 to-transparent" />
      </div>

      <Reveal
        className={
          wrap +
          ' flex flex-col items-start justify-between gap-8 py-20 sm:py-28 lg:flex-row lg:items-center lg:gap-12 motion-safe:opacity-0 motion-safe:data-[entered=true]:opacity-100 motion-safe:data-[entered=true]:animate-enter'
        }
      >
        <div className="min-w-0 flex-1 space-y-4">
          <h2
            id="catalog-contact-title"
            className="font-sans text-[clamp(2rem,3.6vw,3.35rem)] leading-[1.08] font-semibold tracking-tight text-white"
          >
            Encontre o imóvel perfeito com nossa curadoria
          </h2>
          {content.description && (
            <p className="text-sm leading-relaxed text-zinc-300 sm:text-base">
              {content.description}
            </p>
          )}
        </div>

        {contact && (
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
              <span>{content.buttonLabel || 'Falar com um especialista'}</span>
              <ArrowUpRight
                size={18}
                aria-hidden="true"
                className="shrink-0 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5 motion-reduce:transition-none"
              />
            </span>
          </a>
        )}
      </Reveal>
    </section>
  )
}

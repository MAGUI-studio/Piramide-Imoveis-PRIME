import {ArrowUpRight} from 'lucide-react'
import {sweepRegular, sweepSolid, sweepContent, eyebrow, heading, sweepButton, sweepFill, wrap} from '../lib/classes'
import {picture} from '../lib/image'
import {getSiteSettings, isPreview} from '../lib/sanity'
import {Frame} from './media'
import {Reveal} from './motion'

export async function CatalogCta({contact}: {contact: string | null}) {
  const content = (await getSiteSettings(await isPreview())).catalogCta
  if (!content?.title) return null
  return (
    <section className="relative isolate overflow-hidden bg-coal text-white" aria-labelledby="catalog-contact-title">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {content.image?.asset && <Frame photo={picture(content.image, 16 / 9)} className="size-full object-cover object-[65%_center] opacity-50" />}
        <div className="absolute inset-0 bg-linear-to-r from-coal/95 via-coal/65 to-coal/20" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-coal to-transparent" />
      </div>
      <Reveal className={wrap + ' py-16 sm:py-24 motion-safe:opacity-0 motion-safe:data-[entered=true]:opacity-100 motion-safe:data-[entered=true]:animate-enter'}>
        {content.eyebrow && <p className={eyebrow + ' mb-3 text-ivory/75'}>{content.eyebrow}</p>}
        <h2 id="catalog-contact-title" className={heading + ' max-w-[20ch] text-[clamp(2rem,4vw,4rem)]'}>
          {content.title}
        </h2>
        <p className="mt-5 max-w-[48ch] text-base leading-relaxed text-white/85 sm:text-lg">
          {content.description}
        </p>
        {contact && content.buttonLabel && (
          <a href={contact} target="_blank" rel="noreferrer" className={sweepButton + sweepRegular + ' mt-7 ' + sweepSolid}>
            <span aria-hidden="true" className={sweepFill} />
            <span className={sweepContent}>
              {content.buttonLabel} <ArrowUpRight size={17} aria-hidden="true" />
            </span>
          </a>
        )}
      </Reveal>
    </section>
  )
}

import {eyebrow, homeSectionHeading, riseIn, wrap} from '../lib/classes'
import {Reveal, Words} from './motion'

import type {SiteSettings} from '../lib/siteSettings'

export function ValueProposition({content}: {content: SiteSettings['differentiators']}) {
  if (!content?.title) return null
  const pillars = content.items || []
  return (
    <section id="por-que-escolher-a-piramide" className="relative text-ivory">
      <div className={wrap + ' py-[clamp(56px,8vw,116px)]'}>
        <Reveal className="group grid gap-6 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
          <div>
            <p className={eyebrow + ' mb-3 text-[.68rem] text-piramide'}>{content.eyebrow}</p>
            <h2 className={homeSectionHeading + ' max-w-[24ch] text-ivory'}>
              <Words text={content.title} start={120} />
            </h2>
          </div>
          <p className={'max-w-[56ch] text-sm font-light leading-relaxed text-ivory/90 sm:text-base lg:justify-self-end ' + riseIn} style={{animationDelay: '600ms'}}>
            {content.description}
          </p>
        </Reveal>
        <div className="mt-12 grid gap-10 sm:mt-14 md:grid-cols-3 md:gap-12">
          {pillars.map((pillar, i) => (
            <Reveal key={pillar._key} className="flex items-start gap-4 py-4 lg:gap-5 motion-safe:opacity-0 motion-safe:data-[entered=true]:opacity-100 motion-safe:data-[entered=true]:animate-enter">
              <span aria-hidden="true" className="shrink-0 select-none text-[clamp(3rem,4.5vw,5rem)] leading-none font-bold tracking-tighter text-white/25">
                0{i + 1}
              </span>
              <div>
                <h3 className="text-lg font-medium tracking-tight text-ivory sm:text-xl">{pillar.title}</h3>
                <p className="mt-2.5 max-w-[32ch] text-sm font-light leading-relaxed text-ivory/90">{pillar.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

import {eyebrow, homeSectionHeading, riseIn, wrap} from '../lib/classes'
import type {HomeStat} from '../lib/model'
import {CountUp, Reveal, Words} from './motion'

import type {ContentIntro} from '../lib/siteSettings'

export function HomeStats({stats, intro}: {stats: HomeStat[]; intro?: ContentIntro | null}) {
  const entries = stats.filter(({label, value}) => label && Number.isFinite(value) && value >= 0)
  if (!entries.length) return null
  return (
    <div id="numeros" aria-labelledby="home-stats-title" className={'group ' + wrap + ' pt-6 pb-12 sm:pt-8 sm:pb-16'}>
      <Reveal className="group grid gap-6 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
        <div>
          <p className={eyebrow + ' mb-3 text-[.68rem] text-piramide'}>{intro?.eyebrow}</p>
          <h2 id="home-stats-title" className={homeSectionHeading + ' max-w-[22ch] text-espresso'}>
            {intro?.title && <Words text={intro.title} start={100} />}
          </h2>
        </div>
        <p className={'max-w-[44ch] text-sm font-light leading-relaxed text-earth sm:text-base lg:justify-self-end ' + riseIn} style={{animationDelay: '400ms'}}>
          {intro?.description}
        </p>
      </Reveal>
      <dl className={'mt-12 grid gap-10 sm:mt-16 sm:grid-cols-2 lg:gap-12 ' + (entries.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4')}>
        {entries.map(({_key, label, value, prefix, suffix}) => (
          <Reveal
            key={_key}
            className="flex flex-col-reverse py-2 motion-safe:opacity-0 motion-safe:data-[entered=true]:opacity-100 motion-safe:data-[entered=true]:animate-enter"
          >
            <dt className="mt-2.5 text-sm font-light leading-relaxed text-earth sm:text-base">{label}</dt>
            <dd className="flex items-baseline gap-1 text-[clamp(2.75rem,4.8vw,4.5rem)] leading-none font-bold tracking-tighter text-espresso tabular-nums">
              {prefix && <span className="font-light text-piramide">{prefix}</span>}
              <CountUp value={value} />
              {suffix && <span className="ms-1 text-[0.55em] font-medium text-piramide">{suffix}</span>}
            </dd>
          </Reveal>
        ))}
      </dl>
    </div>
  )
}

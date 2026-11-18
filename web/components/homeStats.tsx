import {eyebrow, homeSectionHeading, wrap} from '../lib/classes'
import type {HomeStat} from '../lib/model'
import {CountUp, Reveal, Words, riseIn} from './motion'

const fallbackStats: HomeStat[] = [
  {_key: 'years', label: 'Anos de tradição no mercado', value: 45, prefix: '+'},
  {_key: 'sales', label: 'Número de vendas realizadas', value: 50000, prefix: '+'},
  {_key: 'clients', label: 'Clientes atendidos na região', value: 120000, prefix: '+'},
  {_key: 'curated', label: 'Imóveis de alto padrão avaliados', value: 3500, prefix: '+'},
]

export function HomeStats({stats}: {stats: HomeStat[]}) {
  const entries = stats.length ? stats : fallbackStats
  return (
    <Reveal id="numeros" aria-labelledby="home-stats-title" className={'group ' + wrap + ' py-[clamp(56px,8vw,116px)]'}>
      <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
        <div>
          <p className={eyebrow + ' mb-3 text-[.68rem] text-piramide'}>Trajetória em números</p>
          <h2 id="home-stats-title" className={homeSectionHeading + ' max-w-[22ch] text-espresso'}>
            <Words text="Tradição e resultado que constroem confiança." start={100} />
          </h2>
        </div>
        <p className={'max-w-[44ch] text-sm font-light leading-relaxed text-earth sm:text-base lg:justify-self-end ' + riseIn} style={{animationDelay: '400ms'}}>
          Mais de quatro décadas liderando o mercado imobiliário de São José dos Campos e região.
        </p>
      </div>
      <dl className={'mt-12 grid gap-10 sm:mt-16 sm:grid-cols-2 lg:gap-12 ' + (entries.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4')}>
        {entries.map(({_key, label, value, prefix, suffix}, i) => (
          <div
            key={_key}
            className={'flex flex-col-reverse py-2 ' + riseIn}
            style={{animationDelay: 300 + i * 120 + 'ms'}}
          >
            <dt className="mt-2.5 text-sm font-light leading-relaxed text-earth sm:text-base">{label}</dt>
            <dd className="flex items-baseline gap-1 text-[clamp(2.75rem,4.8vw,4.5rem)] leading-none font-bold tracking-tighter text-espresso tabular-nums">
              {prefix && <span className="font-light text-piramide">{prefix}</span>}
              <CountUp value={value} />
              {suffix && <span className="ms-1 text-[0.55em] font-medium text-piramide">{suffix}</span>}
            </dd>
          </div>
        ))}
      </dl>
    </Reveal>
  )
}

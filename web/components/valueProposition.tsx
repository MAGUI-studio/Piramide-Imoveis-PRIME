import {eyebrow, homeSectionHeading, wrap} from '../lib/classes'
import {Reveal, Words, riseIn} from './motion'

const pillars = [
  {title: 'Curadoria', text: 'Cada imóvel é visitado e avaliado antes de chegar até você.'},
  {title: 'Atendimento exclusivo', text: 'Um especialista dedicado do primeiro contato à entrega das chaves.'},
  {title: 'Negociação segura', text: 'Assessoria jurídica e documental em todas as etapas.'},
]

export function ValueProposition() {
  return (
    <section id="diferenciais" className="relative text-ivory">
      <Reveal className={'group ' + wrap + ' py-[clamp(56px,8vw,116px)]'}>
        <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
          <div>
            <p className={eyebrow + ' mb-3 text-[.68rem] text-piramide'}>Diferenciais Pirâmide PRIME</p>
            <h2 className={homeSectionHeading + ' max-w-[24ch] text-ivory'}>
              <Words text="O endereço certo começa com quem entende de alto padrão." start={120} />
            </h2>
          </div>
          <p className={'max-w-[56ch] text-sm font-light leading-relaxed text-ivory/90 sm:text-base lg:justify-self-end ' + riseIn} style={{animationDelay: '600ms'}}>
            Selecionamos os imóveis mais desejados da região e conduzimos cada negociação com discrição, técnica e cuidado.
          </p>
        </div>
        <div className="mt-12 grid gap-10 sm:mt-14 md:grid-cols-3 md:gap-12">
          {pillars.map((pillar, i) => (
            <div key={pillar.title} className="relative isolate py-4">
              <span aria-hidden="true" className="pointer-events-none absolute -top-2 right-0 -z-1 select-none text-[clamp(5.5rem,8vw,8rem)] leading-none font-bold tracking-tighter text-white/25">
                0{i + 1}
              </span>
              <div className={riseIn} style={{animationDelay: 800 + i * 150 + 'ms'}}>
                <h3 className="text-lg font-medium tracking-tight text-ivory sm:text-xl">{pillar.title}</h3>
                <p className="mt-2.5 max-w-[32ch] text-sm font-light leading-relaxed text-ivory/90">{pillar.text}</p>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  )
}

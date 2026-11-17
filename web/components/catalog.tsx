'use client'

import Link from 'next/link'
import {useSearchParams} from 'next/navigation'
import {ArrowUpRight, MapPin, Search, SlidersHorizontal} from 'lucide-react'
import {locationOf, type PropertyCard} from '../lib/model'
import type {Picture} from '../lib/image'
import {button, heading, wrap} from '../lib/classes'
import {Frame} from './media'

export type CatalogItem = Omit<PropertyCard, 'cover'> & {image: Picture; alternate?: Picture}
const collator = new Intl.Collator('pt-BR', {sensitivity: 'base'})
const normalize = (text: string) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('pt-BR')
const select = 'h-12 w-full cursor-pointer border border-[#b5a48f] bg-paper px-2 text-xs text-espresso sm:px-3 sm:text-sm'

export function Catalog({items}: {items: CatalogItem[]}) {
  const params = useSearchParams()
  const query = params.get('busca') || ''
  const cities = Array.from(new Map(items.flatMap(({city}) => city ? [[city.id, city]] : [])).values()).sort((a, b) => collator.compare(a.name, b.name))
  const selectedCity = cities.some(({id}) => id === params.get('cidade')) ? params.get('cidade')! : ''
  const neighborhoods = Array.from(new Map(items.flatMap(({neighborhood, city}) => (
    neighborhood && (!selectedCity || city?.id === selectedCity)
      ? [[neighborhood.id, {...neighborhood, label: selectedCity ? neighborhood.name : [neighborhood.name, city?.name].filter(Boolean).join(', ')}]]
      : []
  ))).values()).sort((a, b) => collator.compare(a.label, b.label))
  const selectedNeighborhood = neighborhoods.some(({id}) => id === params.get('bairro')) ? params.get('bairro')! : ''
  const types = Array.from(new Set(items.map(({propertyType}) => propertyType))).filter(Boolean).sort(collator.compare)
  const selectedType = types.find((type) => type === params.get('tipo')) || ''
  const words = normalize(query).trim().split(/\s+/).filter(Boolean)
  const results = items.filter((item) => {
    if (selectedCity && item.city?.id !== selectedCity) return false
    if (selectedNeighborhood && item.neighborhood?.id !== selectedNeighborhood) return false
    if (selectedType && item.propertyType !== selectedType) return false
    const copy = normalize([item.title, item.summary, locationOf(item)].join(' '))
    return words.every((word) => copy.includes(word))
  })

  function update(key: string, value: string) {
    const url = new URL(window.location.href)
    if (value) url.searchParams.set(key, value)
    else url.searchParams.delete(key)
    if (key === 'cidade' && value && selectedNeighborhood &&
        !items.some((item) => item.neighborhood?.id === selectedNeighborhood && item.city?.id === value)) {
      url.searchParams.delete('bairro')
    }
    if (key === 'busca') window.history.replaceState(null, '', url)
    else window.history.pushState(null, '', url)
  }

  function clear() {
    const url = new URL(window.location.href)
    for (const key of ['busca', 'cidade', 'bairro', 'tipo']) url.searchParams.delete(key)
    window.history.pushState(null, '', url)
  }

  return (
    <section id="empreendimentos" className={wrap + ' scroll-mt-4 pt-[clamp(44px,6vw,98px)] pb-[clamp(55px,8vw,95px)]'}>
      <div className="mb-7 border-t border-rule pt-6">
        <h2 className={heading + ' text-[clamp(2.8rem,5vw,5.6rem)]'}>Explore os empreendimentos</h2>
      </div>
      {items.length ? <>
        <form role="search" className="grid items-start gap-3 min-[801px]:grid-cols-[minmax(240px,1.25fr)_2fr]" onSubmit={(event) => event.preventDefault()}>
          <label className="flex h-12 items-center gap-3 border border-[#b5a48f] bg-paper px-3.5 text-bronze">
            <span className="sr-only">Buscar imóveis</span>
            <Search size={20} />
            <input className="w-full min-w-0 text-sm text-espresso placeholder:text-earth" type="search" placeholder="Buscar por nome ou localização" value={query} onChange={(event) => update('busca', event.target.value)} />
          </label>
          <details className="min-[801px]:[&:not([open])::details-content]:[content-visibility:visible]" open>
            <summary className="flex h-11 cursor-pointer items-center gap-2 min-[801px]:hidden"><SlidersHorizontal size={16} /> Filtros</summary>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <label><span className="sr-only">Cidade</span><select className={select} value={selectedCity} onChange={(event) => update('cidade', event.target.value)}><option value="">Todas as cidades</option>{cities.map(({id, name}) => <option key={id} value={id}>{name}</option>)}</select></label>
              <label><span className="sr-only">Bairro</span><select className={select} value={selectedNeighborhood} onChange={(event) => update('bairro', event.target.value)}><option value="">Todos os bairros</option>{neighborhoods.map(({id, label}) => <option key={id} value={id}>{label}</option>)}</select></label>
              <label><span className="sr-only">Tipo de imóvel</span><select className={select} value={selectedType} onChange={(event) => update('tipo', event.target.value)}><option value="">Todos os tipos</option>{types.map((type) => <option key={type}>{type}</option>)}</select></label>
            </div>
          </details>
        </form>
        <div className="flex min-h-12 items-center justify-between text-xs text-earth">
          <span aria-live="polite">{results.length} {results.length === 1 ? 'imóvel' : 'imóveis'}</span>
          {(query || selectedCity || selectedNeighborhood || selectedType) && <button className="cursor-pointer py-2 text-bronze" onClick={clear}>Limpar filtros</button>}
        </div>
        {results.length ? <div className="grid items-start gap-x-[clamp(16px,2.4vw,39px)] gap-y-[clamp(28px,5vw,78px)] min-[701px]:grid-cols-12">
          {results.map((item, index) => <Link className={'group block border-b border-rule pb-6 hover:border-bronze ' + (results.length === 1 ? 'min-[701px]:col-span-9' : ['min-[701px]:col-span-7', 'min-[701px]:col-span-5', 'min-[701px]:col-span-8 min-[701px]:col-start-3'][index % 3])} key={item.id} href={'/' + item.slug}>
            <div className={'relative isolate overflow-hidden bg-espresso/15 after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(153deg,#10100dbf,transparent_35%,transparent_73%,#10100d60)] ' + (index % 3 === 2 ? 'aspect-[1.62]' : 'aspect-[1.32]')}>
              <Frame className="size-full object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-105" photo={item.image} sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 60vw" />
              {item.alternate && <div className="absolute inset-0 [clip-path:inset(0_100%_0_0)] group-focus-visible:[clip-path:inset(0)] group-hover:[clip-path:inset(0)] motion-safe:transition-[clip-path] motion-safe:duration-700" aria-hidden="true">
                <Frame className="size-full object-cover" photo={item.alternate} sizes="(max-width: 700px) 100vw, 60vw" />
              </div>}
              <span className="absolute top-4 left-4 z-1 text-xs tracking-widest text-ivory uppercase">{item.propertyType}</span>
              <span className="absolute right-3 bottom-3 z-1 grid size-12 place-items-center rounded-full border border-gold/55 bg-coal/75 text-gold group-hover:bg-gold group-hover:text-coal motion-safe:transition-colors"><ArrowUpRight size={22} strokeWidth={1.4} /></span>
            </div>
            <div className="pt-5">
              <span className="flex items-center gap-1.5 text-xs text-bronze"><MapPin size={13} />{locationOf(item)}</span>
              <h3 className={heading + ' my-2 text-[clamp(2.25rem,4vw,4.7rem)]'}>{item.title}</h3>
              <p className="text-sm leading-relaxed text-earth">{item.summary}</p>
              {!!item.attributes?.length && <ul className="mt-4 flex flex-wrap gap-y-2 divide-x divide-rule text-xs">{item.attributes.map((attribute) => <li className="px-3 first:pl-0" key={attribute}>{attribute}</li>)}</ul>}
            </div>
          </Link>)}
        </div> : <div className="border border-rule p-7 text-earth"><p>Nenhum imóvel encontrado com esses filtros.</p><button className={button + ' mt-4 cursor-pointer border-bronze text-bronze'} onClick={clear}>Limpar filtros</button></div>}
      </> : <div className="border border-rule p-7 text-earth">Nenhum empreendimento disponível no momento.</div>}
    </section>
  )
}

'use client'

import Link from 'next/link'
import {useSearchParams} from 'next/navigation'
import {useEffect, useRef, useState} from 'react'
import {ArrowUpRight, Check, ChevronDown, MapPin, Search, SlidersHorizontal, X} from 'lucide-react'
import {locationOf, type PropertyCard} from '../lib/model'
import type {Picture} from '../lib/image'
import {button, heading, wrap} from '../lib/classes'
import {Frame} from './media'

export type CatalogItem = Omit<PropertyCard, 'cover'> & {image: Picture; alternate?: Picture}
const collator = new Intl.Collator('pt-BR', {sensitivity: 'base'})
const normalize = (text: string) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('pt-BR')

type SelectOption = {value: string; label: string}

function CustomSelect({
  label,
  placeholder,
  value,
  options,
  onChange,
}: {
  label: string
  placeholder: string
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const activeOption = options.find((opt) => opt.value === value)

  useEffect(() => {
    if (!open) return
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <span className="sr-only">{label}</span>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={
          'flex h-12 w-full cursor-pointer items-center justify-between gap-2 border px-3.5 text-left text-xs transition-all duration-200 sm:px-4 sm:text-sm ' +
          (open
            ? 'border-piramide bg-white text-espresso ring-2 ring-piramide/15'
            : value
              ? 'border-piramide/55 bg-white font-medium text-espresso'
              : 'border-rule bg-white/75 text-espresso hover:border-espresso/40 hover:bg-white')
        }
      >
        <span className={'truncate ' + (activeOption ? 'text-espresso' : 'text-earth')}>
          {activeOption ? activeOption.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={
            'shrink-0 transition-transform duration-200 ' +
            (open ? 'rotate-180 text-piramide' : 'text-earth')
          }
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={label}
          className="absolute top-[calc(100%+6px)] left-0 z-30 max-h-64 w-full min-w-[12rem] overflow-y-auto border border-rule/80 bg-white p-1.5 shadow-xl motion-safe:animate-enter"
        >
          <button
            type="button"
            role="option"
            aria-selected={!value}
            onClick={() => {
              onChange('')
              setOpen(false)
            }}
            className={
              'flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2.5 text-left text-xs transition-colors sm:text-sm ' +
              (!value ? 'bg-piramide/10 font-semibold text-piramide' : 'text-espresso hover:bg-paper')
            }
          >
            <span className="truncate">{placeholder}</span>
            {!value && <Check size={14} className="shrink-0 text-piramide" />}
          </button>
          {options.map((option) => {
            const isSelected = option.value === value
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                }}
                className={
                  'flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2.5 text-left text-xs transition-colors sm:text-sm ' +
                  (isSelected ? 'bg-piramide/10 font-semibold text-piramide' : 'text-espresso hover:bg-paper')
                }
              >
                <span className="truncate">{option.label}</span>
                {isSelected && <Check size={14} className="shrink-0 text-piramide" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

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
  const displayed = results.slice(0, 10)

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
      <div className="mb-7">
        <h2 className={heading + ' text-[clamp(2.8rem,5vw,5.6rem)]'}>Explore os empreendimentos</h2>
      </div>
      {items.length ? <>
        <form role="search" className="grid items-start gap-3 min-[801px]:grid-cols-[minmax(240px,1.25fr)_2fr]" onSubmit={(event) => event.preventDefault()}>
          <label className="group flex h-12 items-center gap-3 border border-rule bg-white/75 px-3.5 text-earth transition-all duration-200 hover:border-espresso/40 focus-within:border-piramide focus-within:bg-white focus-within:ring-2 focus-within:ring-piramide/15">
            <span className="sr-only">Buscar imóveis</span>
            <Search size={18} className="shrink-0 text-earth transition-colors group-focus-within:text-piramide" />
            <input
              className="w-full min-w-0 appearance-none bg-transparent text-sm text-espresso placeholder:text-earth focus:outline-none [&::-webkit-search-cancel-button]:hidden"
              type="text"
              placeholder="Buscar por nome ou localização"
              value={query}
              onChange={(event) => update('busca', event.target.value)}
            />
            {query && (
              <button
                type="button"
                onClick={() => update('busca', '')}
                aria-label="Limpar busca"
                className="grid size-6 shrink-0 cursor-pointer place-items-center rounded-full text-earth transition-colors hover:bg-espresso/10 hover:text-espresso"
              >
                <X size={14} />
              </button>
            )}
          </label>
          <details className="min-[801px]:[&:not([open])::details-content]:[content-visibility:visible]" open>
            <summary className="flex h-11 cursor-pointer items-center gap-2 text-sm font-medium text-espresso min-[801px]:hidden"><SlidersHorizontal size={16} /> Filtros</summary>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
              <CustomSelect
                label="Cidade"
                placeholder="Todas as cidades"
                value={selectedCity}
                options={cities.map(({id, name}) => ({value: id, label: name}))}
                onChange={(val) => update('cidade', val)}
              />
              <CustomSelect
                label="Bairro"
                placeholder="Todos os bairros"
                value={selectedNeighborhood}
                options={neighborhoods.map(({id, label}) => ({value: id, label}))}
                onChange={(val) => update('bairro', val)}
              />
              <CustomSelect
                label="Tipo de imóvel"
                placeholder="Todos os tipos"
                value={selectedType}
                options={types.map((type) => ({value: type, label: type}))}
                onChange={(val) => update('tipo', val)}
              />
            </div>
          </details>
        </form>
        <div className="flex min-h-12 items-center justify-between text-xs text-earth">
          <span aria-live="polite">{results.length} {results.length === 1 ? 'imóvel' : 'imóveis'}</span>
          {(query || selectedCity || selectedNeighborhood || selectedType) && <button type="button" className="cursor-pointer py-2 font-medium text-piramide transition-opacity hover:opacity-80" onClick={clear}>Limpar filtros</button>}
        </div>
        {displayed.length ? <div className="grid items-stretch gap-x-[clamp(16px,2.2vw,32px)] gap-y-[clamp(24px,3.2vw,44px)] min-[801px]:grid-cols-12">
          {displayed.map((item, index) => {
            const isHeroBento = index === 0
            const isSideBento = index === 1 || index === 2
            const colClass =
              displayed.length === 1
                ? 'min-[801px]:col-span-8'
                : isHeroBento
                  ? displayed.length >= 3
                    ? 'min-[801px]:col-span-7 min-[801px]:row-span-2'
                    : 'min-[801px]:col-span-7'
                  : isSideBento
                    ? 'min-[801px]:col-span-5'
                    : 'min-[801px]:col-span-6'

            const imageAspectClass = isHeroBento
              ? displayed.length >= 3
                ? 'aspect-[1.32] min-[801px]:aspect-auto min-[801px]:flex-1 min-[801px]:min-h-[360px]'
                : 'aspect-[1.32]'
              : isSideBento
                ? 'aspect-[1.82]'
                : 'aspect-[1.5]'

            const titleClass = isHeroBento
              ? 'text-[clamp(2.1rem,3.6vw,4rem)]'
              : isSideBento
                ? 'text-[clamp(1.55rem,2.3vw,2.4rem)]'
                : 'text-[clamp(1.75rem,2.8vw,3rem)]'

            return (
              <Link
                className={'group flex flex-col ' + colClass}
                key={item.id}
                href={'/' + item.slug}
              >
                <div className={'relative isolate w-full overflow-hidden bg-espresso/15 after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(153deg,#10100dbf,transparent_35%,transparent_73%,#10100d60)] ' + imageAspectClass}>
                  <Frame className="size-full object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-105" photo={item.image} sizes="(max-width: 800px) 100vw, (max-width: 1200px) 50vw, 60vw" />
                  {item.alternate && <div className="absolute inset-0 [clip-path:inset(0_100%_0_0)] group-focus-visible:[clip-path:inset(0)] group-hover:[clip-path:inset(0)] motion-safe:transition-[clip-path] motion-safe:duration-700" aria-hidden="true">
                    <Frame className="size-full object-cover" photo={item.alternate} sizes="(max-width: 800px) 100vw, 60vw" />
                  </div>}
                  <span className="absolute top-4 left-4 z-1 text-xs tracking-widest text-ivory uppercase">{item.propertyType}</span>
                  <span className="absolute right-3 bottom-3 z-1 grid size-11 place-items-center rounded-full border border-white/40 bg-coal/75 text-ivory group-hover:border-piramide group-hover:bg-piramide group-hover:text-white motion-safe:transition-colors"><ArrowUpRight size={20} strokeWidth={1.5} /></span>
                </div>
                <div className="pt-4">
                  <span className="flex items-center gap-1.5 text-xs text-bronze"><MapPin size={13} />{locationOf(item)}</span>
                  <h3 className={heading + ' my-1.5 line-clamp-1 pb-0.5 ' + titleClass}>{item.title}</h3>
                  <p className="line-clamp-2 text-sm leading-relaxed text-earth">{item.summary}</p>
                  {!!item.attributes?.length && <ul className="mt-3 flex flex-wrap gap-y-1.5 divide-x divide-rule text-xs text-espresso/85">{item.attributes.map((attribute) => <li className="px-3 first:pl-0" key={attribute}>{attribute}</li>)}</ul>}
                </div>
              </Link>
            )
          })}
        </div> : <div className="border border-rule p-7 text-earth"><p>Nenhum imóvel encontrado com esses filtros.</p><button type="button" className={button + ' mt-4 cursor-pointer border-bronze text-bronze'} onClick={clear}>Limpar filtros</button></div>}
      </> : <div className="border border-rule p-7 text-earth">Nenhum empreendimento disponível no momento.</div>}
    </section>
  )
}

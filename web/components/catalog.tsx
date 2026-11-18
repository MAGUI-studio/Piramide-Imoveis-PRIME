'use client'

import Link from 'next/link'
import {useSearchParams} from 'next/navigation'
import {useEffect, useId, useRef, useState} from 'react'
import {ArrowLeft, ArrowRight, ArrowUpRight, BedDouble, Building2, Check, ChevronDown, House, MapPin, Search, SlidersHorizontal, X} from 'lucide-react'
import {availabilityLabel, cardAreaOf, cardAttributesOf, catalogPageSize, locationOf, propertyPrice, type PropertyCard} from '../lib/model'
import type {Picture} from '../lib/image'
import {button, eyebrow, heading, homeSectionHeading, wrap} from '../lib/classes'
import {Frame} from './media'
import {Reveal} from './motion'

export type CatalogItem = Omit<PropertyCard, 'cover'> & {image: Picture; alternate?: Picture}
const collator = new Intl.Collator('pt-BR', {sensitivity: 'base'})
const normalize = (text: string) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('pt-BR')
const homeLimit = 5
const paginationLink = 'inline-flex min-h-11 items-center gap-2 px-3 text-sm font-semibold text-piramide transition-colors hover:bg-piramide/10'
const filterField = 'flex min-h-15 items-center gap-3 border-b border-espresso/25 bg-transparent px-1 transition-colors hover:border-espresso/55 focus-within:border-piramide sm:px-2'

type SelectOption = {value: string; label: string}

function MultiSelect({
  label,
  placeholder,
  icon: Icon,
  values,
  options,
  onChange,
}: {
  label: string
  placeholder: string
  icon: typeof MapPin
  values: string[]
  options: SelectOption[]
  onChange: (values: string[]) => void
}) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const container = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const selected = options.filter(({value}) => values.includes(value))
  const term = normalize(search).trim()
  const matching = options.filter((option) => normalize(option.label).includes(term))

  function close() {
    setOpen(false)
    setSearch('')
  }

  useEffect(() => {
    if (!open) return
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) input.current?.focus()
    function closeOutside(event: PointerEvent) {
      if (!container.current?.contains(event.target as Node)) close()
    }
    document.addEventListener('pointerdown', closeOutside)
    return () => document.removeEventListener('pointerdown', closeOutside)
  }, [open])

  return (
    <div
      ref={container}
      className="relative min-w-0"
      onBlur={(event) => {
        if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) close()
      }}
      onKeyDown={(event) => {
        if (!open || event.key !== 'Escape') return
        event.preventDefault()
        event.stopPropagation()
        close()
        trigger.current?.focus()
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => open ? close() : setOpen(true)}
        className={filterField + ' w-full cursor-pointer text-left aria-expanded:border-piramide'}
      >
        <Icon aria-hidden="true" size={17} strokeWidth={1.6} className="shrink-0 text-piramide" />
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-semibold tracking-wider text-earth uppercase">{label}</span>
          <span className="mt-0.5 block truncate text-sm font-medium text-espresso">{selected[0]?.label || placeholder}</span>
        </span>
        {selected.length > 1 && <span className="shrink-0 bg-piramide/10 px-1.5 py-0.5 text-[10px] font-bold text-piramide">+{selected.length - 1}</span>}
        <ChevronDown aria-hidden="true" size={15} className={'shrink-0 text-piramide motion-safe:transition-transform ' + (open ? 'rotate-180' : '')} />
      </button>

      {open && (
        <div id={id} className="absolute inset-x-0 top-full z-30 mt-2 border border-espresso/15 bg-paper p-2 shadow-lg motion-safe:animate-enter">
          <label className="flex items-center gap-2 border-b border-espresso/20 px-2.5 text-piramide focus-within:border-piramide">
            <Search aria-hidden="true" size={16} className="shrink-0" />
            <span className="sr-only">Pesquisar opções de {label.toLowerCase()}</span>
            <input
              ref={input}
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Pesquisar opções"
              className="h-10 w-full min-w-0 bg-transparent text-sm text-espresso placeholder:text-earth focus:outline-none"
            />
          </label>

          <fieldset className="mt-2 max-h-52 min-w-0 overflow-y-auto overscroll-contain">
            <legend className="sr-only">{label}</legend>
            {matching.map(({value, label: optionLabel}) => {
              const checked = values.includes(value)
              return (
                <label key={value} className="flex min-h-10 cursor-pointer items-center gap-2.5 px-2.5 py-2 text-sm text-espresso hover:bg-espresso/5 focus-within:bg-piramide/10">
                  <span className="relative grid size-4 shrink-0 place-items-center">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onChange(checked ? values.filter((selection) => selection !== value) : [...values, value])}
                      className="peer size-4 appearance-none border border-espresso/30 checked:border-piramide checked:bg-piramide focus-visible:outline-piramide"
                    />
                    <Check aria-hidden="true" size={12} strokeWidth={2.5} className="pointer-events-none absolute hidden text-white peer-checked:block" />
                  </span>
                  <span className="min-w-0 break-words">{optionLabel}</span>
                </label>
              )
            })}
            {!matching.length && <p role="status" className="px-2.5 py-3 text-xs text-earth">Nenhuma opção encontrada.</p>}
          </fieldset>
          {!!selected.length && <div className="mt-2 flex items-center justify-between gap-2 border-t border-espresso/10 px-2.5 pt-2 text-xs">
            <span className="text-earth">{selected.length} {selected.length === 1 ? 'selecionado' : 'selecionados'}</span>
            <button type="button" className="cursor-pointer py-1 font-semibold text-piramide hover:underline" onClick={() => {
              input.current?.focus()
              onChange([])
            }}>Limpar seleção</button>
          </div>}
        </div>
      )}
    </div>
  )
}

export function Catalog({items, full = false}: {items: CatalogItem[]; full?: boolean}) {
  const params = useSearchParams()
  const query = params.get('busca') || ''
  const cities = Array.from(new Map(items.flatMap(({city}) => city ? [[city.id, city]] : [])).values()).sort((a, b) => collator.compare(a.name, b.name))
  const selectedCities = params.getAll('cidade').filter((value) => cities.some(({id}) => id === value))
  const neighborhoods = Array.from(new Map(items.flatMap(({neighborhood, city}) => (
    neighborhood && (!selectedCities.length || (city && selectedCities.includes(city.id)))
      ? [[neighborhood.id, {...neighborhood, label: selectedCities.length === 1 ? neighborhood.name : [neighborhood.name, city?.name].filter(Boolean).join(', ')}]]
      : []
  ))).values()).sort((a, b) => collator.compare(a.label, b.label))
  const selectedNeighborhoods = params.getAll('bairro').filter((value) => neighborhoods.some(({id}) => id === value))
  const types = Array.from(new Set(items.map(({propertyType}) => propertyType))).filter(Boolean).sort(collator.compare)
  const selectedTypes = params.getAll('tipo').filter((value) => types.includes(value))
  const suiteCounts = Array.from(new Set(items.map(({specifications}) => specifications?.suites).filter((n): n is number => typeof n === 'number' && n > 0))).sort((a, b) => a - b)
  const suiteValues = suiteCounts.map(String)
  const selectedSuites = params.getAll('suites').filter((value) => suiteValues.includes(value))
  const words = normalize(query).trim().split(/\s+/).filter(Boolean)
  const results = items.filter((item) => {
    if (selectedCities.length && !selectedCities.includes(item.city?.id || '')) return false
    if (selectedNeighborhoods.length && !selectedNeighborhoods.includes(item.neighborhood?.id || '')) return false
    if (selectedTypes.length && !selectedTypes.includes(item.propertyType)) return false
    if (selectedSuites.length && !selectedSuites.includes(String(item.specifications?.suites || ''))) return false
    const copy = normalize([item.title, item.refCode, item.condominiumName, item.summary, locationOf(item)].filter(Boolean).join(' '))
    return words.every((word) => copy.includes(word))
  })
  const totalPages = Math.max(1, Math.ceil(results.length / catalogPageSize))
  const requestedPage = params.get('pagina') || ''
  const page = full && /^[1-9]\d*$/.test(requestedPage) ? Math.min(Number(requestedPage), totalPages) : 1
  const start = (page - 1) * catalogPageSize
  const displayed = full ? results.slice(start, start + catalogPageSize) : results.slice(0, homeLimit)
  const hasLeadStack = displayed.length === 3 || displayed.length === homeLimit
  const Title = full ? 'h1' : 'h2'

  function pageHref(target: number) {
    const nextParams = new URLSearchParams(params.toString())
    if (target === 1) nextParams.delete('pagina')
    else nextParams.set('pagina', String(target))
    const search = nextParams.toString()
    return '/empreendimentos' + (search ? '?' + search : '') + '#resultados'
  }

  function updateSearch(value: string) {
    const url = new URL(window.location.href)
    if (value) url.searchParams.set('busca', value)
    else url.searchParams.delete('busca')
    url.searchParams.delete('pagina')
    window.history.replaceState(null, '', url)
  }

  function updateFilter(key: 'cidade' | 'bairro' | 'tipo' | 'suites', values: string[]) {
    const url = new URL(window.location.href)
    url.searchParams.delete('pagina')
    url.searchParams.delete(key)
    values.forEach((value) => url.searchParams.append(key, value))
    if (key === 'cidade' && values.length) {
      const compatibleNeighborhoods = url.searchParams.getAll('bairro').filter((id) =>
        items.some(({neighborhood, city}) => neighborhood?.id === id && city && values.includes(city.id)),
      )
      url.searchParams.delete('bairro')
      compatibleNeighborhoods.forEach((id) => url.searchParams.append('bairro', id))
    }
    window.history.pushState(null, '', url)
  }

  function clear() {
    const url = new URL(window.location.href)
    for (const key of ['busca', 'cidade', 'bairro', 'tipo', 'suites', 'pagina']) url.searchParams.delete(key)
    window.history.pushState(null, '', url)
  }

  return (
    <section id="empreendimentos" className={wrap + ' scroll-mt-4 pt-[clamp(44px,6vw,98px)] pb-[clamp(55px,8vw,95px)]'}>
      <Reveal className="mb-7 motion-safe:data-[entered=true]:animate-enter">
        <p className={eyebrow + ' mb-2 text-[.68rem] text-piramide'}>Portfólio Pirâmide Imóveis Prime</p>
        <Title className={homeSectionHeading}>{full ? 'Todos os empreendimentos' : 'Explore os empreendimentos'}</Title>
      </Reveal>
      {items.length ? <>
        <form role="search" aria-label="Filtrar empreendimentos" className="grid items-start gap-3 min-[1100px]:grid-cols-[minmax(14rem,1fr)_minmax(0,3.4fr)] xl:grid-cols-[minmax(16rem,1.1fr)_minmax(0,3.4fr)]" onSubmit={(event) => event.preventDefault()}>
          <div className={filterField}>
            <label className="flex min-w-0 flex-1 items-center gap-3">
              <Search aria-hidden="true" size={17} strokeWidth={1.6} className="shrink-0 text-piramide" />
              <span className="min-w-0 flex-1">
                <span className="block text-[10px] font-semibold tracking-wider text-earth uppercase">Buscar imóveis</span>
                <input
                  className="mt-0.5 block w-full min-w-0 bg-transparent text-sm font-medium text-espresso placeholder:font-normal placeholder:text-earth focus:outline-none"
                  type="text"
                  placeholder="Nome, condomínio ou código"
                  value={query}
                  onChange={(event) => updateSearch(event.target.value)}
                />
              </span>
            </label>
            {query && (
              <button
                type="button"
                onClick={() => updateSearch('')}
                aria-label="Limpar busca"
                className="grid size-6 shrink-0 cursor-pointer place-items-center rounded-full text-earth transition-colors hover:bg-espresso/10 hover:text-espresso"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <details className="min-[801px]:[&:not([open])::details-content]:[content-visibility:visible]" open>
            <summary className="flex h-11 cursor-pointer items-center gap-2 text-sm font-medium text-espresso min-[801px]:hidden"><SlidersHorizontal size={16} /> Filtros</summary>
            <div className={'grid grid-cols-1 gap-2 sm:gap-3 ' + (suiteCounts.length ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3')}>
              <MultiSelect
                label="Cidade"
                placeholder="Todas as cidades"
                icon={Building2}
                values={selectedCities}
                options={cities.map(({id, name}) => ({value: id, label: name}))}
                onChange={(values) => updateFilter('cidade', values)}
              />
              <MultiSelect
                label="Bairro"
                placeholder="Todos os bairros"
                icon={MapPin}
                values={selectedNeighborhoods}
                options={neighborhoods.map(({id, label}) => ({value: id, label}))}
                onChange={(values) => updateFilter('bairro', values)}
              />
              <MultiSelect
                label="Tipo de imóvel"
                placeholder="Todos os tipos"
                icon={House}
                values={selectedTypes}
                options={types.map((type) => ({value: type, label: type}))}
                onChange={(values) => updateFilter('tipo', values)}
              />
              {!!suiteCounts.length && (
                <MultiSelect
                  label="Suítes"
                  placeholder="Qualquer quantidade"
                  icon={BedDouble}
                  values={selectedSuites}
                  options={suiteCounts.map((count) => ({value: String(count), label: count + (count === 1 ? ' suíte' : ' suítes')}))}
                  onChange={(values) => updateFilter('suites', values)}
                />
              )}
            </div>
          </details>
        </form>
        <div id={full ? 'resultados' : undefined} className="flex min-h-12 scroll-mt-4 items-center justify-between text-xs text-earth">
          <span aria-live="polite">{results.length} {results.length === 1 ? 'imóvel' : 'imóveis'}</span>
          {(query || selectedCities.length > 0 || selectedNeighborhoods.length > 0 || selectedTypes.length > 0 || selectedSuites.length > 0) && <button type="button" className="cursor-pointer py-2 font-medium text-piramide transition-opacity hover:opacity-80" onClick={clear}>Limpar filtros</button>}
        </div>
        {displayed.length ? <Reveal className={'grid gap-3 motion-safe:data-[entered=true]:animate-enter sm:gap-4 xl:gap-5 ' + (full ? 'sm:grid-cols-2' : 'min-[801px]:grid-cols-12')}>
          {displayed.map((item, index) => {
            const isLead = !full && index === 0
            const isStacked = !full && hasLeadStack && index > 0 && index < 3
            let gridClass = full ? '' : 'min-[801px]:col-span-6'
            let desktopImageWidth = '50vw'

            if (!full && displayed.length === 1) {
              gridClass = 'min-[801px]:col-span-12'
              desktopImageWidth = '100vw'
            } else if (isLead && hasLeadStack) {
              gridClass = 'min-[801px]:col-span-7 min-[801px]:row-span-2'
              desktopImageWidth = '60vw'
            } else if (isStacked) {
              gridClass = 'min-[801px]:col-span-5'
              desktopImageWidth = '42vw'
            } else if (!full && (displayed.length === 2 || displayed.length === 4)) {
              const isWide = index === 0 || index === 3
              gridClass = isWide ? 'min-[801px]:col-span-7' : 'min-[801px]:col-span-5'
              desktopImageWidth = isWide ? '60vw' : '42vw'
            }

            const sizes = full ? '(max-width: 639px) 100vw, 50vw' : '(max-width: 800px) 100vw, ' + desktopImageWidth
            const cardHeight = isLead
              ? 'min-h-[24rem] sm:min-h-[30rem]'
              : isStacked
                ? 'min-h-[19rem]'
                : 'min-h-[20rem] xl:min-h-[24rem]'
            const titleSize = isLead
              ? 'text-[clamp(1.65rem,2.75vw,3.25rem)]'
              : 'text-[clamp(1.2rem,1.65vw,1.95rem)]'
            const titleStyle = isLead ? heading : 'font-sans font-semibold leading-tight tracking-tight'
            const location = locationOf(item)
            const status = availabilityLabel(item.availability)
            const area = cardAreaOf(item) || cardAttributesOf(item).find((value) => /^[\d.,]+\s*m²$/i.test(value.trim()))

            return (
              <Link
                className={'group relative isolate flex min-w-0 items-end overflow-hidden bg-coal px-5 pt-28 pb-5 sm:px-6 sm:pt-32 sm:pb-6 ' + gridClass + ' ' + cardHeight + (isLead ? ' xl:px-8 xl:pt-36 xl:pb-8' : '')}
                key={item.id}
                href={'/' + item.slug}
              >
                <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
                  <Frame className="size-full object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-104 motion-safe:group-focus-visible:scale-104" photo={item.image} sizes={sizes} />
                  {item.alternate && <div className="absolute inset-0 [clip-path:inset(0_100%_0_0)] group-focus-visible:[clip-path:inset(0)] group-hover:[clip-path:inset(0)] motion-safe:transition-[clip-path] motion-safe:duration-700" aria-hidden="true">
                    <Frame className="size-full object-cover" photo={item.alternate} sizes={sizes} />
                  </div>}
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,#080808_0%,#080808f2_28%,#080808b8_52%,#08080873_75%,#08080833_100%)]" />
                </div>
                {(status || item.conditions?.exclusive) && (
                  <div className="absolute top-4 left-5 flex flex-wrap gap-1.5 sm:top-5 sm:left-6">
                    {status && (
                      <span className={'px-2 py-0.5 text-[10px] font-bold tracking-[.12em] text-white uppercase ' + (item.availability === 'sold' ? 'bg-zinc-900/90' : 'bg-amber-600/95')}>
                        {status}
                      </span>
                    )}
                    {item.conditions?.exclusive && (
                      <span className="bg-piramide/95 px-2 py-0.5 text-[10px] font-bold tracking-[.12em] text-white uppercase">
                        Exclusivo
                      </span>
                    )}
                  </div>
                )}
                <div className="w-full text-white">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className={titleStyle + ' min-w-0 line-clamp-2 ' + titleSize} title={item.title}>{item.title}</h3>
                    <ArrowUpRight aria-hidden="true" size={19} strokeWidth={1.6} className="mt-0.5 shrink-0 text-white motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-focus-visible:translate-x-0.5 motion-safe:group-focus-visible:-translate-y-0.5" />
                  </div>
                  {location && <p className="mt-2 flex items-start gap-1.5 text-xs font-medium text-white/90"><MapPin aria-hidden="true" size={13} className="mt-0.5 shrink-0" />{location}</p>}
                  {item.summary && <p className="mt-2 line-clamp-2 max-w-[52ch] text-xs leading-relaxed text-white/85 sm:text-sm">{item.summary}</p>}
                  <p className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[11px] leading-snug font-semibold text-white/90">
                    {area && <span className="whitespace-nowrap tabular-nums">{area}</span>}
                    {item.propertyType && <span className="tracking-[.07em] uppercase">{item.propertyType}</span>}
                    <span className="font-bold whitespace-nowrap text-white tabular-nums">{propertyPrice(item.price)}</span>
                  </p>
                </div>
              </Link>
            )
          })}
        </Reveal> : <div className="border border-rule p-7 text-earth"><p>Nenhum imóvel encontrado com esses filtros.</p><button type="button" className={button + ' mt-4 cursor-pointer border-piramide text-piramide hover:bg-piramide/10'} onClick={clear}>Limpar filtros</button></div>}
        {!full && items.length > homeLimit && (
          <div className="mt-6 flex justify-end">
            <Link href="/empreendimentos" className="group/explore inline-flex min-h-11 w-fit items-center gap-2.5 text-right text-sm text-espresso transition-colors hover:text-piramide motion-reduce:transition-none sm:text-base">
              Ver todos os empreendimentos <ArrowUpRight aria-hidden="true" size={18} className="shrink-0 motion-safe:transition-transform motion-safe:group-hover/explore:translate-x-0.5 motion-safe:group-hover/explore:-translate-y-0.5" />
            </Link>
          </div>
        )}
        {full && totalPages > 1 && (() => {
          const pages: (number | 'ellipsis')[] = []
          for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
              pages.push(i)
            } else if (pages[pages.length - 1] !== 'ellipsis') {
              pages.push('ellipsis')
            }
          }
          return (
            <nav aria-label="Paginação dos empreendimentos" className="mt-8 flex flex-wrap items-center justify-center gap-1.5">
              {page > 1 && (
                <Link href={pageHref(page - 1)} rel="prev" aria-label="Página anterior" className={paginationLink}>
                  <ArrowLeft aria-hidden="true" size={16} />
                </Link>
              )}
              {pages.map((entry, idx) =>
                entry === 'ellipsis' ? (
                  <span key={'ellipsis-' + idx} className="px-2 text-xs text-earth select-none" aria-hidden="true">…</span>
                ) : (
                  <Link
                    key={entry}
                    href={pageHref(entry)}
                    aria-current={entry === page ? 'page' : undefined}
                    className={
                      'inline-grid min-h-10 min-w-10 place-items-center px-3 text-sm font-medium transition-colors ' +
                      (entry === page
                        ? 'bg-piramide font-semibold text-white'
                        : 'text-espresso hover:bg-piramide/10 hover:text-piramide')
                    }
                  >
                    {entry}
                  </Link>
                ),
              )}
              {page < totalPages && (
                <Link href={pageHref(page + 1)} rel="next" aria-label="Próxima página" className={paginationLink}>
                  <ArrowRight aria-hidden="true" size={16} />
                </Link>
              )}
            </nav>
          )
        })()}
      </> : <div className="border border-rule p-7 text-earth">Nenhum empreendimento disponível no momento.</div>}
    </section>
  )
}

'use client'

import Link from 'next/link'
import {useSearchParams} from 'next/navigation'
import {useEffect, useId, useMemo, useRef, useState} from 'react'
import {MultiSelect} from './multiSelect'
import {Slider} from './slider'
import {EmptyState} from './emptyState'
import type {CatalogOptions} from '../lib/sanity'
import {ArrowLeft, ArrowRight, ArrowUpDown, ArrowUpRight, BedDouble, Building2, CarFront, Check, ChevronDown, House, MapPin, PanelLeftClose, PanelLeftOpen, Ruler, Search, SlidersHorizontal, X} from 'lucide-react'
import {cardAreaOf, cardAttributesOf, catalogPageSize, locationOf, propertyAreaValue, propertyPrice, propertyRentPrice, type PropertyCard} from '../lib/model'
import type {Picture} from '../lib/image'
import {eyebrow, glassField, heading, homeSectionHeading, riseIn, wrap} from '../lib/classes'
import {Frame} from './media'
import {Reveal, Words} from './motion'

export type CatalogItem = Omit<PropertyCard, 'cover'> & {image: Picture; alternate?: Picture}
type DealFilter = 'ambos' | 'venda' | 'locacao'
type SortOption = 'recente' | 'maior-preco' | 'menor-preco' | 'maior-area'

const collator = new Intl.Collator('pt-BR', {sensitivity: 'base'})
const normalize = (text: string) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('pt-BR')
const homeLimit = 5
const paginationLink = 'inline-flex min-h-11 items-center gap-2 px-3 text-sm font-semibold text-piramide transition-colors hover:bg-piramide/10'

const sortOptions: {value: SortOption; label: string}[] = [
  {value: 'recente', label: 'Mais recente'},
  {value: 'maior-preco', label: 'Maior preço'},
  {value: 'menor-preco', label: 'Menor preço'},
  {value: 'maior-area', label: 'Maior área'},
]

function parsePositiveNumber(raw: string | null): number | null {
  if (!raw) return null
  const num = Number(raw)
  return Number.isFinite(num) && num > 0 ? num : null
}

function formatCompactCurrency(value: number): string {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000
    return 'R$ ' + (Number.isInteger(millions) ? millions : millions.toFixed(1).replace('.', ',')) + ' mi'
  }
  if (value >= 1_000) {
    const thousands = Math.round(value / 1_000)
    return 'R$ ' + thousands.toLocaleString('pt-BR') + ' mil'
  }
  return 'R$ ' + value.toLocaleString('pt-BR')
}

function computeRangeBounds(values: number[], fallbackMin: number, fallbackMax: number, step: number) {
  if (!values.length) return {min: fallbackMin, max: fallbackMax}
  const rawMin = Math.min(...values)
  const rawMax = Math.max(...values)
  const min = Math.max(0, Math.floor(rawMin / step) * step)
  const max = Math.max(min + step, Math.ceil(rawMax / step) * step)
  return {min, max}
}

function computeHistogram(values: number[], min: number, max: number, buckets = 12): number[] {
  if (!values.length || max <= min) return []
  const counts = Array.from({length: buckets}, () => 0)
  const span = max - min
  for (const v of values) {
    const idx = Math.min(buckets - 1, Math.max(0, Math.floor(((v - min) / span) * buckets)))
    counts[idx]++
  }
  return counts
}

function SortDropdown({value, onChange}: {value: SortOption; onChange: (next: SortOption) => void}) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const container = useRef<HTMLDivElement>(null)
  const current = sortOptions.find((opt) => opt.value === value) ?? sortOptions[0]

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: PointerEvent) {
      if (!container.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={container} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => setOpen((prev) => !prev)}
        className="flex min-h-11 cursor-pointer items-center gap-2.5 border border-zinc-200/80 bg-white/80 px-3.5 shadow-[0_4px_16px_rgba(15,23,42,0.03)] backdrop-blur-md backdrop-saturate-150 transition-all hover:border-zinc-300 hover:bg-white focus-visible:border-piramide/70 dark:border-white/[0.06] dark:bg-white/[0.03] dark:shadow-[0_6px_20px_rgba(0,0,0,0.22)] dark:hover:border-white/[0.12] dark:hover:bg-white/[0.05]"
      >
        <ArrowUpDown aria-hidden="true" size={14} className="shrink-0 text-piramide" />
        <span className="text-[10px] font-semibold tracking-wider text-earth uppercase">Ordenar:</span>
        <span className="text-xs font-semibold text-espresso">{current.label}</span>
        <ChevronDown
          aria-hidden="true"
          size={14}
          className={'shrink-0 text-piramide transition-transform duration-200 ' + (open ? 'rotate-180' : '')}
        />
      </button>

      {open && (
        <div
          id={id}
          role="listbox"
          aria-label="Ordenar imóveis"
          className="absolute right-0 top-full z-30 mt-2 w-52 border border-[#1b1916]/[0.08] bg-white/80 p-1.5 shadow-[0_16px_40px_rgba(27,25,22,0.10),inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-xl backdrop-saturate-150 motion-safe:animate-enter dark:border-white/[0.08] dark:bg-[#0e0e12]/80 dark:shadow-[0_20px_50px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.05)]"
        >
          {sortOptions.map((opt) => {
            const active = opt.value === value
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
                className={
                  'flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2.5 text-left text-xs font-medium transition-colors ' +
                  (active
                    ? 'bg-piramide/12 font-semibold text-piramide'
                    : 'text-espresso hover:bg-zinc-900/[0.05] dark:hover:bg-white/[0.06]')
                }
              >
                <span>{opt.label}</span>
                {active && <Check aria-hidden="true" size={14} className="shrink-0 text-piramide" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function CardPriceRow({price, rentPrice, surface = 'overlay'}: {price?: number | null; rentPrice?: number | null; surface?: 'overlay' | 'card' | 'responsive'}) {
  const hasSale = !!(price && price > 0)
  const hasRent = !!(rentPrice && rentPrice > 0)
  const borderClass = surface === 'card' ? 'border-rule' : surface === 'responsive' ? 'border-rule sm:border-white/20' : 'border-white/20'
  const textClass = surface === 'card' ? 'text-espresso' : surface === 'responsive' ? 'text-espresso sm:text-white' : 'text-white'
  const labelClass = surface === 'card' ? 'text-earth' : surface === 'responsive' ? 'text-earth sm:text-white/60' : 'text-white/60'
  const suffixClass = surface === 'card' ? 'text-earth' : surface === 'responsive' ? 'text-earth sm:text-white/75' : 'text-white/75'

  if (hasSale && hasRent) {
    return (
      <div className={`mt-4 flex flex-wrap items-end gap-x-5 gap-y-2 border-t ${borderClass} pt-3 leading-tight tracking-tight ${textClass} tabular-nums`}>
        <div>
          <span className={`mb-0.5 block text-[10px] font-semibold tracking-[0.14em] ${labelClass} uppercase`}>Venda</span>
          <span className="text-[clamp(1.05rem,1.35vw,1.4rem)] font-semibold">{propertyPrice(price)}</span>
        </div>
        <div className={`border-l ${borderClass} pl-5`}>
          <span className={`mb-0.5 block text-[10px] font-semibold tracking-[0.14em] ${labelClass} uppercase`}>Locação</span>
          <span className="text-[clamp(1.05rem,1.35vw,1.4rem)] font-semibold">
            {propertyPrice(rentPrice)}
            <span className={`ml-1 text-xs font-medium ${suffixClass}`}>/ mês</span>
          </span>
        </div>
      </div>
    )
  }

  if (hasRent) {
    return (
      <div className={`mt-4 border-t ${borderClass} pt-3 leading-tight tracking-tight ${textClass} tabular-nums`}>
        <span className={`mb-0.5 block text-[10px] font-semibold tracking-[0.14em] ${labelClass} uppercase`}>Locação</span>
        <span className="text-[clamp(1.15rem,1.6vw,1.65rem)] font-semibold">
          {propertyPrice(rentPrice)}
          <span className={`ml-1 text-sm font-medium ${suffixClass}`}>/ mês</span>
        </span>
      </div>
    )
  }

  return (
    <div className={`mt-4 border-t ${borderClass} pt-3 leading-snug tracking-tight ${textClass} tabular-nums`}>
      <span className="text-[clamp(1.15rem,1.6vw,1.65rem)] font-semibold">{propertyPrice(price)}</span>
    </div>
  )
}

export function Catalog({items, full = false, scopeTitle, fixedLocation = false, showAllLink = false, basePath = '/imoveis', filterOptions}: {items: CatalogItem[]; full?: boolean; scopeTitle?: string; fixedLocation?: boolean; showAllLink?: boolean; basePath?: string; filterOptions?: CatalogOptions}) {
  const params = useSearchParams()
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [desktopFiltersOpen, setDesktopFiltersOpen] = useState(true)
  const isEcommerceLayout = full && !fixedLocation

  const query = params.get('busca') || ''
  const selectedCondominium = params.get('condominio') || ''
  const condominiumName = items.find((item) => item.condominium?.slug === selectedCondominium)?.condominium?.name
  const cities = Array.from(new Map([...items, ...(filterOptions?.locations || [])].flatMap(({city}) => city ? [[city.id, city]] : [])).values()).sort((a, b) => collator.compare(a.name, b.name))
  const selectedCities = (fixedLocation ? [] : params.getAll('cidade')).filter((value) => cities.some(({id}) => id === value))
  const neighborhoods = Array.from(new Map([...items, ...(filterOptions?.locations || [])].flatMap(({neighborhood, city}) => (
    neighborhood && (!selectedCities.length || (city && selectedCities.includes(city.id)))
      ? [[neighborhood.id, {...neighborhood, label: selectedCities.length === 1 ? neighborhood.name : [neighborhood.name, city?.name].filter(Boolean).join(', ')}]]
      : []
  ))).values()).sort((a, b) => collator.compare(a.label, b.label))
  const selectedNeighborhoods = (fixedLocation ? [] : params.getAll('bairro')).filter((value) => neighborhoods.some(({id}) => id === value))
  const types = Array.from(new Set([
    ...(filterOptions?.types || []),
    ...items.map(({propertyType}) => propertyType),
    ...params.getAll('tipo').filter((value) => value.trim()),
  ])).filter(Boolean).sort(collator.compare)
  const selectedTypes = params.getAll('tipo').filter((value) => types.includes(value))
  const suiteCounts = Array.from(new Set(items.map(({specifications}) => specifications?.suites).filter((n): n is number => typeof n === 'number' && n > 0))).sort((a, b) => a - b)
  const suiteValues = suiteCounts.map(String)
  const selectedSuites = params.getAll('suites').filter((value) => suiteValues.includes(value))

  const saleValues = useMemo(
    () => items.map((i) => i.price).filter((n): n is number => typeof n === 'number' && n > 0),
    [items],
  )
  const rentValues = useMemo(
    () => items.map((i) => i.rentPrice).filter((n): n is number => typeof n === 'number' && n > 0),
    [items],
  )

  const saleBounds = useMemo(() => computeRangeBounds(saleValues, 500_000, 15_000_000, 100_000), [saleValues])
  const rentBounds = useMemo(() => computeRangeBounds(rentValues, 2_000, 40_000, 500), [rentValues])
  const saleHistogram = useMemo(() => computeHistogram(saleValues, saleBounds.min, saleBounds.max, 14), [saleValues, saleBounds])
  const rentHistogram = useMemo(() => computeHistogram(rentValues, rentBounds.min, rentBounds.max, 14), [rentValues, rentBounds])

  const rawDeal = params.get('negocio')
  const deal: DealFilter = rawDeal === 'venda' || rawDeal === 'locacao' ? rawDeal : 'ambos'
  const urlSaleMin = parsePositiveNumber(params.get('vendaMin'))
  const urlSaleMax = parsePositiveNumber(params.get('vendaMax'))
  const urlRentMin = parsePositiveNumber(params.get('locacaoMin'))
  const urlRentMax = parsePositiveNumber(params.get('locacaoMax'))

  const [saleRange, setSaleRange] = useState<[number, number]>([
    urlSaleMin ?? saleBounds.min,
    urlSaleMax ?? saleBounds.max,
  ])
  const [rentRange, setRentRange] = useState<[number, number]>([
    urlRentMin ?? rentBounds.min,
    urlRentMax ?? rentBounds.max,
  ])

  useEffect(() => {
    setSaleRange([
      Math.max(saleBounds.min, Math.min(saleBounds.max, urlSaleMin ?? saleBounds.min)),
      Math.max(saleBounds.min, Math.min(saleBounds.max, urlSaleMax ?? saleBounds.max)),
    ])
  }, [urlSaleMin, urlSaleMax, saleBounds.min, saleBounds.max])

  useEffect(() => {
    setRentRange([
      Math.max(rentBounds.min, Math.min(rentBounds.max, urlRentMin ?? rentBounds.min)),
      Math.max(rentBounds.min, Math.min(rentBounds.max, urlRentMax ?? rentBounds.max)),
    ])
  }, [urlRentMin, urlRentMax, rentBounds.min, rentBounds.max])

  const saleFilterActive = saleRange[0] > saleBounds.min || saleRange[1] < saleBounds.max
  const rentFilterActive = rentRange[0] > rentBounds.min || rentRange[1] < rentBounds.max

  const rawSort = params.get('ordem')
  const sort: SortOption =
    rawSort === 'maior-preco' || rawSort === 'menor-preco' || rawSort === 'maior-area' ? rawSort : 'recente'

  const words = normalize(query).trim().split(/\s+/).filter(Boolean)
  const filtered = items.filter((item) => {
    if (selectedCondominium && item.condominium?.slug !== selectedCondominium) return false
    if (selectedCities.length && !selectedCities.includes(item.city?.id || '')) return false
    if (selectedNeighborhoods.length && !selectedNeighborhoods.includes(item.neighborhood?.id || '')) return false
    if (selectedTypes.length && !selectedTypes.includes(item.propertyType)) return false
    if (selectedSuites.length && !selectedSuites.includes(String(item.specifications?.suites || ''))) return false

    const hasSale = !!(item.price && item.price > 0)
    const hasRent = !!(item.rentPrice && item.rentPrice > 0)

    if (deal === 'venda' && !hasSale) return false
    if (deal === 'locacao' && !hasRent) return false

    if (deal !== 'locacao' && saleFilterActive) {
      if (!hasSale) return false
      if (item.price! < saleRange[0] || item.price! > saleRange[1]) return false
    }

    if (deal !== 'venda' && rentFilterActive) {
      if (!hasRent) return false
      if (item.rentPrice! < rentRange[0] || item.rentPrice! > rentRange[1]) return false
    }

    const copy = normalize([item.title, item.refCode, item.condominiumName, item.summary, locationOf(item)].filter(Boolean).join(' '))
    return words.every((word) => copy.includes(word))
  })

  const effectivePrice = (item: CatalogItem) => {
    if (deal === 'locacao') return item.rentPrice && item.rentPrice > 0 ? item.rentPrice : null
    if (item.price && item.price > 0) return item.price
    if (item.rentPrice && item.rentPrice > 0) return item.rentPrice
    return null
  }

  const results = sort === 'recente'
    ? filtered
    : [...filtered].sort((a, b) => {
        if (sort === 'maior-area') {
          const areaA = propertyAreaValue(a)
          const areaB = propertyAreaValue(b)
          if (areaA === 0 && areaB === 0) return 0
          if (areaA === 0) return 1
          if (areaB === 0) return -1
          return areaB - areaA
        }
        const priceA = effectivePrice(a)
        const priceB = effectivePrice(b)
        if (priceA === null && priceB === null) return 0
        if (priceA === null) return 1
        if (priceB === null) return -1
        return sort === 'maior-preco' ? priceB - priceA : priceA - priceB
      })

  const activeFilterCount =
    (query ? 1 : 0) +
    (selectedCondominium ? 1 : 0) +
    (deal !== 'ambos' ? 1 : 0) +
    (saleFilterActive ? 1 : 0) +
    (rentFilterActive ? 1 : 0) +
    selectedCities.length +
    selectedNeighborhoods.length +
    selectedTypes.length +
    selectedSuites.length

  const hasAnyFilter = activeFilterCount > 0 || sort !== 'recente'

  const totalPages = Math.max(1, Math.ceil(results.length / catalogPageSize))
  const requestedPage = params.get('pagina') || ''
  const page = full && /^[1-9]\d*$/.test(requestedPage) ? Math.min(Number(requestedPage), totalPages) : 1
  const start = (page - 1) * catalogPageSize
  const displayed = full ? results.slice(start, start + catalogPageSize) : results.slice(0, homeLimit)
  const hasLeadStack = displayed.length === 3 || displayed.length === homeLimit
  const Title = full && !scopeTitle ? 'h1' : 'h2'
  const typeTitle = selectedTypes.length > 1
    ? 'Imóveis selecionados para você'
    : selectedTypes[0] === 'Casa/Mansão' ? 'Casas e mansões' : selectedTypes[0] || 'Imóveis'
  const title = !full ? 'Explore os imóveis'
    : selectedTypes.length || selectedCondominium
      ? [typeTitle, scopeTitle ? scopeTitle.replace(/^Imóveis /, '') : selectedCondominium ? 'em ' + (condominiumName || 'condomínio selecionado') : ''].filter(Boolean).join(' ')
      : activeFilterCount > 0 ? scopeTitle || 'Imóveis selecionados' : scopeTitle || 'Todos os imóveis'

  function pageHref(target: number) {
    const nextParams = new URLSearchParams(params.toString())
    if (target === 1) nextParams.delete('pagina')
    else nextParams.set('pagina', String(target))
    const search = nextParams.toString()
    return basePath + (search ? '?' + search : '') + '#resultados'
  }

  function updateSearch(value: string) {
    const url = new URL(window.location.href)
    if (value) url.searchParams.set('busca', value)
    else url.searchParams.delete('busca')
    url.searchParams.delete('pagina')
    window.history.replaceState(null, '', url)
  }

  function commitRangeParams(minKey: 'vendaMin' | 'locacaoMin', maxKey: 'vendaMax' | 'locacaoMax', vals: number[], bounds: {min: number; max: number}) {
    const [low, high] = vals
    const url = new URL(window.location.href)
    url.searchParams.delete('pagina')
    if (low > bounds.min) url.searchParams.set(minKey, String(low))
    else url.searchParams.delete(minKey)
    if (high < bounds.max) url.searchParams.set(maxKey, String(high))
    else url.searchParams.delete(maxKey)
    window.history.replaceState(null, '', url)
  }

  function updateSingleParam(key: 'negocio' | 'ordem', value: string, defaultValue = '') {
    const url = new URL(window.location.href)
    url.searchParams.delete('pagina')
    if (!value || value === defaultValue) url.searchParams.delete(key)
    else url.searchParams.set(key, value)
    if (key === 'negocio') {
      if (value === 'locacao') {
        url.searchParams.delete('vendaMin')
        url.searchParams.delete('vendaMax')
      } else if (value === 'venda') {
        url.searchParams.delete('locacaoMin')
        url.searchParams.delete('locacaoMax')
      }
    }
    window.history.pushState(null, '', url)
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
    for (const key of ['busca', 'cidade', 'bairro', 'tipo', 'suites', 'condominio', 'negocio', 'vendaMin', 'vendaMax', 'locacaoMin', 'locacaoMax', 'ordem', 'pagina']) {
      url.searchParams.delete(key)
    }
    window.history.pushState(null, '', url)
  }

  const cardsGrid = displayed.length ? (
    <div className={'grid gap-3 sm:gap-4 xl:gap-5 ' + (full ? (isEcommerceLayout && !desktopFiltersOpen ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2') : 'min-[801px]:grid-cols-12')}>
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

        const sizes = full ? '(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 38vw' : '(max-width: 800px) 100vw, ' + desktopImageWidth
        const cardHeight = full
          ? 'aspect-square'
          : isLead
            ? 'sm:min-h-[36rem]'
            : isStacked
              ? 'sm:min-h-[28rem] xl:min-h-[30rem]'
              : 'sm:min-h-[32rem] xl:min-h-[35rem]'
        const titleSize = isLead
          ? 'text-[clamp(1.65rem,2.75vw,3.25rem)]'
          : 'text-[clamp(1.35rem,1.8vw,2rem)]'
        const titleStyle = isLead ? heading : 'font-sans font-semibold leading-tight tracking-tight'
        const condoName = item.condominium?.name || item.condominiumName
        const condoSlug = item.condominium?.slug
        const refCode = item.refCode?.trim()
        const location = [item.neighborhood?.name, item.city?.name].filter(Boolean).join(', ')
        const area = cardAreaOf(item) || cardAttributesOf(item).find((value) => /^[\d.,]+\s*m²$/i.test(value.trim()))
        const badgeBase =
          'inline-flex items-center gap-1.5 border border-white/20 bg-black/40 px-2.5 py-1.5 text-[11px] font-medium tracking-wide text-white shadow-[0_6px_18px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-md backdrop-saturate-150'
        const topBadges = (condoName || refCode) ? (
          <div className="pointer-events-none absolute top-3.5 right-3.5 left-3.5 z-20 flex flex-wrap items-center gap-1.5 sm:top-4 sm:right-4 sm:left-4">
            {condoName && (
              condoSlug ? (
                <Link
                  href={'/condominios/' + encodeURIComponent(condoSlug)}
                  className={badgeBase + ' pointer-events-auto group/condo max-w-full transition-colors hover:border-white/35 hover:bg-black/55'}
                >
                  <Building2 aria-hidden="true" size={12} className="shrink-0 text-white/85" />
                  <span className="truncate">{condoName}</span>
                  <ArrowUpRight
                    aria-hidden="true"
                    size={12}
                    className="shrink-0 text-white/75 transition-transform duration-200 group-hover/condo:translate-x-0.5 group-hover/condo:-translate-y-0.5"
                  />
                </Link>
              ) : (
                <span className={badgeBase + ' max-w-full'}>
                  <Building2 aria-hidden="true" size={12} className="shrink-0 text-white/85" />
                  <span className="truncate">{condoName}</span>
                </span>
              )
            )}
            {refCode && (
              <span className={badgeBase + ' text-white/90 tabular-nums'}>
                Cód. {refCode}
              </span>
            )}
          </div>
        ) : null

        return (
          <Reveal key={item.id} className={gridClass + ' relative min-w-0 motion-safe:opacity-0 motion-safe:data-[entered=true]:opacity-100 motion-safe:data-[entered=true]:animate-enter'}>
            {topBadges}
            {full ? (
              <Link
                className="group relative isolate flex h-full min-w-0 flex-col sm:aspect-square sm:flex-row sm:items-end sm:overflow-hidden sm:bg-coal sm:px-6 sm:pt-32 sm:pb-6 sm:shadow-[0_8px_24px_rgba(15,23,42,0.05)] sm:ring-1 sm:ring-inset sm:ring-black/[0.04] sm:transition-shadow sm:duration-300 sm:after:pointer-events-none sm:after:absolute sm:after:inset-0 sm:after:z-10 sm:after:ring-1 sm:after:ring-inset sm:after:ring-white/[0.06] sm:after:transition-colors sm:after:duration-300 sm:hover:after:ring-white/[0.12] dark:sm:shadow-[0_12px_30px_rgba(0,0,0,0.35)] dark:sm:ring-white/[0.05]"
                href={'/imoveis/' + encodeURIComponent(item.slug)}
              >
                <div className="relative aspect-square w-full overflow-hidden bg-coal sm:absolute sm:inset-0 sm:-z-10 sm:aspect-auto sm:size-full">
                  <Frame className="size-full object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-104 motion-safe:group-focus-visible:scale-104" photo={item.image} sizes={sizes} />
                  {item.alternate && <div className="absolute inset-0 [clip-path:inset(0_100%_0_0)] group-focus-visible:[clip-path:inset(0)] group-hover:[clip-path:inset(0)] motion-safe:transition-[clip-path] motion-safe:duration-700" aria-hidden="true">
                    <Frame className="size-full object-cover" photo={item.alternate} sizes={sizes} />
                  </div>}
                  <div className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(to_top,rgba(8,8,8,0.98)_0%,rgba(8,8,8,0.88)_28%,rgba(8,8,8,0.52)_50%,rgba(8,8,8,0.12)_72%,transparent_88%)] sm:block" />
                </div>
                <div className="flex flex-1 flex-col pt-4 sm:absolute sm:right-6 sm:bottom-6 sm:left-6 sm:block sm:pt-0 sm:text-white">
                  {item.propertyType && <p className="mb-1.5 text-[11px] font-semibold tracking-wider text-piramide uppercase sm:mb-2 sm:text-xs sm:font-medium sm:tracking-wide sm:text-white/80 sm:normal-case">{item.propertyType}</p>}
                  <h3 className="min-w-0 font-sans text-lg font-semibold leading-snug tracking-tight text-espresso line-clamp-2 sm:text-[clamp(1.35rem,1.8vw,2rem)] sm:leading-tight sm:text-white" title={item.title}>{item.title}</h3>
                  {location && <p className="mt-2 flex items-start gap-1.5 text-sm leading-relaxed text-earth sm:gap-2 sm:text-white/90"><MapPin aria-hidden="true" size={15} className="mt-0.5 shrink-0 text-piramide/80 sm:text-white/90" /><span>{location}</span></p>}
                  {(area || item.specifications?.suites || item.specifications?.parking) && (
                    <ul aria-label="Características do imóvel" className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-medium text-espresso/85 sm:hidden [&>li]:inline-flex [&>li]:items-center [&>li]:gap-1.5 [&>li]:whitespace-nowrap [&>li]:tabular-nums [&>li:not(:first-child)]:before:me-1 [&>li:not(:first-child)]:before:size-1 [&>li:not(:first-child)]:before:rounded-full [&>li:not(:first-child)]:before:bg-earth/40 [&_svg]:shrink-0 [&_svg]:text-piramide">
                      {area && <li><Ruler size={14} strokeWidth={1.7} aria-hidden="true" /><span>{area}</span></li>}
                      {!!item.specifications?.suites && <li><BedDouble size={14} strokeWidth={1.7} aria-hidden="true" /><span>{item.specifications.suites} {item.specifications.suites === 1 ? 'suíte' : 'suítes'}</span></li>}
                      {!!item.specifications?.parking && <li><CarFront size={14} strokeWidth={1.7} aria-hidden="true" /><span>{item.specifications.parking} {item.specifications.parking === 1 ? 'vaga' : 'vagas'}</span></li>}
                    </ul>
                  )}
                  <div className="hidden sm:grid sm:grid-rows-[0fr] sm:opacity-0 sm:transition-[grid-template-rows,opacity] sm:duration-300 sm:ease-out sm:group-hover:grid-rows-[1fr] sm:group-hover:opacity-100 sm:group-focus-visible:grid-rows-[1fr] sm:group-focus-visible:opacity-100 motion-reduce:transition-none">
                    <div className="min-h-0 overflow-hidden">
                      {item.summary && <p className="mt-4 line-clamp-2 max-w-[52ch] text-sm leading-relaxed text-white/80">{item.summary}</p>}
                      <ul aria-label="Características do imóvel" className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-medium text-white [&>li]:inline-flex [&>li]:items-center [&>li]:gap-2 [&>li]:whitespace-nowrap [&>li]:tabular-nums [&>li:not(:first-child)]:before:me-1 [&>li:not(:first-child)]:before:size-1 [&>li:not(:first-child)]:before:rounded-full [&>li:not(:first-child)]:before:bg-white/50 [&_svg]:shrink-0 [&_svg]:text-white/80">
                        {area && <li><Ruler size={16} strokeWidth={1.7} aria-hidden="true" /><span>{area}</span></li>}
                        {!!item.specifications?.suites && <li><BedDouble size={16} strokeWidth={1.7} aria-hidden="true" /><span>{item.specifications.suites} {item.specifications.suites === 1 ? 'suíte' : 'suítes'}</span></li>}
                        {!!item.specifications?.parking && <li><CarFront size={16} strokeWidth={1.7} aria-hidden="true" /><span>{item.specifications.parking} {item.specifications.parking === 1 ? 'vaga' : 'vagas'}</span></li>}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-auto sm:mt-0">
                    <CardPriceRow price={item.price} rentPrice={item.rentPrice} surface="responsive" />
                  </div>
                </div>
              </Link>
            ) : (
              <Link
                className={'group relative isolate flex h-full min-w-0 flex-col sm:flex-row sm:items-end sm:overflow-hidden sm:bg-coal sm:px-6 sm:pt-32 sm:pb-6 sm:shadow-[0_8px_24px_rgba(15,23,42,0.05)] sm:ring-1 sm:ring-inset sm:ring-black/[0.04] sm:transition-shadow sm:duration-300 sm:after:pointer-events-none sm:after:absolute sm:after:inset-0 sm:after:z-10 sm:after:ring-1 sm:after:ring-inset sm:after:ring-white/[0.06] sm:after:transition-colors sm:after:duration-300 sm:hover:after:ring-white/[0.12] dark:sm:shadow-[0_12px_30px_rgba(0,0,0,0.35)] dark:sm:ring-white/[0.05] ' + cardHeight + (isLead ? ' xl:px-8 xl:pt-36 xl:pb-8' : '')}
                href={'/imoveis/' + encodeURIComponent(item.slug)}
              >
                <div aria-hidden="true" className="relative aspect-square w-full overflow-hidden bg-coal sm:absolute sm:inset-0 sm:-z-10 sm:aspect-auto sm:size-full">
                  <Frame className="size-full object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-104 motion-safe:group-focus-visible:scale-104" photo={item.image} sizes={sizes} />
                  {item.alternate && <div className="absolute inset-0 [clip-path:inset(0_100%_0_0)] group-focus-visible:[clip-path:inset(0)] group-hover:[clip-path:inset(0)] motion-safe:transition-[clip-path] motion-safe:duration-700" aria-hidden="true">
                    <Frame className="size-full object-cover" photo={item.alternate} sizes={sizes} />
                  </div>}
                  <div className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(to_top,rgba(8,8,8,0.98)_0%,rgba(8,8,8,0.88)_28%,rgba(8,8,8,0.52)_50%,rgba(8,8,8,0.12)_72%,transparent_88%)] sm:block" />
                </div>
                <div className={'flex flex-1 flex-col pt-4 sm:absolute sm:right-6 sm:bottom-6 sm:left-6 sm:block sm:pt-0 sm:text-white ' + (isLead ? 'xl:right-8 xl:bottom-8 xl:left-8' : '')}>
                  {item.propertyType && <p className="mb-1.5 text-[11px] font-semibold tracking-wider text-piramide uppercase sm:mb-2 sm:text-xs sm:font-medium sm:tracking-wide sm:text-white/80 sm:normal-case">{item.propertyType}</p>}
                  <h3 className={titleStyle + ' min-w-0 line-clamp-2 text-lg leading-snug text-espresso sm:text-white ' + (isLead ? 'sm:text-[clamp(1.65rem,2.75vw,3.25rem)]' : 'sm:text-[clamp(1.35rem,1.8vw,2rem)] sm:leading-tight')} title={item.title}>{item.title}</h3>
                  {location && <p className="mt-2 flex items-start gap-1.5 text-sm leading-relaxed text-earth sm:gap-2 sm:text-white/90"><MapPin aria-hidden="true" size={15} className="mt-0.5 shrink-0 text-piramide/80 sm:text-white/90" /><span>{location}</span></p>}
                  {(area || item.specifications?.suites || item.specifications?.parking) && (
                    <ul aria-label="Características do imóvel" className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-medium text-espresso/85 sm:hidden [&>li]:inline-flex [&>li]:items-center [&>li]:gap-1.5 [&>li]:whitespace-nowrap [&>li]:tabular-nums [&>li:not(:first-child)]:before:me-1 [&>li:not(:first-child)]:before:size-1 [&>li:not(:first-child)]:before:rounded-full [&>li:not(:first-child)]:before:bg-earth/40 [&_svg]:shrink-0 [&_svg]:text-piramide">
                      {area && <li><Ruler size={14} strokeWidth={1.7} aria-hidden="true" /><span>{area}</span></li>}
                      {!!item.specifications?.suites && <li><BedDouble size={14} strokeWidth={1.7} aria-hidden="true" /><span>{item.specifications.suites} {item.specifications.suites === 1 ? 'suíte' : 'suítes'}</span></li>}
                      {!!item.specifications?.parking && <li><CarFront size={14} strokeWidth={1.7} aria-hidden="true" /><span>{item.specifications.parking} {item.specifications.parking === 1 ? 'vaga' : 'vagas'}</span></li>}
                    </ul>
                  )}
                  <div className="hidden sm:grid sm:grid-rows-[0fr] sm:opacity-0 sm:transition-[grid-template-rows,opacity] sm:duration-300 sm:ease-out sm:group-hover:grid-rows-[1fr] sm:group-hover:opacity-100 sm:group-focus-visible:grid-rows-[1fr] sm:group-focus-visible:opacity-100 motion-reduce:transition-none">
                    <div className="min-h-0 overflow-hidden">
                      {item.summary && <p className="mt-4 line-clamp-2 max-w-[52ch] text-sm leading-relaxed text-white/80">{item.summary}</p>}
                      <ul aria-label="Características do imóvel" className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-medium text-white [&>li]:inline-flex [&>li]:items-center [&>li]:gap-2 [&>li]:whitespace-nowrap [&>li]:tabular-nums [&>li:not(:first-child)]:before:me-1 [&>li:not(:first-child)]:before:size-1 [&>li:not(:first-child)]:before:rounded-full [&>li:not(:first-child)]:before:bg-white/50 [&_svg]:shrink-0 [&_svg]:text-white/80">
                        {area && <li><Ruler size={16} strokeWidth={1.7} aria-hidden="true" /><span>{area}</span></li>}
                        {!!item.specifications?.suites && <li><BedDouble size={16} strokeWidth={1.7} aria-hidden="true" /><span>{item.specifications.suites} {item.specifications.suites === 1 ? 'suíte' : 'suítes'}</span></li>}
                        {!!item.specifications?.parking && <li><CarFront size={16} strokeWidth={1.7} aria-hidden="true" /><span>{item.specifications.parking} {item.specifications.parking === 1 ? 'vaga' : 'vagas'}</span></li>}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-auto sm:mt-0">
                    <CardPriceRow price={item.price} rentPrice={item.rentPrice} surface="responsive" />
                  </div>
                </div>
              </Link>
            )}
          </Reveal>
        )
      })}
    </div>
  ) : (
    <EmptyState icon={House} title={hasAnyFilter ? 'Nenhum imóvel encontrado' : 'Novos imóveis em breve'} description={hasAnyFilter ? 'Não encontramos imóveis com os filtros aplicados. Tente ajustar os critérios ou limpar a seleção para explorar todo o portfólio.' : 'Estamos preparando uma seleção exclusiva de imóveis para você. Em breve, novas oportunidades estarão disponíveis aqui.'} onClear={hasAnyFilter ? clear : undefined} />
  )

  const pagination = full && totalPages > 1 ? (() => {
    const pages: (number | 'ellipsis')[] = []
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
        pages.push(i)
      } else if (pages[pages.length - 1] !== 'ellipsis') {
        pages.push('ellipsis')
      }
    }
    return (
      <nav aria-label="Paginação dos imóveis" className="mt-8 flex flex-wrap items-center justify-center gap-1.5">
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
  })() : null

  return (
    <section id="imoveis" className={wrap + ' relative z-10 scroll-mt-4 ' + (full ? (fixedLocation ? 'pt-10 pb-14 sm:pt-14 sm:pb-20' : 'pt-6 pb-20 sm:pt-8 sm:pb-28') : 'pt-6 pb-10 sm:pt-8 sm:pb-12')}>
      <Reveal className="group mb-5 sm:mb-7">
        <p className={eyebrow + ' mb-1.5 text-[.68rem] text-piramide ' + riseIn}>Portfólio Pirâmide Imóveis Prime</p>
        <Title className={homeSectionHeading}><Words key={title} text={title} start={100} /></Title>
        {selectedCondominium && (
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-piramide">
            <Link href={'/condominios/' + encodeURIComponent(selectedCondominium)} className="hover:underline">
              Conhecer {condominiumName || 'o condomínio'}
            </Link>
            <button
              type="button"
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 border border-piramide/25 px-3"
              onClick={() => {
                const url = new URL(window.location.href)
                url.searchParams.delete('condominio')
                url.searchParams.delete('pagina')
                window.history.pushState(null, '', url)
              }}
            >
              Remover condomínio <X size={14} aria-hidden="true" />
            </button>
          </div>
        )}
      </Reveal>

      {(full || items.length > 0) ? (
        isEcommerceLayout ? (
          <div
            className={
              'grid gap-7 motion-safe:transition-[grid-template-columns,gap] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] ' +
              (desktopFiltersOpen
                ? 'lg:grid-cols-[19.5rem_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[21rem_minmax(0,1fr)] xl:gap-10'
                : 'lg:grid-cols-[0rem_minmax(0,1fr)] lg:gap-0')
            }
          >
            <aside
              aria-label="Filtros do catálogo"
              className={
                'min-w-0 motion-safe:transition-[opacity,padding,border-color] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] lg:border-r ' +
                (desktopFiltersOpen
                  ? 'lg:border-rule lg:pr-8 lg:opacity-100 xl:pr-10'
                  : 'lg:pointer-events-none lg:overflow-hidden lg:border-transparent lg:pr-0 lg:opacity-0')
              }
            >
              <button
                type="button"
                onClick={() => setMobileFiltersOpen((prev) => !prev)}
                aria-expanded={mobileFiltersOpen}
                className={glassField + ' mb-3 w-full cursor-pointer justify-between lg:hidden'}
              >
                <span className="inline-flex items-center gap-2.5 text-sm font-semibold text-espresso">
                  <SlidersHorizontal aria-hidden="true" size={16} className="text-piramide" />
                  <span>Filtros</span>
                  {activeFilterCount > 0 && (
                    <span className="bg-piramide px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </span>
                <ChevronDown aria-hidden="true" size={16} className={'text-piramide transition-transform ' + (mobileFiltersOpen ? 'rotate-180' : '')} />
              </button>

              <form
                role="search"
                aria-label="Filtrar imóveis"
                onSubmit={(event) => event.preventDefault()}
                className={
                  'space-y-4 border-b border-rule pb-6 lg:sticky lg:top-6 lg:w-[17.5rem] lg:border-b-0 lg:pb-0 xl:w-[18.5rem] ' +
                  (mobileFiltersOpen ? 'block' : 'hidden lg:block')
                }
              >
                <div className="flex items-center justify-between border-b border-rule pb-3">
                  <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-espresso uppercase">
                    <SlidersHorizontal aria-hidden="true" size={14} className="text-piramide" />
                    Filtros
                  </span>
                  <div className="flex items-center gap-3">
                    {hasAnyFilter && (
                      <button
                        type="button"
                        onClick={clear}
                        className="cursor-pointer text-xs font-semibold text-piramide transition-opacity hover:opacity-75"
                      >
                        Limpar tudo
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setDesktopFiltersOpen(false)}
                      aria-label="Recolher filtros"
                      title="Recolher filtros"
                      className="hidden cursor-pointer items-center gap-1.5 text-xs font-medium text-earth transition-colors hover:text-espresso lg:inline-flex"
                    >
                      <PanelLeftClose aria-hidden="true" size={16} />
                    </button>
                  </div>
                </div>

                <div className={glassField}>
                  <label className="flex min-w-0 flex-1 items-center gap-3">
                    <Search aria-hidden="true" size={16} strokeWidth={1.6} className="shrink-0 text-piramide" />
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

                <div className="space-y-2">
                  <span className="block text-[10px] font-semibold tracking-wider text-earth uppercase">Finalidade</span>
                  <div
                    role="group"
                    aria-label="Finalidade do imóvel"
                    className="grid grid-cols-3 border border-zinc-200/80 bg-zinc-100/80 p-1 dark:border-white/[0.06] dark:bg-white/[0.03]"
                  >
                    {([
                      {value: 'ambos', label: 'Ambos'},
                      {value: 'venda', label: 'Venda'},
                      {value: 'locacao', label: 'Locação'},
                    ] as const).map((option) => {
                      const active = deal === option.value
                      return (
                        <button
                          key={option.value}
                          type="button"
                          aria-pressed={active}
                          onClick={() => updateSingleParam('negocio', option.value, 'ambos')}
                          className={
                            'cursor-pointer py-1.5 text-xs font-semibold transition-all ' +
                            (active
                              ? 'bg-piramide text-white shadow-xs'
                              : 'text-earth hover:text-espresso')
                          }
                        >
                          {option.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {deal !== 'locacao' && (
                  <div className="border-t border-rule pt-4">
                    <Slider
                      label="Valor de compra"
                      min={saleBounds.min}
                      max={saleBounds.max}
                      step={100_000}
                      minStepsBetweenThumbs={1}
                      value={saleRange}
                      onValueChange={(vals) => setSaleRange([vals[0], vals[1]])}
                      onValueCommit={(vals) => commitRangeParams('vendaMin', 'vendaMax', vals, saleBounds)}
                      showValue
                      showTooltip
                      histogramData={saleHistogram}
                      histogramHeight={26}
                      formatTooltip={formatCompactCurrency}
                      formatValue={([low, high]) =>
                        low === saleBounds.min && high === saleBounds.max
                          ? 'Qualquer'
                          : `${formatCompactCurrency(low)} – ${formatCompactCurrency(high)}`
                      }
                    />
                  </div>
                )}

                {deal !== 'venda' && (
                  <div className="border-t border-rule pt-4">
                    <Slider
                      label="Valor de locação (/ mês)"
                      min={rentBounds.min}
                      max={rentBounds.max}
                      step={500}
                      minStepsBetweenThumbs={1}
                      value={rentRange}
                      onValueChange={(vals) => setRentRange([vals[0], vals[1]])}
                      onValueCommit={(vals) => commitRangeParams('locacaoMin', 'locacaoMax', vals, rentBounds)}
                      showValue
                      showTooltip
                      histogramData={rentHistogram}
                      histogramHeight={24}
                      formatTooltip={formatCompactCurrency}
                      formatValue={([low, high]) =>
                        low === rentBounds.min && high === rentBounds.max
                          ? 'Qualquer'
                          : `${formatCompactCurrency(low)} – ${formatCompactCurrency(high)}`
                      }
                    />
                  </div>
                )}

                <div className="space-y-2.5 border-t border-rule pt-4">
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
              </form>
            </aside>

            <div className="flex min-w-0 flex-col">
              <div id="resultados" className="mb-4 flex scroll-mt-4 flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {!desktopFiltersOpen && (
                    <button
                      type="button"
                      onClick={() => setDesktopFiltersOpen(true)}
                      className="hidden min-h-11 cursor-pointer items-center gap-2.5 border border-zinc-200/80 bg-white/80 px-3.5 text-xs font-semibold text-espresso shadow-[0_4px_16px_rgba(15,23,42,0.03)] backdrop-blur-md backdrop-saturate-150 transition-all hover:border-zinc-300 hover:bg-white focus-visible:border-piramide/70 lg:inline-flex dark:border-white/[0.06] dark:bg-white/[0.03] dark:shadow-[0_6px_20px_rgba(0,0,0,0.22)] dark:hover:border-white/[0.12] dark:hover:bg-white/[0.05]"
                    >
                      <PanelLeftOpen aria-hidden="true" size={15} className="shrink-0 text-piramide" />
                      <span>Mostrar filtros</span>
                      {activeFilterCount > 0 && (
                        <span className="bg-piramide px-1.5 py-0.5 text-[10px] font-bold text-white">
                          {activeFilterCount}
                        </span>
                      )}
                    </button>
                  )}
                  <span aria-live="polite" className="text-xs font-medium text-earth sm:text-sm">
                    {results.length} {results.length === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}
                  </span>
                </div>
                <SortDropdown
                  value={sort}
                  onChange={(next) => updateSingleParam('ordem', next, 'recente')}
                />
              </div>
              {cardsGrid}
              {pagination}
            </div>
          </div>
        ) : (
          <>
            <form role="search" aria-label="Filtrar imóveis" className="grid items-start gap-3 min-[1100px]:grid-cols-[minmax(14rem,1fr)_minmax(0,3.4fr)] xl:grid-cols-[minmax(16rem,1.1fr)_minmax(0,3.4fr)]" onSubmit={(event) => event.preventDefault()}>
              <div className={glassField}>
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
                <div className={'grid grid-cols-1 gap-2 sm:gap-3 ' + (fixedLocation ? suiteCounts.length ? 'sm:grid-cols-2' : 'sm:grid-cols-1' : suiteCounts.length ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3')}>
                  {!fixedLocation && <>
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
                  </>}
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
            <div id={full ? 'resultados' : undefined} className="flex min-h-9 scroll-mt-4 items-center justify-between text-xs text-earth">
              <span aria-live="polite">{results.length} {results.length === 1 ? 'imóvel' : 'imóveis'}</span>
              {hasAnyFilter && <button type="button" className="cursor-pointer py-2 font-medium text-piramide transition-opacity hover:opacity-80" onClick={clear}>Limpar filtros</button>}
            </div>
            {cardsGrid}
            {!full && (showAllLink || items.length > homeLimit) && (
              <div className="mt-6 flex justify-end">
                <Link href="/imoveis" className="group/explore inline-flex min-h-11 w-fit items-center gap-2.5 text-right text-sm text-espresso transition-colors hover:text-piramide motion-reduce:transition-none sm:text-base">
                  Ver todos os imóveis <ArrowUpRight aria-hidden="true" size={18} className="shrink-0 motion-safe:transition-transform motion-safe:group-hover/explore:translate-x-0.5 motion-safe:group-hover/explore:-translate-y-0.5" />
                </Link>
              </div>
            )}
            {pagination}
          </>
        )
      ) : (
        <EmptyState
          icon={House}
          title={hasAnyFilter ? 'Nenhum imóvel encontrado' : 'Novos imóveis em breve'}
          description={hasAnyFilter ? 'Não encontramos imóveis com os filtros aplicados. Tente ajustar os critérios ou limpar a seleção para explorar todo o portfólio.' : 'Estamos preparando uma seleção exclusiva de imóveis para você. Em breve, novas oportunidades estarão disponíveis aqui.'}
          onClear={hasAnyFilter ? clear : undefined}
        />
      )}
    </section>
  )
}

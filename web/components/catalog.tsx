'use client'

import Link from 'next/link'
import {useSearchParams} from 'next/navigation'
import {MultiSelect} from './multiSelect'
import {ArrowLeft, ArrowRight, ArrowUpRight, BedDouble, Building2, CarFront, House, MapPin, Ruler, Search, SlidersHorizontal, X} from 'lucide-react'
import {availabilityLabel, cardAreaOf, cardAttributesOf, catalogPageSize, locationOf, propertyPrice, type PropertyCard} from '../lib/model'
import type {Picture} from '../lib/image'
import {button, eyebrow, heading, homeSectionHeading, riseIn, wrap} from '../lib/classes'
import {Frame} from './media'
import {Reveal, Words} from './motion'

export type CatalogItem = Omit<PropertyCard, 'cover'> & {image: Picture; alternate?: Picture}
const collator = new Intl.Collator('pt-BR', {sensitivity: 'base'})
const normalize = (text: string) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('pt-BR')
const homeLimit = 5
const paginationLink = 'inline-flex min-h-11 items-center gap-2 px-3 text-sm font-semibold text-piramide transition-colors hover:bg-piramide/10'
const filterField = 'flex min-h-15 items-center gap-3 border-b border-espresso/25 bg-transparent px-1 transition-colors hover:border-espresso/55 focus-within:border-piramide sm:px-2'

export function Catalog({items, full = false, scopeTitle, fixedLocation = false, showAllLink = false, basePath = '/empreendimentos'}: {items: CatalogItem[]; full?: boolean; scopeTitle?: string; fixedLocation?: boolean; showAllLink?: boolean; basePath?: string}) {
  const params = useSearchParams()
  const query = params.get('busca') || ''
  const selectedCondominium = params.get('condominio') || ''
  const condominiumName = items.find((item) => item.condominium?.slug === selectedCondominium)?.condominium?.name
  const cities = Array.from(new Map(items.flatMap(({city}) => city ? [[city.id, city]] : [])).values()).sort((a, b) => collator.compare(a.name, b.name))
  const selectedCities = (fixedLocation ? [] : params.getAll('cidade')).filter((value) => cities.some(({id}) => id === value))
  const neighborhoods = Array.from(new Map(items.flatMap(({neighborhood, city}) => (
    neighborhood && (!selectedCities.length || (city && selectedCities.includes(city.id)))
      ? [[neighborhood.id, {...neighborhood, label: selectedCities.length === 1 ? neighborhood.name : [neighborhood.name, city?.name].filter(Boolean).join(', ')}]]
      : []
  ))).values()).sort((a, b) => collator.compare(a.label, b.label))
  const selectedNeighborhoods = (fixedLocation ? [] : params.getAll('bairro')).filter((value) => neighborhoods.some(({id}) => id === value))
  const types = Array.from(new Set(items.map(({propertyType}) => propertyType))).filter(Boolean).sort(collator.compare)
  const selectedTypes = params.getAll('tipo').filter((value) => types.includes(value))
  const suiteCounts = Array.from(new Set(items.map(({specifications}) => specifications?.suites).filter((n): n is number => typeof n === 'number' && n > 0))).sort((a, b) => a - b)
  const suiteValues = suiteCounts.map(String)
  const selectedSuites = params.getAll('suites').filter((value) => suiteValues.includes(value))
  const words = normalize(query).trim().split(/\s+/).filter(Boolean)
  const results = items.filter((item) => {
    if (selectedCondominium && item.condominium?.slug !== selectedCondominium) return false
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
  const Title = full && !scopeTitle ? 'h1' : 'h2'
  const typeTitle = selectedTypes.length > 1
    ? 'Imóveis selecionados para você'
    : selectedTypes[0] === 'Casa/Mansão' ? 'Casas e mansões à venda' : selectedTypes[0] || 'Imóveis'
  const title = !full ? 'Explore os imóveis'
    : selectedTypes.length || selectedCondominium
      ? [typeTitle, scopeTitle ? scopeTitle.replace(/^Imóveis /, '') : selectedCondominium ? 'em ' + (condominiumName || 'condomínio selecionado') : ''].filter(Boolean).join(' ')
      : query || selectedCities.length || selectedNeighborhoods.length || selectedSuites.length ? scopeTitle || 'Imóveis selecionados' : scopeTitle || 'Todos os imóveis'


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
    for (const key of ['busca', 'cidade', 'bairro', 'tipo', 'suites', 'condominio', 'pagina']) url.searchParams.delete(key)
    window.history.pushState(null, '', url)
  }

  return (
    <section id="empreendimentos" className={wrap + ' scroll-mt-4 ' + (full ? (fixedLocation ? 'pt-10 pb-14 sm:pt-14 sm:pb-20' : 'pt-[clamp(44px,6vw,98px)] pb-[clamp(55px,8vw,95px)]') : 'pt-6 pb-10 sm:pt-8 sm:pb-12')}>
      <Reveal className="group mb-4 sm:mb-5">
        <p className={eyebrow + ' mb-1.5 text-[.68rem] text-piramide ' + riseIn}>Portfólio Pirâmide Imóveis Prime</p>
        <Title className={homeSectionHeading}><Words key={title} text={title} start={100} /></Title>
        {selectedCondominium && <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-piramide"><Link href={'/condominios/' + encodeURIComponent(selectedCondominium)} className="hover:underline">Conhecer {condominiumName || 'o condomínio'}</Link><button type="button" className="inline-flex min-h-11 cursor-pointer items-center gap-2 border border-piramide/25 px-3" onClick={() => {const url = new URL(window.location.href); url.searchParams.delete('condominio'); url.searchParams.delete('pagina'); window.history.pushState(null, '', url)}}>Remover condomínio <X size={14} aria-hidden="true" /></button></div>}
      </Reveal>
      {items.length ? <>
        <form role="search" aria-label="Filtrar imóveis" className="grid items-start gap-3 min-[1100px]:grid-cols-[minmax(14rem,1fr)_minmax(0,3.4fr)] xl:grid-cols-[minmax(16rem,1.1fr)_minmax(0,3.4fr)]" onSubmit={(event) => event.preventDefault()}>
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
          {(query || selectedCondominium || selectedCities.length > 0 || selectedNeighborhoods.length > 0 || selectedTypes.length > 0 || selectedSuites.length > 0) && <button type="button" className="cursor-pointer py-2 font-medium text-piramide transition-opacity hover:opacity-80" onClick={clear}>Limpar filtros</button>}
        </div>
        {displayed.length ? <div className={'grid gap-3 sm:gap-4 xl:gap-5 ' + (full ? 'sm:grid-cols-2' : 'min-[801px]:grid-cols-12')}>
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
              : 'text-[clamp(1.35rem,1.8vw,2rem)]'
            const titleStyle = isLead ? heading : 'font-sans font-semibold leading-tight tracking-tight'
            const location = locationOf(item)
            const status = availabilityLabel(item.availability)
            const area = cardAreaOf(item) || cardAttributesOf(item).find((value) => /^[\d.,]+\s*m²$/i.test(value.trim()))

            return (
              <Reveal key={item.id} className={gridClass + ' min-w-0 motion-safe:opacity-0 motion-safe:data-[entered=true]:opacity-100 motion-safe:data-[entered=true]:animate-enter'}>
                <Link
                  className={'group relative isolate flex h-full min-w-0 items-end overflow-hidden bg-coal px-5 pt-28 pb-5 sm:px-6 sm:pt-32 sm:pb-6 ' + cardHeight + (isLead ? ' xl:px-8 xl:pt-36 xl:pb-8' : '')}
                  href={'/' + item.slug}
                >
                  <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
                    <Frame className="size-full object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-104 motion-safe:group-focus-visible:scale-104" photo={item.image} sizes={sizes} />
                    {item.alternate && <div className="absolute inset-0 [clip-path:inset(0_100%_0_0)] group-focus-visible:[clip-path:inset(0)] group-hover:[clip-path:inset(0)] motion-safe:transition-[clip-path] motion-safe:duration-700" aria-hidden="true">
                      <Frame className="size-full object-cover" photo={item.alternate} sizes={sizes} />
                    </div>}
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,#080808_0%,#080808f5_30%,#080808c9_50%,#0808084d_75%,#08080814_100%)]" />
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
                    {item.propertyType && <p className="mb-2 text-xs font-medium tracking-wide text-white/80">{item.propertyType}</p>}
                    <h3 className={titleStyle + ' min-w-0 line-clamp-2 ' + titleSize} title={item.title}>{item.title}</h3>
                    {location && <p className="mt-2 flex items-start gap-2 text-sm leading-relaxed text-white/90"><MapPin aria-hidden="true" size={15} className="mt-0.5 shrink-0" /><span>{location}</span></p>}
                    {item.summary && <p className="mt-2 line-clamp-2 max-w-[52ch] text-sm leading-relaxed text-white/80">{item.summary}</p>}
                    <ul aria-label="Características do imóvel" className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-medium text-white [&>li]:inline-flex [&>li]:items-center [&>li]:gap-2 [&>li]:whitespace-nowrap [&>li]:tabular-nums [&>li:not(:first-child)]:before:me-1 [&>li:not(:first-child)]:before:size-1 [&>li:not(:first-child)]:before:rounded-full [&>li:not(:first-child)]:before:bg-white/50 [&_svg]:shrink-0 [&_svg]:text-white/80">
                      {area && <li><Ruler size={16} strokeWidth={1.7} aria-hidden="true" /><span>{area}</span></li>}
                      {!!item.specifications?.suites && <li><BedDouble size={16} strokeWidth={1.7} aria-hidden="true" /><span>{item.specifications.suites} {item.specifications.suites === 1 ? 'suíte' : 'suítes'}</span></li>}
                      {!!item.specifications?.parking && <li><CarFront size={16} strokeWidth={1.7} aria-hidden="true" /><span>{item.specifications.parking} {item.specifications.parking === 1 ? 'vaga' : 'vagas'}</span></li>}
                    </ul>
                    <p className="mt-4 border-t border-white/20 pt-3 text-[clamp(1.15rem,1.6vw,1.65rem)] leading-snug font-semibold tracking-tight text-white tabular-nums">
                      {propertyPrice(item.price)}
                    </p>
                  </div>
                </Link>
              </Reveal>
            )
          })}
        </div> : <div className="border border-rule p-7 text-earth"><p>Nenhum imóvel encontrado com esses filtros.</p><button type="button" className={button + ' mt-4 cursor-pointer border-piramide text-piramide hover:bg-piramide/10'} onClick={clear}>Limpar filtros</button></div>}
        {!full && (showAllLink || items.length > homeLimit) && (
          <div className="mt-6 flex justify-end">
            <Link href="/empreendimentos" className="group/explore inline-flex min-h-11 w-fit items-center gap-2.5 text-right text-sm text-espresso transition-colors hover:text-piramide motion-reduce:transition-none sm:text-base">
              Ver todos os imóveis <ArrowUpRight aria-hidden="true" size={18} className="shrink-0 motion-safe:transition-transform motion-safe:group-hover/explore:translate-x-0.5 motion-safe:group-hover/explore:-translate-y-0.5" />
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
        })()}
      </> : <div className="border border-rule p-7 text-earth">Nenhum imóvel disponível no momento.</div>}
    </section>
  )
}

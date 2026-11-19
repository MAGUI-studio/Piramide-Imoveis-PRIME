'use client'

import Link from 'next/link'
import {useSearchParams} from 'next/navigation'
import {ArrowLeft, ArrowRight, ArrowUpRight, Building2, MapPin, Search, X} from 'lucide-react'
import type {Condominium} from '../lib/model'
import type {Picture} from '../lib/image'
import {glassField} from '../lib/classes'
import {Frame} from './media'
import {MultiSelect} from './multiSelect'

type Entry = Condominium & {image: Picture; count: number}
const normalize = (value: string) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('pt-BR')
const sortByName = (a: {name: string}, b: {name: string}) => a.name.localeCompare(b.name, 'pt-BR')
const pageSize = 8

function CondominiumCard({condo, featured = false}: {condo: Entry; featured?: boolean}) {
  return <article className="min-w-0">
    <Link href={'/condominios/' + condo.slug} className="group/card block">
      <div
        className={
          'relative isolate overflow-hidden bg-coal ' +
          (featured
            ? 'flex min-h-[28rem] flex-col justify-end p-6 text-white shadow-[0_8px_24px_rgba(15,23,42,0.05)] ring-1 ring-inset ring-black/[0.04] transition-shadow duration-300 after:pointer-events-none after:absolute after:inset-0 after:z-10 after:ring-1 after:ring-inset after:ring-white/[0.06] after:transition-colors after:duration-300 group-hover/card:after:ring-white/[0.12] sm:min-h-[30rem] lg:min-h-[32rem] dark:shadow-[0_12px_30px_rgba(0,0,0,0.35)] dark:ring-white/[0.05]'
            : 'aspect-[1.35]')
        }
      >
        <Frame photo={condo.image} sizes={featured ? '(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw' : '(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw'} className="absolute inset-0 -z-10 size-full object-cover motion-safe:transition-transform motion-safe:duration-700 group-hover/card:scale-104 group-focus-visible/card:scale-104" />
        <div className={'absolute inset-0 -z-10 ' + (featured ? 'bg-[linear-gradient(180deg,#0c0c0e18_15%,#0c0c0ec2_62%,#0c0c0ef2_100%)]' : 'bg-black/10')} />
        <span className="absolute top-4 left-4 bg-black/35 px-2.5 py-1.5 text-[10px] font-medium text-white backdrop-blur-md">{condo.count} {condo.count === 1 ? 'imóvel' : 'imóveis'}</span>
        <span className="absolute top-4 right-4 grid size-9 place-items-center rounded-full bg-white/20 text-white opacity-0 backdrop-blur-md motion-safe:translate-x-[-.35rem] motion-safe:translate-y-[.35rem] transition-[opacity,translate,background-color,color] duration-300 ease-out motion-safe:group-hover/card:translate-x-0 motion-safe:group-hover/card:translate-y-0 motion-safe:group-focus-visible/card:translate-x-0 motion-safe:group-focus-visible/card:translate-y-0 group-hover/card:bg-white group-hover/card:text-coal group-hover/card:opacity-100 group-focus-visible/card:opacity-100 motion-reduce:transition-none"><ArrowUpRight size={18} strokeWidth={1.5} aria-hidden="true" /></span>
        {featured && (
          <div>
            <p className="mb-3 flex items-center gap-2 text-[11px] text-white/80">
              <MapPin size={13} aria-hidden="true" />
              {[condo.neighborhood?.name, condo.city?.name].filter(Boolean).join(', ')}
            </p>
            <h3 className="text-[clamp(1.6rem,2.3vw,2.5rem)] leading-[1.1] font-medium tracking-tight text-balance">
              {condo.name}
            </h3>
            {condo.description && (
              <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-white/80">
                {condo.description}
              </p>
            )}
            <span className="mt-5 inline-flex items-center gap-2 text-xs text-white/85">
              Conhecer condomínio{' '}
              <ArrowUpRight
                size={14}
                aria-hidden="true"
                className="motion-safe:transition-[translate] motion-safe:duration-300 motion-safe:ease-out motion-safe:group-hover/card:translate-x-1 motion-safe:group-hover/card:-translate-y-1 motion-safe:group-focus-visible/card:translate-x-1 motion-safe:group-focus-visible/card:-translate-y-1"
              />
            </span>
          </div>
        )}
      </div>
      {!featured && <div className="pt-4"><p className="mb-2 truncate text-[11px] text-earth">{[condo.neighborhood?.name, condo.city?.name].filter(Boolean).join(', ')}</p><h3 className="line-clamp-2 text-lg leading-snug font-medium tracking-tight transition-colors group-hover/card:text-piramide">{condo.name}</h3><p className="mt-2 line-clamp-2 text-xs leading-relaxed text-earth">{condo.description}</p><span className="mt-3 inline-flex min-h-8 items-center gap-2 text-xs font-medium text-piramide">Explorar condomínio <ArrowUpRight size={13} aria-hidden="true" className="motion-safe:transition-[translate] motion-safe:duration-300 motion-safe:ease-out motion-safe:group-hover/card:translate-x-1 motion-safe:group-hover/card:-translate-y-1 motion-safe:group-focus-visible/card:translate-x-1 motion-safe:group-focus-visible/card:-translate-y-1" /></span></div>}
    </Link>
  </article>
}

export function CondominiumDirectory({items, featuredIds = []}: {items: Entry[]; featuredIds?: string[]}) {
  const params = useSearchParams()
  const query = params.get('busca') || ''
  const selectedCities = params.getAll('cidade')
  const selectedNeighborhoods = params.getAll('bairro')
  const cities = [...new Map(items.flatMap((item) => item.city ? [[item.city.id, item.city] as const] : [])).values()].sort(sortByName)
  const neighborhoods = [...new Map(items.flatMap((item) => item.neighborhood && (!selectedCities.length || selectedCities.includes(item.city?.id || '')) ? [[item.neighborhood.id, item.neighborhood] as const] : [])).values()].sort(sortByName)
  const words = normalize(query).trim().split(/\s+/).filter(Boolean)
  const filtered = !!(words.length || selectedCities.length || selectedNeighborhoods.length)
  const results = items.filter((item) => (!selectedCities.length || selectedCities.includes(item.city?.id || '')) && (!selectedNeighborhoods.length || selectedNeighborhoods.includes(item.neighborhood?.id || '')) && words.every((word) => normalize([item.name, item.neighborhood?.name, item.city?.name].filter(Boolean).join(' ')).includes(word)))
  const featured = [...new Set(featuredIds)].flatMap((id) => {const item = items.find((entry) => entry.id === id); return item ? [item] : []}).slice(0, 3)
  const regular = filtered ? results : results.filter((item) => !featured.some((entry) => entry.id === item.id))
  const totalPages = Math.max(1, Math.ceil(regular.length / pageSize))
  const requested = params.get('pagina') || ''
  const page = /^[1-9]\d*$/.test(requested) ? Math.min(Number(requested), totalPages) : 1
  const displayed = regular.slice((page - 1) * pageSize, page * pageSize)

  function update(key: string, values: string[]) {
    const url = new URL(window.location.href)
    url.searchParams.delete(key)
    values.filter(Boolean).forEach((value) => url.searchParams.append(key, value))
    url.searchParams.delete('pagina')
    if (key === 'cidade') url.searchParams.delete('bairro')
    window.history.replaceState(null, '', url)
  }
  function clear() {
    const url = new URL(window.location.href)
    for (const key of ['busca', 'cidade', 'bairro', 'pagina']) url.searchParams.delete(key)
    window.history.pushState(null, '', url)
  }
  function pageHref(target: number) {
    const next = new URLSearchParams(params.toString())
    if (target === 1) next.delete('pagina')
    else next.set('pagina', String(target))
    return '/condominios' + (next.size ? '?' + next.toString() : '') + '#lista-condominios'
  }
  const pageLink = 'inline-flex min-h-11 min-w-11 items-center justify-center gap-2 px-3 text-sm transition-colors hover:bg-piramide/10 hover:text-piramide'

  return <>
    <form role="search" aria-label="Filtrar condomínios" onSubmit={(event) => event.preventDefault()} className="relative z-20 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
      <div className={glassField + ' sm:col-span-2 lg:col-span-1'}><Search size={17} strokeWidth={1.5} className="shrink-0 text-piramide" aria-hidden="true" /><label className="min-w-0 flex-1"><span className="block text-[10px] font-semibold tracking-wider text-earth uppercase">Buscar condomínio</span><input type="search" value={query} onChange={(event) => update('busca', [event.target.value])} placeholder="Nome ou localização" className="mt-0.5 w-full min-w-0 appearance-none bg-transparent text-sm text-espresso outline-none placeholder:text-earth [&::-webkit-search-cancel-button]:appearance-none" /></label>{query && <button type="button" onClick={() => update('busca', [])} aria-label="Limpar busca" className="grid size-8 cursor-pointer place-items-center text-earth hover:text-piramide"><X size={15} /></button>}</div>
      <MultiSelect label="Cidade" placeholder="Todas as cidades" icon={Building2} values={selectedCities} options={cities.map((city) => ({value: city.id, label: city.name}))} onChange={(values) => update('cidade', values)} />
      <MultiSelect label="Bairro" placeholder="Todos os bairros" icon={MapPin} values={selectedNeighborhoods} options={neighborhoods.map((neighborhood) => ({value: neighborhood.id, label: neighborhood.name}))} onChange={(values) => update('bairro', values)} />
    </form>
    <div className="flex min-h-13 items-center justify-between gap-4 text-xs text-earth"><span role="status">{results.length} {results.length === 1 ? 'condomínio encontrado' : 'condomínios encontrados'}</span>{filtered && <button type="button" onClick={clear} className="min-h-11 cursor-pointer font-medium text-piramide hover:underline">Limpar filtros</button>}</div>
    {!filtered && page === 1 && !!featured.length && <section aria-labelledby="featured-condominiums-title" className="mb-10 sm:mb-12"><div className="mb-4 flex items-baseline justify-between gap-4"><h2 id="featured-condominiums-title" className="text-xl font-medium tracking-tight sm:text-2xl">Condomínios em destaque</h2><span className="text-[10px] tracking-widest text-earth uppercase">Seleção Prime</span></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{featured.map((condo) => <CondominiumCard key={condo.id} condo={condo} featured />)}</div></section>}
    <section id="lista-condominios" aria-labelledby="all-condominiums-title" className="scroll-mt-24"><div className="mb-5 flex flex-wrap items-baseline justify-between gap-3"><h2 id="all-condominiums-title" className="text-xl font-medium tracking-tight sm:text-2xl">{filtered ? 'Resultado da busca' : featured.length ? 'Explore outros condomínios' : 'Todos os condomínios'}</h2>{regular.length > 0 && <p className="text-xs text-earth">{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, regular.length)} de {regular.length}</p>}</div>
      {displayed.length ? <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">{displayed.map((condo) => <CondominiumCard key={condo.id} condo={condo} />)}</div> : <div className="bg-espresso/[.035] px-6 py-10 text-center"><p className="text-lg font-medium">{filtered ? 'Nenhum condomínio encontrado' : 'Novos endereços em breve'}</p><p className="mt-2 text-sm text-earth">{filtered ? 'Tente outro nome ou amplie a localização da busca.' : 'Explore os condomínios em destaque acima.'}</p>{filtered && <button type="button" onClick={clear} className="mt-4 min-h-11 cursor-pointer text-sm font-medium text-piramide hover:underline">Limpar filtros</button>}</div>}
      {totalPages > 1 && <nav aria-label="Paginação dos condomínios" className="mt-9 flex flex-wrap items-center justify-center gap-2">{page > 1 && <Link href={pageHref(page - 1)} rel="prev" aria-label="Página anterior" className={pageLink}><ArrowLeft size={16} /></Link>}{Array.from({length: totalPages}, (_, index) => index + 1).filter((target) => target === 1 || target === totalPages || Math.abs(target - page) <= 1).map((target, index, pages) => <span key={target} className="contents">{index > 0 && target - pages[index - 1] > 1 && <span aria-hidden="true" className="px-2 text-earth">…</span>}<Link href={pageHref(target)} aria-label={'Página ' + target} aria-current={target === page ? 'page' : undefined} className={pageLink + (target === page ? ' bg-piramide text-white hover:bg-piramide hover:text-white' : ' bg-espresso/5 text-espresso')}>{target}</Link></span>)}{page < totalPages && <Link href={pageHref(page + 1)} rel="next" aria-label="Próxima página" className={pageLink}><ArrowRight size={16} /></Link>}</nav>}
    </section>
  </>
}

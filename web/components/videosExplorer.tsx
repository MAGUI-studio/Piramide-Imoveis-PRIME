'use client'

import {useState, useMemo, useRef, useEffect, useCallback, useId} from 'react'
import {useSearchParams} from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  Building2,
  Check,
  ChevronDown,
  LayoutGrid,
  Play,
  Search,
  Video,
  VideoOff,
  X,
  type LucideIcon,
} from 'lucide-react'
import {VideoModalPlayer} from './videoModalPlayer'
import {glassField} from '../lib/classes'
import type {ReelItem} from '../lib/model'

interface VideosExplorerProps {
  reels: ReelItem[]
}

const SORT_OPTIONS = ['newest', 'oldest', 'title-asc', 'title-desc'] as const
type SortOption = (typeof SORT_OPTIONS)[number]

const sortSelectOptions: {value: SortOption; label: string}[] = [
  {value: 'newest', label: 'Mais recentes primeiro'},
  {value: 'oldest', label: 'Mais antigos primeiro'},
  {value: 'title-asc', label: 'Título (A - Z)'},
  {value: 'title-desc', label: 'Título (Z - A)'},
]

const pageSizeSelectOptions: {value: string; label: string}[] = [
  {value: '8', label: '8 vídeos'},
  {value: '16', label: '16 vídeos'},
  {value: '24', label: '24 vídeos'},
]

function parseSortOption(value: string | null): SortOption {
  return value && (SORT_OPTIONS as readonly string[]).includes(value)
    ? (value as SortOption)
    : 'newest'
}

function parsePositiveInt(value: string | null, fallback: number) {
  if (!value || !/^[1-9]\d*$/.test(value)) return fallback
  return Number(value)
}

function GlassSelect<T extends string>({
  label,
  icon: Icon,
  value,
  options,
  onChange,
}: {
  label: string
  icon: LucideIcon
  value: T
  options: {value: T; label: string}[]
  onChange: (value: T) => void
}) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const container = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const current = options.find((opt) => opt.value === value) ?? options[0]

  useEffect(() => {
    if (!open) return
    function closeOutside(event: PointerEvent) {
      if (!container.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeOutside)
    return () => document.removeEventListener('pointerdown', closeOutside)
  }, [open])

  return (
    <div
      ref={container}
      className="relative min-w-0"
      onBlur={(event) => {
        if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false)
        }
      }}
      onKeyDown={(event) => {
        if (!open || event.key !== 'Escape') return
        event.preventDefault()
        event.stopPropagation()
        setOpen(false)
        trigger.current?.focus()
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => setOpen((prev) => !prev)}
        className={
          glassField +
          ' w-full cursor-pointer text-left aria-expanded:border-piramide/70 aria-expanded:ring-1 aria-expanded:ring-piramide/25'
        }
      >
        <Icon aria-hidden="true" size={17} strokeWidth={1.6} className="shrink-0 text-piramide" />
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-semibold tracking-wider text-earth uppercase">
            {label}
          </span>
          <span className="mt-0.5 block truncate text-sm font-medium text-espresso">
            {current.label}
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          size={15}
          className={'shrink-0 text-piramide motion-safe:transition-transform ' + (open ? 'rotate-180' : '')}
        />
      </button>

      {open && (
        <div
          id={id}
          role="listbox"
          aria-label={label}
          className="absolute inset-x-0 top-full z-30 mt-2 border border-[#1b1916]/[0.08] bg-white/80 p-1.5 shadow-[0_16px_40px_rgba(27,25,22,0.10),inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-xl backdrop-saturate-150 motion-safe:animate-enter dark:border-white/[0.08] dark:bg-[#0e0e12]/80 dark:shadow-[0_20px_50px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.05)]"
        >
          {options.map((opt) => {
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
                  trigger.current?.focus()
                }}
                className={
                  'flex min-h-10 w-full cursor-pointer items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors ' +
                  (active
                    ? 'bg-piramide/12 font-semibold text-piramide'
                    : 'text-espresso hover:bg-[#1b1916]/[0.06] dark:hover:bg-white/[0.08]')
                }
              >
                <span className="min-w-0 truncate">{opt.label}</span>
                {active && <Check aria-hidden="true" size={14} className="shrink-0 text-piramide" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function VideosExplorer({reels = []}: VideosExplorerProps) {
  const searchParams = useSearchParams()
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)

  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('q') || '')
  const [sortBy, setSortBy] = useState<SortOption>(() => parseSortOption(searchParams.get('orderby')))
  const [pageSize, setPageSize] = useState<number>(() => {
    const parsed = parsePositiveInt(searchParams.get('limit'), 8)
    return [8, 16, 24].includes(parsed) ? parsed : 8
  })
  const [currentPage, setCurrentPage] = useState<number>(() => parsePositiveInt(searchParams.get('page'), 1))

  const gridTopRef = useRef<HTMLDivElement | null>(null)

  const syncUrl = useCallback(
    (next: {q: string; orderby: SortOption; limit: number; page: number}) => {
      if (typeof window === 'undefined') return
      const url = new URL(window.location.href)
      if (next.q.trim()) url.searchParams.set('q', next.q)
      else url.searchParams.delete('q')

      if (next.orderby !== 'newest') url.searchParams.set('orderby', next.orderby)
      else url.searchParams.delete('orderby')

      if (next.limit !== 8) url.searchParams.set('limit', String(next.limit))
      else url.searchParams.delete('limit')

      if (next.page > 1) url.searchParams.set('page', String(next.page))
      else url.searchParams.delete('page')

      window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash)
    },
    [],
  )

  useEffect(() => {
    syncUrl({q: searchTerm, orderby: sortBy, limit: pageSize, page: currentPage})
  }, [searchTerm, sortBy, pageSize, currentPage, syncUrl])

  const filteredReels = useMemo(() => {
    return reels.filter((reel) => {
      if (searchTerm && searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim()
        const matchTitle = reel.title?.toLowerCase().includes(q)
        const matchProp = reel.propertyTitle?.toLowerCase().includes(q)
        const matchDesc = reel.description?.toLowerCase().includes(q)

        if (!matchTitle && !matchProp && !matchDesc) {
          return false
        }
      }
      return true
    })
  }, [reels, searchTerm])

  const sortedReels = useMemo(() => {
    const list = [...filteredReels]

    switch (sortBy) {
      case 'oldest':
        return list.sort((a, b) => {
          const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
          const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
          return dateA - dateB
        })
      case 'title-asc':
        return list.sort((a, b) => (a.title || '').localeCompare(b.title || '', 'pt-BR'))
      case 'title-desc':
        return list.sort((a, b) => (b.title || '').localeCompare(a.title || '', 'pt-BR'))
      case 'newest':
      default:
        return list.sort((a, b) => {
          const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
          const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
          return dateB - dateA
        })
    }
  }, [filteredReels, sortBy])

  const currentLimit = pageSize || 8
  const totalPages = Math.max(1, Math.ceil(sortedReels.length / currentLimit))
  const safeCurrentPage = Math.min(Math.max(1, currentPage || 1), totalPages)

  const paginatedReels = useMemo(() => {
    const start = (safeCurrentPage - 1) * currentLimit
    return sortedReels.slice(start, start + currentLimit)
  }, [sortedReels, safeCurrentPage, currentLimit])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    if (gridTopRef.current) {
      gridTopRef.current.scrollIntoView({behavior: 'smooth', block: 'start'})
    }
  }

  const handleSearchChange = (val: string) => {
    setSearchTerm(val)
    setCurrentPage(1)
  }

  const handleSortChange = (val: SortOption) => {
    setSortBy(val)
    setCurrentPage(1)
  }

  const handlePageSizeChange = (val: string) => {
    setPageSize(Number(val))
    setCurrentPage(1)
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setSortBy('newest')
    setPageSize(8)
    setCurrentPage(1)
  }

  const hasActiveFilters =
    searchTerm.trim() !== '' || sortBy !== 'newest' || pageSize !== 8

  const handleCardClick = (reelId: string) => {
    const idx = sortedReels.findIndex((r) => r._id === reelId)
    if (idx !== -1) {
      setSelectedIdx(idx)
    }
  }

  const pageBtn =
    'inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-2 px-3 text-sm transition-colors hover:bg-piramide/10 hover:text-piramide disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-current'

  return (
    <div ref={gridTopRef} className="w-full scroll-mt-24">
      <form
        role="search"
        aria-label="Filtrar vídeos"
        onSubmit={(event) => event.preventDefault()}
        className="relative z-20 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]"
      >
        <div className={glassField + ' sm:col-span-2 lg:col-span-1'}>
          <Search size={17} strokeWidth={1.5} className="shrink-0 text-piramide" aria-hidden="true" />
          <label className="min-w-0 flex-1">
            <span className="block text-[10px] font-semibold tracking-wider text-earth uppercase">
              Buscar vídeo
            </span>
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Título, imóvel ou detalhes"
              className="mt-0.5 w-full min-w-0 appearance-none bg-transparent text-sm text-espresso outline-none placeholder:text-earth [&::-webkit-search-cancel-button]:appearance-none"
            />
          </label>
          {searchTerm && (
            <button
              type="button"
              onClick={() => handleSearchChange('')}
              aria-label="Limpar busca"
              className="grid size-8 cursor-pointer place-items-center text-earth hover:text-piramide"
            >
              <X size={15} aria-hidden="true" />
            </button>
          )}
        </div>

        <GlassSelect
          label="Ordenar por"
          icon={ArrowUpDown}
          value={sortBy}
          options={sortSelectOptions}
          onChange={handleSortChange}
        />

        <GlassSelect
          label="Exibir por página"
          icon={LayoutGrid}
          value={String(pageSize)}
          options={pageSizeSelectOptions}
          onChange={handlePageSizeChange}
        />
      </form>

      <div className="flex min-h-13 items-center justify-between gap-4 text-xs text-earth">
        <span role="status">
          {sortedReels.length}{' '}
          {sortedReels.length === 1 ? 'vídeo encontrado' : 'vídeos encontrados'}
        </span>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="min-h-11 cursor-pointer font-medium text-piramide hover:underline"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {paginatedReels.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-8">
          {paginatedReels.map((reel, idx) => (
            <div
              key={reel._id}
              role="button"
              tabIndex={0}
              aria-label={`Assistir vídeo: ${reel.title}`}
              onClick={() => handleCardClick(reel._id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleCardClick(reel._id)
                }
              }}
              className="group/card relative w-full cursor-pointer overflow-hidden bg-zinc-900 shadow-none aspect-[9/16]"
            >
              {reel.thumbnailUrl ? (
                <img
                  src={reel.thumbnailUrl}
                  alt={reel.title}
                  loading={idx < 4 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="pointer-events-none size-full object-cover object-center transition-transform duration-700 select-none group-hover/card:scale-105"
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-zinc-800 text-zinc-600">
                  <Video className="size-12" aria-hidden="true" />
                </div>
              )}

              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent" />

              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                <div className="flex size-12 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white shadow-xl backdrop-blur-md transition-all duration-300 group-hover/card:scale-115 group-hover/card:border-white/40 group-hover/card:bg-black/60 sm:size-14">
                  <Play className="ml-0.5 size-5 fill-current text-white sm:size-6" aria-hidden="true" />
                </div>
              </div>

              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 space-y-2 p-5">
                {reel.propertyTitle && (
                  <div className="inline-flex max-w-full items-center gap-1.5 rounded-none border-none bg-black/50 px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest text-white uppercase shadow-xs backdrop-blur-md">
                    <Building2 className="size-3 shrink-0 text-white" aria-hidden="true" />
                    <span className="truncate">{reel.propertyTitle}</span>
                  </div>
                )}
                <h2 className="line-clamp-2 text-sm leading-tight font-black text-white uppercase sm:text-base">
                  {reel.title}
                </h2>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-espresso/[.035] px-6 py-12 text-center">
          <VideoOff className="mx-auto mb-3 size-10 text-earth/70" aria-hidden="true" />
          <p className="text-lg font-medium text-espresso">
            {hasActiveFilters ? 'Nenhum vídeo encontrado' : 'Novos vídeos em breve'}
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-earth">
            {hasActiveFilters
              ? 'Tente ajustar os termos de busca ou limpar os filtros.'
              : 'Ainda não há vídeos cadastrados no momento. Em breve publicaremos novos tours exclusivos.'}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="mt-4 min-h-11 cursor-pointer text-sm font-medium text-piramide hover:underline"
            >
              Limpar filtros
            </button>
          )}
        </div>
      )}

      {sortedReels.length > 0 && (
        <nav
          aria-label="Paginação dos vídeos"
          className="mt-9 flex flex-wrap items-center justify-center gap-2"
        >
          <button
            type="button"
            onClick={() => handlePageChange(safeCurrentPage - 1)}
            disabled={safeCurrentPage <= 1}
            aria-label="Página anterior"
            className={pageBtn}
          >
            <ArrowLeft size={16} aria-hidden="true" />
          </button>

          {Array.from({length: totalPages}, (_, i) => i + 1).map((pageNum) => {
            if (
              pageNum === 1 ||
              pageNum === totalPages ||
              Math.abs(pageNum - safeCurrentPage) <= 1
            ) {
              const isActive = pageNum === safeCurrentPage
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => handlePageChange(pageNum)}
                  disabled={totalPages === 1}
                  aria-label={'Página ' + pageNum}
                  aria-current={isActive ? 'page' : undefined}
                  className={
                    pageBtn +
                    (isActive
                      ? ' bg-piramide text-white hover:bg-piramide hover:text-white disabled:opacity-100 disabled:hover:bg-piramide disabled:hover:text-white'
                      : ' bg-espresso/5 text-espresso')
                  }
                >
                  {pageNum}
                </button>
              )
            }

            if (pageNum === safeCurrentPage - 2 || pageNum === safeCurrentPage + 2) {
              return (
                <span key={pageNum} aria-hidden="true" className="px-2 text-earth">
                  …
                </span>
              )
            }

            return null
          })}

          <button
            type="button"
            onClick={() => handlePageChange(safeCurrentPage + 1)}
            disabled={safeCurrentPage >= totalPages}
            aria-label="Próxima página"
            className={pageBtn}
          >
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </nav>
      )}

      <VideoModalPlayer
        reels={sortedReels}
        selectedIdx={selectedIdx}
        onClose={() => setSelectedIdx(null)}
        onSelectIdx={setSelectedIdx}
      />
    </div>
  )
}

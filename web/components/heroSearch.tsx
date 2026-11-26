'use client'

import {useRouter} from 'next/navigation'
import {useEffect, useId, useRef, useState, type FormEvent} from 'react'
import {ArrowRight, Building2, Check, ChevronDown, Home, MapPin, Search, X} from 'lucide-react'
import {glassField, heading} from '../lib/classes'
import type {Picture} from '../lib/image'
import {Frame} from './media'
import {MultiSelect} from './multiSelect'

export type HeroSearchMedia =
  | {id: string; kind: 'image'; photo: Picture}
  | {id: string; kind: 'video'; videoUrl: string; posterUrl?: string | null}

export type HeroCondominiumOption = {slug: string; name: string}

type DealOption = 'ambos' | 'venda' | 'locacao'

const dealOptions: {value: DealOption; label: string}[] = [
  {value: 'ambos', label: 'Ambos'},
  {value: 'venda', label: 'Venda'},
  {value: 'locacao', label: 'Locação'},
]

const slideIntervalMs = 6500

function DealSelect({value, onChange}: {value: DealOption; onChange: (next: DealOption) => void}) {
  const [open, setOpen] = useState(false)
  const container = useRef<HTMLDivElement>(null)
  const listId = useId()
  const current = dealOptions.find((opt) => opt.value === value) ?? dealOptions[0]

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
    <div ref={container} className="relative min-w-0">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => setOpen((prev) => !prev)}
        className={glassField + ' w-full cursor-pointer justify-between text-left'}
      >
        <span className="flex min-w-0 flex-1 items-center gap-3">
          <Home aria-hidden="true" size={16} strokeWidth={1.6} className="shrink-0 text-espresso/80" />
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-semibold tracking-wider text-earth uppercase">Finalidade</span>
            <span className="mt-0.5 block truncate text-sm font-medium text-espresso">{current.label}</span>
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          size={15}
          className={'shrink-0 text-espresso/80 transition-transform duration-200 ' + (open ? 'rotate-180' : '')}
        />
      </button>

      {open && (
        <div
          id={listId}
          role="listbox"
          aria-label="Finalidade"
          className="absolute right-0 left-0 top-full z-40 mt-2 border border-white/[0.08] bg-[#0e0e12]/90 p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl backdrop-saturate-150 motion-safe:animate-enter"
        >
          {dealOptions.map((opt) => {
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
                    ? 'bg-piramide/15 font-semibold text-piramide'
                    : 'text-espresso hover:bg-white/[0.06]')
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

export function HeroSearch({
  media,
  propertyTypes,
  condominiums,
  headline,
  subheadline,
}: {
  media: HeroSearchMedia[]
  propertyTypes: string[]
  condominiums: HeroCondominiumOption[]
  headline?: string | null
  subheadline?: string | null
}) {
  const router = useRouter()
  const [activeIndex, setActiveIndex] = useState(0)
  const [deal, setDeal] = useState<DealOption>('ambos')
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedCondominiums, setSelectedCondominiums] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const sectionRef = useRef<HTMLElement>(null)
  const elapsedRef = useRef(0)

  useEffect(() => {
    if (media.length < 2) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reducedMotion.matches) {
      sectionRef.current?.style.setProperty('--slide-progress', '100%')
      return
    }
    elapsedRef.current = 0
    sectionRef.current?.style.setProperty('--slide-progress', '0%')
    let frame: number
    let lastTime: number | undefined
    function resetClock() {
      lastTime = undefined
    }
    function tick(now: number) {
      if (!document.hidden && lastTime !== undefined) {
        elapsedRef.current = Math.min(slideIntervalMs, elapsedRef.current + now - lastTime)
      }
      lastTime = document.hidden ? undefined : now
      const pct = Math.max(0, Math.min(100, (elapsedRef.current / slideIntervalMs) * 100))
      sectionRef.current?.style.setProperty('--slide-progress', pct + '%')
      if (elapsedRef.current >= slideIntervalMs && !document.hidden) {
        elapsedRef.current = 0
        sectionRef.current?.style.setProperty('--slide-progress', '0%')
        setActiveIndex((prev) => (prev + 1) % media.length)
        return
      }
      frame = window.requestAnimationFrame(tick)
    }
    document.addEventListener('visibilitychange', resetClock)
    frame = window.requestAnimationFrame(tick)
    return () => {
      window.cancelAnimationFrame(frame)
      document.removeEventListener('visibilitychange', resetClock)
    }
  }, [media.length, activeIndex])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const params = new URLSearchParams()
    const trimmed = query.trim()
    if (deal !== 'ambos') params.set('negocio', deal)
    selectedTypes.forEach((type) => params.append('tipo', type))
    if (selectedCondominiums[0]) params.set('condominio', selectedCondominiums[0])
    if (trimmed) params.set('busca', trimmed)
    const search = params.toString()
    router.push('/imoveis' + (search ? '?' + search : '') + '#resultados')
  }

  const titleText = headline?.trim() || ''
  const subtitleText = subheadline?.trim() || ''

  const searchFields = (
    <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-[11.5rem_16.5rem_16.5rem_minmax(0,1fr)_auto]">
      <DealSelect value={deal} onChange={setDeal} />

      <MultiSelect
        label="Tipo de imóvel"
        placeholder="Todos os tipos"
        icon={Building2}
        values={selectedTypes}
        options={propertyTypes.map((type) => ({value: type, label: type}))}
        onChange={setSelectedTypes}
      />

      <MultiSelect
        label="Condomínio"
        placeholder="Todos os condomínios"
        icon={MapPin}
        values={selectedCondominiums}
        options={condominiums.map((c) => ({value: c.slug, label: c.name}))}
        onChange={(next) => setSelectedCondominiums(next.slice(-1))}
      />

      <div className={glassField + ' sm:col-span-2 lg:col-span-1'}>
        <label className="flex min-w-0 flex-1 items-center gap-3">
          <Search aria-hidden="true" size={16} strokeWidth={1.6} className="shrink-0 text-espresso/80" />
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-semibold tracking-wider text-earth uppercase">Buscar</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Bairro, cidade ou código"
              className="mt-0.5 block w-full min-w-0 bg-transparent text-sm font-medium text-espresso placeholder:font-normal placeholder:text-earth focus:outline-none"
            />
          </span>
        </label>
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Limpar busca"
            className="grid size-6 shrink-0 cursor-pointer place-items-center rounded-full text-earth transition-colors hover:bg-espresso/10 hover:text-espresso"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <button
        type="submit"
        className="group/submit inline-flex min-h-14 cursor-pointer items-center justify-center gap-2.5 bg-piramide px-7 text-sm font-semibold tracking-wide text-white shadow-[0_12px_32px_rgba(0,0,0,0.2)] transition-colors hover:bg-piramide/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:col-span-2 lg:col-span-1"
      >
        <span>Encontrar imóvel</span>
        <ArrowRight
          aria-hidden="true"
          size={16}
          className="shrink-0 transition-transform duration-300 ease-out group-hover/submit:translate-x-1 motion-reduce:transition-none"
        />
      </button>
    </div>
  )

  return (
    <>
      <section
        ref={sectionRef}
        aria-label="Busca de imóveis"
        className="relative isolate flex min-h-[22rem] items-end justify-center overflow-visible bg-coal px-5 pt-20 pb-14 text-white sm:min-h-[clamp(34rem,80svh,54rem)] sm:items-center sm:px-9 sm:py-16"
      >
        {/* Background media (images & videos from Sanity) */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-20 overflow-hidden bg-coal">
          {media.map((item, idx) => {
            const isActive = idx === activeIndex
            return (
              <div
                key={item.id}
                className={
                  'absolute inset-0 transition-opacity duration-1000 ease-out motion-reduce:transition-none ' +
                  (isActive ? 'opacity-100' : 'opacity-0')
                }
              >
                {item.kind === 'video' ? (
                  <video
                    className="size-full object-cover"
                    src={item.videoUrl}
                    poster={item.posterUrl || undefined}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload={idx === 0 ? 'auto' : 'metadata'}
                  />
                ) : (
                  <Frame
                    photo={item.photo}
                    className="size-full object-cover"
                    priority={idx === 0}
                    sizes="(min-width: 2080px) 2080px, 100vw"
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Cinematic dark gradient overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(8,8,8,0.85)_0%,rgba(8,8,8,0.42)_45%,rgba(8,8,8,0.32)_75%,rgba(8,8,8,0.55)_100%)] sm:bg-[linear-gradient(to_top,rgba(8,8,8,0.9)_0%,rgba(8,8,8,0.64)_45%,rgba(8,8,8,0.56)_75%,rgba(8,8,8,0.72)_100%)]"
        />

        {/* Centered content + desktop floating glass inputs */}
        <div className="relative z-20 mx-auto flex w-full max-w-[84rem] flex-col items-center text-center">
          {titleText && (
            <h1 className={heading + ' max-w-[24ch] text-balance text-[clamp(1.85rem,4.4vw,3.85rem)] leading-[1.12] tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.45)]'}>
              {titleText}
            </h1>
          )}
          {subtitleText && (
            <p className={(titleText ? 'mt-3 sm:mt-4 ' : '') + 'max-w-[46ch] text-sm font-normal tracking-wide text-white/90 drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)] sm:text-base lg:text-lg'}>
              {subtitleText}
            </p>
          )}

          <form
            role="search"
            aria-label="Pesquisar imóveis"
            onSubmit={handleSubmit}
            className={'dark hidden w-full text-left sm:block [&_svg]:text-white/85 ' + (titleText || subtitleText ? 'sm:mt-10' : '')}
          >
            {searchFields}
          </form>
        </div>

        {media.length > 1 && (
          <div
            className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2.5 sm:bottom-6"
            role="group"
            aria-label="Selecionar fundo do hero"
          >
            {media.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`Fundo ${idx + 1}`}
                aria-current={idx === activeIndex ? 'true' : undefined}
                className="group flex h-4 cursor-pointer items-center"
              >
                {idx === activeIndex ? (
                  <div className="relative h-1.5 w-14 overflow-hidden bg-white/25">
                    <div className="h-full w-(--slide-progress,0%) bg-white" />
                  </div>
                ) : (
                  <div className="h-1.5 w-3.5 bg-white/30 transition-all duration-300 group-hover:bg-white/60" />
                )}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Mobile search form below hero so it never covers the photo/video */}
      <div className="bg-paper px-5 pt-5 pb-2 sm:hidden">
        <form
          role="search"
          aria-label="Pesquisar imóveis"
          onSubmit={handleSubmit}
          className="w-full text-left [&_svg]:text-espresso/80"
        >
          {searchFields}
        </form>
      </div>
    </>
  )
}

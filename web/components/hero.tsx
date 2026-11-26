'use client'

import Link from 'next/link'
import { ArrowDown, ArrowUpRight, Building2, ChevronDown } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {sweepButton, sweepFill, sweepOnCover, sweepRegular, sweepContent,  eyebrow, heading } from '../lib/classes'
import type { Picture } from '../lib/image'
import type { PropertyCard } from '../lib/model'
import { Frame } from './media'

type HeroItem = Pick<PropertyCard, 'slug' | 'title' | 'summary' | 'specifications' | 'refCode' | 'condominium' | 'condominiumName'> & { location: string; photo: Picture }
const slideDuration = 6500
const transitionDuration = 1800
const number = new Intl.NumberFormat('pt-BR')

export function Hero({ items }: { items: [HeroItem, ...HeroItem[]] }) {
  const [slide, setSlide] = useState({ current: 0, previous: -1, run: 0 })
  const [leftIndex, setLeftIndex] = useState(0)
  const [rightIndex, setRightIndex] = useState(0)
  const [focused, setFocused] = useState(false)
  const [visible, setVisible] = useState(false)
  const [canAnimate, setCanAnimate] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const hero = useRef<HTMLElement>(null)
  const progress = useRef<SVGSVGElement>(null)
  const photoLayers = useRef<(HTMLDivElement | null)[]>([])
  const photoImages = useRef<(HTMLDivElement | null)[]>([])
  const elapsed = useRef(0)
  const selectionRequest = useRef(0)
  const transitionLock = useRef(false)
  const active = items[slide.current] ?? items[0]
  const leftActive = items[leftIndex] ?? active
  const count = items.length

  function factsOf(item: HeroItem) {
    const specs = item.specifications
    const list: [string, number | undefined, string][] = [
      ['Área', specs?.area || specs?.landArea, 'metragem'],
      ['Dormitórios', specs?.bedrooms, 'quarto-solteiro'],
      ['Banheiros', specs?.bathrooms, 'banheiro'],
      ['Suítes', specs?.suites, 'quarto-casal'],
      ['Vagas', specs?.parking, 'garagem'],
    ]
    return list.filter(([, value]) => value != null && value > 0)
  }

  function syncProgress(ratio: number) {
    const pct = Math.max(0, Math.min(100, ratio * 100))
    progress.current?.style.setProperty('--progress-left', (100 - pct) + '%')
    hero.current?.style.setProperty('--slide-progress', pct + '%')
  }

  async function selectSlide(idx: number) {
    if (transitionLock.current || idx === slide.current) return
    const request = ++selectionRequest.current
    const image = hero.current?.querySelectorAll('img')[idx]
    if (!image) return
    try {
      await image.decode()
    } catch {
      return
    }
    if (request !== selectionRequest.current || transitionLock.current) return
    transitionLock.current = canAnimate
    setTransitioning(canAnimate)
    elapsed.current = 0
    syncProgress(count < 2 ? 1 : 0)
    setFocused(false)
    setSlide((prev) => ({
      current: idx,
      previous: idx !== prev.current ? prev.current : prev.previous,
      run: prev.run + 1,
    }))
  }

  useEffect(() => {
    if (count < 2 || !hero.current) return
    const motion = matchMedia('(prefers-reduced-motion: no-preference)')
    const updateMotion = () => setCanAnimate(motion.matches)
    updateMotion()
    motion.addEventListener('change', updateMotion)
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.2 })
    observer.observe(hero.current)
    return () => {
      observer.disconnect()
      motion.removeEventListener('change', updateMotion)
    }
  }, [count])

  // An architectural diagonal sweeps across the new photo while the previous
  // one stays underneath. Decoded images remain mounted; the lower line keeps
  // its own continuous progress animation.
  useLayoutEffect(() => {
    const incoming = photoLayers.current[slide.current]
    const outgoing = photoLayers.current[slide.previous]
    if (!incoming || !outgoing || !canAnimate) {
      transitionLock.current = false
      setTransitioning(false)
      return
    }
    const timing = {duration: transitionDuration, easing: 'cubic-bezier(.55,.08,.25,1)', fill: 'both' as const}
    const enter = incoming.animate([
      {clipPath: 'polygon(0 0, -24% 0, -48% 100%, 0 100%)'},
      {clipPath: 'polygon(0 0, 148% 0, 124% 100%, 0 100%)'},
    ], timing)
    const settle = photoImages.current[slide.current]?.animate([
      {transform: 'scale(1.045)'},
      {transform: 'scale(1)'},
    ], {...timing, easing: 'cubic-bezier(.2,.6,.25,1)'})
    const startTime = document.timeline.currentTime
    enter.startTime = startTime
    if (settle) settle.startTime = startTime
    enter.onfinish = () => {
      transitionLock.current = false
      setTransitioning(false)
    }
    return () => {
      enter.onfinish = null
      enter.cancel()
      settle?.cancel()
      transitionLock.current = false
    }
  }, [slide.current, slide.previous, slide.run, canAnimate])

  useEffect(() => {
    elapsed.current = 0
    syncProgress(count < 2 ? 1 : 0)
    if (slide.previous < 0 || !canAnimate) {
      setLeftIndex(slide.current)
      setRightIndex(slide.current)
      return
    }
    const leftTimer = window.setTimeout(() => {
      setLeftIndex(slide.current)
    }, transitionDuration * 0.5)
    const rightTimer = window.setTimeout(() => {
      setRightIndex(slide.current)
    }, transitionDuration)
    return () => {
      window.clearTimeout(leftTimer)
      window.clearTimeout(rightTimer)
    }
  }, [slide.current, slide.previous, slide.run, count, canAnimate])

  useEffect(() => {
    if (focused || !visible || !canAnimate || count < 2) return
    let frame: number
    let lastTime: number | undefined
    function resetClock() { lastTime = undefined }
    function tick(now: number) {
      if (!document.hidden && lastTime !== undefined) {
        elapsed.current = Math.min(slideDuration, elapsed.current + now - lastTime)
      }
      lastTime = document.hidden ? undefined : now
      syncProgress(elapsed.current / slideDuration)

      if (elapsed.current >= slideDuration && !document.hidden) {
        const next = (slide.current + 1) % count
        if (hero.current?.querySelectorAll('img')[next]?.naturalWidth) {
          elapsed.current = 0
          syncProgress(0)
          void selectSlide(next)
        }
      }
      frame = window.requestAnimationFrame(tick)
    }
    document.addEventListener('visibilitychange', resetClock)
    frame = window.requestAnimationFrame(tick)
    return () => {
      window.cancelAnimationFrame(frame)
      document.removeEventListener('visibilitychange', resetClock)
    }
  }, [focused, visible, canAnimate, count, slide.current, slide.run])

  return <>
    <div className="relative [--hero-notch:16px] lg:[--hero-notch:clamp(28px,2.6vw,42px)]">
      <section className="relative isolate h-[clamp(34rem,80svh,54rem)] overflow-hidden bg-coal transform-gpu [clip-path:polygon(0_0,101%_0,101%_100%,54%_100%,46%_calc(100%_-_var(--hero-notch)),0_calc(100%_-_var(--hero-notch)))] after:pointer-events-none after:absolute after:inset-0 after:z-2 after:bg-[linear-gradient(to_top,rgba(8,8,8,0.98)_0%,rgba(8,8,8,0.88)_28%,rgba(8,8,8,0.52)_50%,rgba(8,8,8,0.12)_72%,transparent_88%)] sm:h-[clamp(30rem,76svh,54rem)]"
        ref={hero} aria-label={'Fotos de ' + active.title}
        onFocus={(event) => {
          if (event.target instanceof HTMLElement && event.target.matches(':focus-visible')) {
            setFocused(true)
          }
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false)
        }}>
        <div className="pointer-events-none absolute inset-0 isolate overflow-hidden [contain:layout_paint]">
          {items.map(({ photo, slug }, index) => (
            <div key={slug} className="absolute inset-0 opacity-0 backface-hidden data-[outgoing=true]:z-0 data-[outgoing=true]:opacity-100 data-[current=true]:z-1 data-[current=true]:opacity-100"
              data-current={index === slide.current} data-outgoing={index === slide.previous}
              aria-hidden={index !== slide.current}>
              <div ref={(node) => {photoLayers.current[index] = node}} className="size-full overflow-hidden motion-safe:will-change-[clip-path]">
                <div ref={(node) => {photoImages.current[index] = node}} className="size-full motion-safe:will-change-transform">
                  <Frame photo={photo} className="size-full object-cover" priority={index === 0} sizes="(min-width: 2080px) 2080px, 100vw" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="absolute top-5 left-5 z-3 sm:top-8 sm:left-9 lg:top-8 lg:left-10">
          <div className="grid items-start justify-items-start [grid-template-areas:'stack']">
            {items.map((item, idx) => {
              const condoName = item.condominium?.name || item.condominiumName
              const condoSlug = item.condominium?.slug
              const refCode = item.refCode?.trim()
              if (!condoName && !refCode) return null
              const isCurrent = idx === leftIndex
              const glassBadge =
                'inline-flex items-center gap-2 border border-white/20 bg-black/35 px-3.5 py-2 text-xs font-medium tracking-wide text-white shadow-[0_8px_24px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-md backdrop-saturate-150'
              return (
                <div
                  key={item.slug + '-badges'}
                  aria-hidden={!isCurrent}
                  className={
                    "[grid-area:stack] flex flex-wrap items-center gap-2 transition-opacity duration-500 ease-out motion-reduce:transition-none " +
                    (isCurrent ? 'opacity-100' : 'pointer-events-none select-none opacity-0')
                  }
                >
                  {condoName && (
                    condoSlug ? (
                      <Link
                        href={'/condominios/' + encodeURIComponent(condoSlug)}
                        tabIndex={isCurrent ? undefined : -1}
                        className={glassBadge + ' group/condo transition-colors hover:border-white/35 hover:bg-black/50'}
                      >
                        <Building2 aria-hidden="true" size={14} className="shrink-0 text-white/85" />
                        <span>{condoName}</span>
                        <ArrowUpRight
                          aria-hidden="true"
                          size={13}
                          className="shrink-0 text-white/75 transition-transform duration-200 group-hover/condo:translate-x-0.5 group-hover/condo:-translate-y-0.5"
                        />
                      </Link>
                    ) : (
                      <span className={glassBadge}>
                        <Building2 aria-hidden="true" size={14} className="shrink-0 text-white/85" />
                        <span>{condoName}</span>
                      </span>
                    )
                  )}
                  {refCode && (
                    <span className={glassBadge + ' tabular-nums text-white/90'}>
                      Cód. {refCode}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
        <div
          className={
            'absolute inset-x-5 z-3 text-white transition-[bottom] duration-300 ease-out sm:inset-x-9 lg:inset-x-auto lg:bottom-[calc(var(--hero-notch)+2rem)] lg:left-10 lg:w-[min(82%,80rem)] ' +
            (detailsOpen
              ? 'bottom-[calc(var(--hero-notch)+8.5rem)] sm:bottom-[calc(var(--hero-notch)+7rem)]'
              : 'bottom-[calc(var(--hero-notch)+3.5rem)] sm:bottom-[calc(var(--hero-notch)+4rem)]')
          }
          aria-live={focused || !canAnimate ? 'polite' : 'off'}
        >
          <div className="grid items-end [grid-template-areas:'stack']">
            {items.map((item, idx) => (
              <div
                key={item.slug}
                aria-hidden={idx !== leftIndex}
                className={
                  "[grid-area:stack] transition-opacity duration-500 ease-out motion-reduce:transition-none " +
                  (idx === leftIndex ? 'opacity-100' : 'pointer-events-none select-none opacity-0')
                }
              >
                <p className={eyebrow + ' text-[.68rem] text-white sm:text-xs'}>{item.location}</p>
                <h2 className={heading + ' mt-2.5 line-clamp-3 pb-1.5 leading-[1.15] text-wrap text-[clamp(2.15rem,4.6vw,4.75rem)]'}>{item.title}</h2>
                <p className="mt-3 max-w-[50ch] line-clamp-2 text-sm leading-relaxed text-white/90 sm:text-base lg:text-lg">{item.summary}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 grid w-full max-w-md grid-cols-2 gap-3 lg:flex lg:w-auto lg:max-w-none lg:flex-wrap lg:items-center lg:gap-x-6 lg:gap-y-3.5">
            <Link className={sweepButton + sweepRegular + ' ' + sweepOnCover + ' w-full justify-center lg:w-auto'} href={'/imoveis/' + encodeURIComponent(leftActive.slug)}>
              <span aria-hidden="true" className={sweepFill} />
              <span className={sweepContent}>
                Ver imóvel <ArrowUpRight size={18} className="transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5 motion-reduce:transition-none" />
              </span>
            </Link>
            <a className="group/explore hidden w-fit items-center gap-2.5 text-sm text-ivory transition-colors hover:text-white sm:text-base lg:inline-flex motion-reduce:transition-none" href="/imoveis">
              Explorar imóveis <ArrowDown size={18} className="transition-transform duration-300 ease-out group-hover/explore:translate-y-1 motion-reduce:transition-none" />
            </a>
            <button
              type="button"
              aria-expanded={detailsOpen}
              onClick={() => setDetailsOpen((prev) => !prev)}
              className={sweepButton + sweepRegular + ' ' + sweepOnCover + ' w-full cursor-pointer justify-center lg:hidden'}
            >
              <span aria-hidden="true" className={sweepFill} />
              <span className={sweepContent}>
                {detailsOpen ? 'Ocultar detalhes' : 'Ver detalhes'}
                <ChevronDown
                  aria-hidden="true"
                  size={16}
                  className={'shrink-0 transition-transform duration-300 ' + (detailsOpen ? 'rotate-180' : '')}
                />
              </span>
            </button>
          </div>
        </div>
        <div
          className={
            'absolute inset-x-5 bottom-[calc(var(--hero-notch)+1rem)] z-3 flex flex-wrap items-end justify-between gap-x-6 gap-y-4 text-white transition-[padding,border-color] duration-300 sm:inset-x-9 sm:bottom-[calc(var(--hero-notch)+1.5rem)] lg:inset-x-auto lg:right-10 lg:bottom-[calc(var(--hero-notch)+2rem)] lg:flex-col lg:gap-y-5 lg:border-t-0 lg:pt-0 ' +
            (detailsOpen ? 'border-t border-white/25 pt-4' : 'border-t border-transparent pt-0')
          }
        >
          <div
            className={
              'grid transition-[grid-template-rows,opacity] duration-300 ease-out lg:pointer-events-auto lg:grid-rows-[1fr] lg:opacity-100 ' +
              (detailsOpen ? 'grid-rows-[1fr] opacity-100' : 'pointer-events-none grid-rows-[0fr] opacity-0')
            }
          >
            <div className="min-h-0 overflow-hidden">
              <div className="grid items-end justify-items-start [grid-template-areas:'stack'] lg:justify-items-center">
                {items.map((item, idx) => {
                  const itemFacts = factsOf(item)
                  if (!itemFacts.length) return null
                  return (
                    <dl
                      key={item.slug + '-facts'}
                      aria-label="Dados do imóvel"
                      aria-hidden={idx !== rightIndex}
                      aria-live={idx === rightIndex && (focused || !canAnimate) ? 'polite' : 'off'}
                      className={
                        "[grid-area:stack] flex flex-wrap items-start gap-x-5 gap-y-2 sm:gap-x-8 lg:w-24 lg:flex-col lg:items-center lg:gap-y-3 transition-opacity duration-500 ease-out motion-reduce:transition-none " +
                        (idx === rightIndex ? 'opacity-100' : 'pointer-events-none select-none opacity-0')
                      }
                    >
                      {itemFacts.map(([label, value, icon]) => (
                        <div key={label} className="contents">
                          <div className="flex flex-col items-start justify-center gap-2 text-start lg:items-center lg:text-center">
                            <dt className="text-[.56rem] font-medium tracking-[.08em] text-white/75 uppercase sm:text-[.64rem]">{label}</dt>
                            <dd className="relative isolate inline-flex items-baseline justify-center whitespace-nowrap font-sans text-lg leading-none font-semibold tracking-tight text-white tabular-nums sm:text-2xl">
                              {typeof value === 'number' ? number.format(value) : value}{icon === 'metragem' && <span className="ml-1 font-sans text-[.7rem] font-medium tracking-normal text-white/85 sm:text-xs">m²</span>}
                            </dd>
                          </div>
                        </div>
                      ))}
                    </dl>
                  )
                })}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2.5" role="group" aria-label="Selecionar imóvel">
            {items.map((item, idx) => (
              <button
                key={item.slug}
                type="button"
                disabled={transitioning}
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => selectSlide(idx)}
                aria-label={`Ir para slide ${idx + 1}: ${item.title}`}
                aria-current={idx === slide.current ? 'true' : undefined}
                className="group flex h-4 cursor-pointer items-center"
              >
                {idx === slide.current ? (
                  <div className="relative h-1.5 w-14 overflow-hidden rounded-none bg-white/20">
                    <div className="h-full w-(--slide-progress,0%) rounded-none bg-white" />
                  </div>
                ) : (
                  <div className="h-1.5 w-3.5 rounded-none bg-white/30 transition-all duration-300 group-hover:bg-white/60" />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>
      {count > 1 && canAnimate && <svg ref={progress} className="pointer-events-none absolute inset-x-0 bottom-0 z-2 h-[var(--hero-notch)] w-full overflow-visible fill-none stroke-piramide stroke-[2.5px] [clip-path:inset(-3px_var(--progress-left,100%)_-3px_0)]" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <polyline points="0,0 46,0 54,100 100,100" vectorEffect="non-scaling-stroke" />
      </svg>}
    </div>
  </>
}

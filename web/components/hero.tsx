'use client'

import Link from 'next/link'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { eyebrow, heading } from '../lib/classes'
import type { Picture } from '../lib/image'
import type { PropertyCard } from '../lib/model'
import { Frame } from './media'

type HeroItem = Pick<PropertyCard, 'slug' | 'title' | 'summary' | 'specifications'> & { location: string; photo: Picture }
const slideDuration = 6500
const wipeDuration = 1400
const number = new Intl.NumberFormat('pt-BR')

export function Hero({ items }: { items: [HeroItem, ...HeroItem[]] }) {
  const [slide, setSlide] = useState({ current: 0, previous: -1, run: 0 })
  const [leftIndex, setLeftIndex] = useState(0)
  const [rightIndex, setRightIndex] = useState(0)
  const [focused, setFocused] = useState(false)
  const [visible, setVisible] = useState(false)
  const [canAnimate, setCanAnimate] = useState(false)
  const hero = useRef<HTMLElement>(null)
  const progress = useRef<SVGSVGElement>(null)
  const elapsed = useRef(0)
  const active = items[slide.current] ?? items[0]
  const leftActive = items[leftIndex] ?? active
  const count = items.length

  function factsOf(item: HeroItem) {
    const specs = item.specifications
    const list: [string, number | undefined, string][] = [
      ['Área', specs?.area, 'metragem'],
      ['Dormitórios', specs?.bedrooms, 'quarto-solteiro'],
      ['Banheiros', specs?.bathrooms, 'banheiro'],
      ['Suítes', specs?.suites, 'quarto-casal'],
      ['Vagas', specs?.parking, 'garagem'],
    ]
    return list.filter(([, value]) => value != null)
  }

  function syncProgress(ratio: number) {
    const pct = Math.max(0, Math.min(100, ratio * 100))
    progress.current?.style.setProperty('--progress-left', (100 - pct) + '%')
    hero.current?.style.setProperty('--slide-progress', pct + '%')
  }

  function selectSlide(idx: number) {
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
    }, wipeDuration * 0.5)
    const rightTimer = window.setTimeout(() => {
      setRightIndex(slide.current)
    }, wipeDuration)
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
          setSlide((prev) => ({ current: next, previous: prev.current, run: prev.run + 1 }))
          return
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
      <section className="relative isolate aspect-[.9] overflow-hidden bg-coal transform-gpu [clip-path:polygon(0_0,101%_0,101%_100%,54%_100%,46%_calc(100%_-_var(--hero-notch)),0_calc(100%_-_var(--hero-notch)))] after:pointer-events-none after:absolute after:inset-0 after:z-2 after:bg-[linear-gradient(0deg,#100e0ceb_0%,#100e0ca8_45%,transparent_100%),linear-gradient(180deg,#100e0c73_0%,transparent_22%),linear-gradient(270deg,#100e0c99_0%,transparent_28%)] sm:aspect-4/3 lg:aspect-[2.25]"
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
            <div key={slug} className="absolute inset-0 opacity-0 backface-hidden data-[outgoing=true]:z-0 data-[outgoing=true]:opacity-100 data-[current=true]:z-1 data-[current=true]:opacity-100 motion-safe:[&[data-current=true][data-transition=true]]:will-change-[clip-path] motion-safe:[&[data-current=true][data-transition=true]]:animate-photo-wipe"
              data-current={index === slide.current} data-outgoing={index === slide.previous}
              data-transition={slide.previous >= 0} aria-hidden={index !== slide.current}>
              <Frame photo={photo} className="size-full object-cover" priority sizes="(min-width: 1760px) 1760px, 100vw" />
            </div>
          ))}
        </div>
        <div className="absolute right-24 bottom-[calc(var(--hero-notch)+1.25rem)] left-5 z-3 text-ivory sm:right-auto sm:bottom-[calc(var(--hero-notch)+1.5rem)] sm:left-9 sm:w-[min(68%,48rem)] lg:bottom-[calc(var(--hero-notch)+2rem)] lg:left-14 lg:w-[min(74%,72rem)]"
          aria-live={focused || !canAnimate ? 'polite' : 'off'}>
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
                <h1 className={heading + ' mt-2.5 line-clamp-2 pb-1.5 leading-[1.15] text-[clamp(2.6rem,5.2vw,5.6rem)] sm:line-clamp-1 lg:line-clamp-2'}>{item.title}</h1>
                <p className="mt-3.5 max-w-[46ch] line-clamp-4 text-base font-light leading-relaxed text-[#fff5e6] sm:line-clamp-2 sm:text-lg lg:text-xl">{item.summary}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3.5">
            <Link className="group/cta relative inline-flex cursor-pointer select-none items-center justify-center overflow-hidden border border-ivory/65 bg-coal/35 px-4 py-3 text-sm font-medium text-ivory backdrop-blur-xs transition-all duration-300 ease-out hover:border-piramide active:scale-[0.98] will-change-transform sm:px-5 sm:py-3.5 sm:text-base motion-reduce:transition-none" href={'/' + leftActive.slug}>
              <span aria-hidden="true" className="pointer-events-none absolute inset-0 size-full translate-y-full bg-piramide transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/cta:translate-y-0" />
              <span className="pointer-events-none relative z-10 inline-flex items-center justify-center gap-2.5 transition-colors duration-300 group-hover/cta:text-white">
                Ver empreendimento <ArrowUpRight size={18} className="transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5 motion-reduce:transition-none" />
              </span>
            </Link>
            <a className="group/explore inline-flex w-fit items-center gap-2.5 text-sm text-ivory transition-colors hover:text-white sm:text-base motion-reduce:transition-none" href="#empreendimentos">
              Explorar imóveis <ArrowDown size={18} className="transition-transform duration-300 ease-out group-hover/explore:translate-y-1 motion-reduce:transition-none" />
            </a>
          </div>
        </div>
        <div className="absolute right-5 bottom-[calc(var(--hero-notch)+1rem)] z-3 flex flex-col items-end gap-3.5 text-ivory sm:right-9 sm:bottom-[calc(var(--hero-notch)+1.5rem)] sm:gap-4 lg:right-14 lg:bottom-[calc(var(--hero-notch)+2rem)] lg:gap-5">
          <div className="grid items-end justify-items-center [grid-template-areas:'stack']">
            {items.map((item, idx) => {
              const itemFacts = factsOf(item)
              if (!itemFacts.length) return null
              return (
                <dl
                  key={item.slug + '-facts'}
                  aria-label="Dados do empreendimento"
                  aria-hidden={idx !== rightIndex}
                  aria-live={idx === rightIndex && (focused || !canAnimate) ? 'polite' : 'off'}
                  className={
                    "[grid-area:stack] flex w-20 flex-col items-center gap-y-2 sm:w-24 sm:gap-y-2.5 lg:gap-y-3 transition-opacity duration-500 ease-out motion-reduce:transition-none " +
                    (idx === rightIndex ? 'opacity-100' : 'pointer-events-none select-none opacity-0')
                  }
                >
                  {itemFacts.map(([label, value, icon], index) => (
                    <div key={label} className="contents">
                      {index > 0 && <span aria-hidden="true" className="h-px w-8 bg-ivory/35 sm:w-10" />}
                      <div className="flex min-w-[4.2rem] flex-col items-center justify-center gap-1 py-1 text-center sm:min-w-[5rem]">
                        <dt className="text-[.56rem] font-light tracking-[.11em] text-[#f8eddc] uppercase sm:text-[.64rem] lg:text-[.68rem]">{label}</dt>
                        <dd className="relative isolate inline-flex items-baseline justify-center whitespace-nowrap font-sans text-lg leading-none font-semibold tracking-tight text-ivory tabular-nums sm:text-2xl lg:text-3xl xl:text-4xl">
                          <span className="pointer-events-none absolute top-1/2 left-1/2 -z-1 size-10 -translate-x-1/2 -translate-y-1/2 bg-ivory opacity-12 mask-contain mask-center mask-no-repeat sm:size-12 lg:size-14"
                            style={{ maskImage: 'url(/brand/property-icons/' + icon + '.svg)' }} aria-hidden="true" />
                          {typeof value === 'number' ? number.format(value) : value}{icon === 'metragem' && <span className="ml-1 font-sans text-[.7rem] font-medium tracking-normal text-[#fff5e6] sm:text-xs lg:text-sm">m²</span>}
                        </dd>
                      </div>
                    </div>
                  ))}
                </dl>
              )
            })}
          </div>
          <div className="flex items-center gap-2.5" role="group" aria-label="Selecionar empreendimento">
            {items.map((item, idx) => (
              <button
                key={item.slug}
                type="button"
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => selectSlide(idx)}
                aria-label={`Ir para slide ${idx + 1}: ${item.title}`}
                aria-current={idx === slide.current ? 'true' : undefined}
                className="group flex h-4 cursor-pointer items-center"
              >
                {idx === slide.current ? (
                  <div className="relative h-1.5 w-14 overflow-hidden rounded-full bg-white/20">
                    <div className="h-full w-(--slide-progress,0%) rounded-full bg-white" />
                  </div>
                ) : (
                  <div className="h-1.5 w-3.5 rounded-full bg-white/30 transition-all duration-300 group-hover:bg-white/60" />
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

'use client'

import {useEffect, useLayoutEffect, useRef, useState} from 'react'
import {wrap} from '../lib/classes'
import type {Picture} from '../lib/image'
import {Frame} from './media'

type Banner = {id: string; title: string; href: string; newTab?: boolean; image: Picture}
const slideDuration = 6500
const transitionDuration = 1800

export function HomeBanners({items, className = ''}: {items: Banner[]; className?: string}) {
  const [index, setIndex] = useState(0)
  const [previousIndex, setPreviousIndex] = useState(-1)
  const [transitioning, setTransitioning] = useState(false)
  const [focused, setFocused] = useState(false)
  const [visible, setVisible] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(true)
  const banner = useRef<HTMLElement>(null)
  const photoLayers = useRef<(HTMLDivElement | null)[]>([])
  const photoImages = useRef<(HTMLDivElement | null)[]>([])
  const transitionLock = useRef(false)
  const selectionRequest = useRef(0)
  const elapsed = useRef(0)
  const count = items.length
  const active = count ? index % count : 0

  function syncProgress(ratio: number) {
    const pct = Math.max(0, Math.min(100, ratio * 100))
    banner.current?.style.setProperty('--slide-progress', pct + '%')
  }

  useLayoutEffect(() => {
    const incoming = photoLayers.current[active]
    const outgoing = photoLayers.current[previousIndex]
    if (!incoming || !outgoing || reducedMotion) {
      transitionLock.current = false
      setTransitioning(false)
      return
    }
    const timing = {duration: transitionDuration, easing: 'cubic-bezier(.55,.08,.25,1)', fill: 'both' as const}
    const enter = incoming.animate([
      {clipPath: 'polygon(0 0, -24% 0, -48% 100%, 0 100%)'},
      {clipPath: 'polygon(0 0, 148% 0, 124% 100%, 0 100%)'},
    ], timing)
    const settle = photoImages.current[active]?.animate([
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
  }, [active, previousIndex, reducedMotion])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateMotion = () => setReducedMotion(media.matches)
    const updateVisibility = () => setVisible(!document.hidden)
    updateMotion()
    updateVisibility()
    media.addEventListener('change', updateMotion)
    document.addEventListener('visibilitychange', updateVisibility)
    return () => {
      media.removeEventListener('change', updateMotion)
      document.removeEventListener('visibilitychange', updateVisibility)
    }
  }, [])

  useEffect(() => {
    if (reducedMotion) {
      syncProgress(1)
      return
    }
    syncProgress(elapsed.current / slideDuration)
    if (count < 2 || focused || !visible) return
    let frame: number
    let previous = performance.now()
    function tick(now: number) {
      elapsed.current += now - previous
      previous = now
      const ratio = Math.min(elapsed.current / slideDuration, 1)
      syncProgress(ratio)
      if (ratio >= 1) {
        if (!transitionLock.current) void select((active + 1) % count)
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [count, focused, visible, reducedMotion, index])

  if (!count) return null

  async function select(next: number) {
    const target = (next + count) % count
    if (transitionLock.current || target === active) return
    const request = ++selectionRequest.current
    const image = banner.current?.querySelectorAll('img')[target]
    if (!image) return
    transitionLock.current = true
    try {
      await image.decode()
    } catch {
      transitionLock.current = false
      return
    }
    if (request !== selectionRequest.current) return
    transitionLock.current = !reducedMotion
    setTransitioning(!reducedMotion)
    elapsed.current = 0
    syncProgress(reducedMotion ? 1 : 0)
    setFocused(false)
    setPreviousIndex(active)
    setIndex(target)
  }

  return <section id="campanhas" ref={banner} aria-label="Novidades e campanhas" aria-roledescription={count > 1 ? 'carrossel' : undefined} className={wrap + ' ' + className} onFocus={(event) => {if (event.target instanceof HTMLElement && event.target.matches(':focus-visible')) setFocused(true)}} onBlur={(event) => {if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false)}}>
    <div className="w-full overflow-hidden bg-coal">
    <div className="relative aspect-[3/1] overflow-hidden">
      {items.map((item, position) => <a key={item.id} href={item.href} target={item.newTab ? '_blank' : undefined} rel={item.newTab ? 'noopener noreferrer' : undefined} aria-label={item.title + (item.newTab ? ' (abre em nova aba)' : '')} aria-hidden={position !== active} tabIndex={position === active ? 0 : -1} className={'absolute inset-0 block focus-visible:-outline-offset-4 focus-visible:outline-white ' + (position === active ? 'z-10' : position === previousIndex ? 'pointer-events-none z-0' : 'pointer-events-none invisible -z-10')}>
        <div ref={(node) => {photoLayers.current[position] = node}} className="size-full overflow-hidden motion-safe:will-change-[clip-path]">
          <div ref={(node) => {photoImages.current[position] = node}} className="size-full motion-safe:will-change-transform">
            <Frame photo={item.image} className="size-full object-cover" sizes="(min-width: 2032px) 1952px, calc(100vw - 2rem)" />
          </div>
        </div>
      </a>)}
      {count > 1 && <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center bg-linear-to-t from-black/50 to-transparent px-4 pt-6 pb-1 sm:pt-10 sm:pb-3">
        <div className="pointer-events-auto flex items-center gap-2.5" role="group" aria-label="Selecionar campanha">
          {items.map((item, position) => <button type="button" key={item.id} disabled={transitioning} onPointerDown={(event) => event.preventDefault()} aria-label={'Ir para slide ' + (position + 1) + ': ' + item.title} aria-current={position === active ? 'true' : undefined} onClick={() => select(position)} className="group/dot flex min-h-11 cursor-pointer items-center py-3 focus-visible:outline-white focus-visible:outline-offset-4">
            {position === active ? (
              <span className="relative block h-1.5 w-14 overflow-hidden rounded-none bg-white/25 shadow-sm">
                <span className="block h-full w-(--slide-progress,0%) rounded-none bg-white" />
              </span>
            ) : <span className="block h-1.5 w-3.5 rounded-none bg-white/35 shadow-sm transition-colors duration-300 group-hover/dot:bg-white/70 motion-reduce:transition-none" />}
          </button>)}
        </div>
        <span className="sr-only" role="status" aria-live={focused ? 'polite' : 'off'}>{active + 1} de {count}: {items[active].title}</span>
      </div>}
    </div>
    </div>
  </section>
}

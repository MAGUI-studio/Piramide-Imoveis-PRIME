'use client'

import {useEffect, useState} from 'react'
import {ArrowLeft, ArrowRight, Pause, Play} from 'lucide-react'
import {wrap} from '../lib/classes'
import type {Picture} from '../lib/image'
import {Frame} from './media'

type Banner = {id: string; title: string; href: string; newTab?: boolean; image: Picture}
const control = 'inline-grid size-10 shrink-0 cursor-pointer place-items-center text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-white motion-reduce:transition-none'

export function HomeBanners({items}: {items: Banner[]}) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [visible, setVisible] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(true)
  const count = items.length
  const active = count ? index % count : 0

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
    if (count < 2 || paused || hovered || focused || !visible || reducedMotion) return
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % count), 6500)
    return () => window.clearInterval(timer)
  }, [count, paused, hovered, focused, visible, reducedMotion, index])

  if (!count) return null

  function select(next: number) {
    setIndex((next + count) % count)
  }

  return <section aria-label="Novidades e campanhas" aria-roledescription={count > 1 ? 'carrossel' : undefined} className={wrap} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={(event) => {if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false)}}>
    <div className="w-full overflow-hidden bg-coal">
    <div className="relative aspect-[3/1] overflow-hidden">
      {items.map((item, position) => <a key={item.id} href={item.href} target={item.newTab ? '_blank' : undefined} rel={item.newTab ? 'noopener noreferrer' : undefined} aria-label={item.title + (item.newTab ? ' (abre em nova aba)' : '')} aria-hidden={position !== active} tabIndex={position === active ? 0 : -1} className={'absolute inset-0 block focus-visible:-outline-offset-4 focus-visible:outline-white motion-safe:transition-opacity motion-safe:duration-700 ' + (position === active ? 'z-10 opacity-100' : 'pointer-events-none z-0 opacity-0')}>
        <Frame photo={item.image} className="size-full object-cover" sizes="(min-width: 1712px) 1632px, calc(100vw - 2rem)" />
      </a>)}
    </div>
    {count > 1 && <div className="flex flex-wrap items-center justify-center gap-2 px-4 py-1.5 text-white">
      <button type="button" onClick={() => select(active - 1)} aria-label="Banner anterior" className={control}><ArrowLeft size={17} aria-hidden="true" /></button>
      <div className="flex max-w-[60vw] flex-wrap items-center justify-center" aria-label="Selecionar banner">{items.map((item, position) => <button type="button" key={item.id} aria-label={'Banner ' + (position + 1) + ': ' + item.title} aria-current={position === active ? 'true' : undefined} onClick={() => select(position)} className="group/dot grid min-h-11 min-w-8 cursor-pointer place-items-center px-1 focus-visible:outline-white"><span className={'h-1 rounded-full transition-[width,background-color] duration-300 motion-reduce:transition-none ' + (position === active ? 'w-7 bg-white' : 'w-3 bg-white/35 group-hover/dot:bg-white/70')} /></button>)}</div>
      <button type="button" onClick={() => select(active + 1)} aria-label="Próximo banner" className={control}><ArrowRight size={17} aria-hidden="true" /></button>
      {!reducedMotion && <button type="button" onClick={() => setPaused((current) => !current)} aria-label={paused ? 'Retomar rotação dos banners' : 'Pausar rotação dos banners'} className={control}>{paused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}</button>}
      <span className="sr-only" role="status" aria-live={paused || focused ? 'polite' : 'off'}>{active + 1} de {count}: {items[active].title}</span>
    </div>}
    </div>
  </section>
}

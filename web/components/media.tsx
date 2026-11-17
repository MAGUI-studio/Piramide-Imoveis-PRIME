'use client'

import {useEffect, useRef, useState, type ReactNode} from 'react'
import {ArrowLeft, ArrowRight, Maximize2, Pause, Play, X} from 'lucide-react'
import {iconButton, outlineButton} from '../lib/classes'
import type {Picture} from '../lib/image'

const mediaDialog = 'm-auto max-h-[94dvh] w-[min(95vw,1230px)] max-w-none border border-white/20 bg-coal p-4 text-ivory backdrop:bg-black/85'
const mediaContents = 'block max-h-[75dvh] w-full object-contain'
const dialogClose = iconButton + ' absolute top-2.5 right-2.5 z-1 cursor-pointer'
const galleryTrack = {
  story: 'grid grid-cols-[1.25fr_.8fr] gap-4',
  mosaic: 'grid aspect-[1.4] grid-cols-[1.72fr_1fr] grid-rows-2 gap-2 min-[801px]:aspect-[2.2]',
  strip: 'flex snap-x snap-mandatory gap-3 overflow-x-auto [scrollbar-color:var(--color-gold)_var(--color-charcoal)]',
}
const galleryTile = {
  story: 'aspect-[1.5] first:col-span-full first:aspect-[2.5] md:[&:nth-child(3)]:mt-[clamp(16px,7vw,90px)]',
  mosaic: 'min-h-0 first:row-span-2 only:col-span-full [&:nth-child(2):last-child]:row-span-2 motion-safe:animate-image-in motion-safe:[&:nth-child(2)]:[animation-delay:90ms] motion-safe:[&:nth-child(3)]:[animation-delay:170ms]',
  strip: 'aspect-[1.5] flex-[0_0_min(76%,940px)] snap-start',
}

export function Frame({photo, sizes = '100vw', priority = false, className}: {photo: Picture; sizes?: string; priority?: boolean; className?: string}) {
  return <img className={className} src={photo.src} srcSet={photo.srcSet} sizes={sizes} alt={photo.alt} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : undefined} decoding="async" />
}

export function CoverVideo({src, poster, controls = true}: {src: string; poster: string; controls?: boolean}) {
  const [playing, setPlaying] = useState(false)
  const [visible, setVisible] = useState(false)
  const video = useRef<HTMLVideoElement>(null)
  const container = useRef<HTMLDivElement>(null)
  const autoplay = useRef(false)

  useEffect(() => {
    const frame = container.current
    if (!frame) return
    const preference = window.matchMedia(controls
      ? '(min-width: 801px) and (hover: hover) and (prefers-reduced-motion: no-preference)'
      : '(prefers-reduced-motion: no-preference)')
    const cover = frame.parentElement?.querySelector<HTMLImageElement>('img[fetchpriority="high"]')
    let inView = false
    function tryAutoplay() {
      if (inView && preference.matches && (!controls || !autoplay.current) && (!cover || cover.complete)) {
        autoplay.current = true
        play(video.current, src)
      }
    }
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      if (inView) tryAutoplay()
      else video.current?.pause()
    }, {threshold: 0.5})
    observer.observe(frame)
    cover?.addEventListener('load', tryAutoplay)
    cover?.addEventListener('error', tryAutoplay)
    const reduce = () => {
      if (!preference.matches) video.current?.pause()
      else tryAutoplay()
    }
    preference.addEventListener('change', reduce)
    return () => {
      observer.disconnect()
      cover?.removeEventListener('load', tryAutoplay)
      cover?.removeEventListener('error', tryAutoplay)
      preference.removeEventListener('change', reduce)
    }
  }, [src, controls])

  function togglePlayback() {
    autoplay.current = true
    if (video.current?.paused) play(video.current, src)
    else video.current?.pause()
  }

  return (
    <div className="pointer-events-none absolute inset-0" ref={container}>
      <video ref={video} poster={poster} muted loop playsInline preload="none"
        aria-hidden="true" className={'absolute inset-0 size-full object-cover motion-safe:transition-opacity motion-safe:duration-500 ' + (visible ? 'opacity-100' : 'opacity-0')}
        onPlaying={() => {setVisible(true); setPlaying(true)}}
        onPause={() => setPlaying(false)} onError={() => {setVisible(false); setPlaying(false)}} />
      {controls && <button type="button" className={iconButton + ' pointer-events-auto absolute right-5 bottom-5 z-4 cursor-pointer md:right-9 md:bottom-7 xl:right-14'} onClick={togglePlayback} aria-label={playing ? 'Pausar vídeo' : 'Reproduzir vídeo'}>
        {playing ? <Pause size={18} /> : <Play size={18} />}
      </button>}
    </div>
  )
}

function play(video: HTMLVideoElement | null, src: string) {
  if (!video) return
  if (video.getAttribute('src') !== src) video.src = src
  void video.play().catch(() => {
    // The poster stays in place when the browser declines autoplay.
  })
}

export function Gallery({photos, layout, children}: {photos: Picture[]; layout: 'story' | 'strip' | 'mosaic'; children?: ReactNode}) {
  const [current, setCurrent] = useState(0)
  const dialog = useRef<HTMLDialogElement>(null)
  const opener = useRef<HTMLElement | null>(null)
  const strip = useRef<HTMLDivElement>(null)
  const [opened, setOpened] = useState(false)
  const count = photos.length
  function step(direction: number) {
    setCurrent((index) => (index + direction + count) % count)
  }
  function open(index: number, element: HTMLElement) {
    opener.current = element
    setCurrent(index)
    setOpened(true)
    dialog.current?.showModal()
  }
  if (!count) return <>{children}</>
  const displayed = layout === 'mosaic' ? photos.slice(0, 3) : photos
  function moveStrip(direction: number) {
    const node = strip.current
    if (node) node.scrollBy({left: direction * node.clientWidth * 0.65})
  }

  return (
    <div data-gallery={layout}>
      <div className={galleryTrack[layout]} ref={strip}>
        {displayed.map((photo, index) => (
          <button key={photo.src + index} className={'group relative block cursor-zoom-in overflow-hidden bg-charcoal ' + galleryTile[layout]} onClick={(event) => open(index, event.currentTarget)} aria-label={'Ampliar foto ' + (index + 1) + ': ' + photo.alt}>
            <Frame className="size-full object-cover motion-safe:transition-transform motion-safe:duration-600 motion-safe:group-hover:scale-105" photo={photo} sizes={layout === 'story' ? '(max-width: 800px) 100vw, 75vw' : '(max-width: 800px) 100vw, 60vw'} priority={layout === 'mosaic' && index === 0} />
            <span className="absolute right-3 bottom-3 grid size-10 place-items-center rounded-full border border-gold/50 bg-coal/80 text-gold group-hover:bg-gold group-hover:text-coal group-focus-visible:bg-gold group-focus-visible:text-coal motion-safe:transition-colors" aria-hidden="true"><Maximize2 size={17} strokeWidth={1.5} /></span>
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        <button className={outlineButton + ' cursor-pointer'} onClick={(event) => open(0, event.currentTarget)}>Ver todas as fotos</button>
        {children}
        {layout === 'strip' && count > 1 && <div className="ml-auto flex gap-2">
          <button className={iconButton + ' cursor-pointer'} onClick={() => moveStrip(-1)} aria-label="Rolar galeria para a esquerda"><ArrowLeft size={18} /></button>
          <button className={iconButton + ' cursor-pointer'} onClick={() => moveStrip(1)} aria-label="Rolar galeria para a direita"><ArrowRight size={18} /></button>
        </div>}
      </div>
      <dialog className={mediaDialog} ref={dialog} aria-label="Fotos do imóvel" onClose={() => {setOpened(false); opener.current?.focus()}}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') {event.preventDefault(); step(-1)}
          if (event.key === 'ArrowRight') {event.preventDefault(); step(1)}
        }}>
        <button className={dialogClose} aria-label="Fechar galeria" onClick={() => dialog.current?.close()}><X /></button>
        {opened && <Frame className={mediaContents} photo={photos[current]} priority />}
        {count > 1 && <div className="mt-3 flex items-center justify-center gap-3">
          <button className={iconButton + ' cursor-pointer'} aria-label="Foto anterior" onClick={() => step(-1)}><ArrowLeft /></button>
          <span aria-live="polite">{current + 1} / {count}</span>
          <button className={iconButton + ' cursor-pointer'} aria-label="Próxima foto" onClick={() => step(1)}><ArrowRight /></button>
        </div>}
      </dialog>
    </div>
  )
}

export function WatchVideo({src, label, poster}: {src: string; label: string; poster: string}) {
  const [open, setOpen] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  return <>
    <button ref={button} className={outlineButton + ' cursor-pointer'} onClick={() => {setOpen(true); dialog.current?.showModal()}}><Play size={16} /> {label}</button>
    <dialog className={mediaDialog} aria-label={label} ref={dialog} onClose={() => {setOpen(false); button.current?.focus()}}>
      <button className={dialogClose} aria-label="Fechar vídeo" onClick={() => dialog.current?.close()}><X /></button>
      {open && <video className={mediaContents} controls autoPlay playsInline src={src} poster={poster} />}
    </dialog>
  </>
}

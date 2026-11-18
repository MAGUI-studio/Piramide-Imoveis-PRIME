'use client'

import {useCallback, useEffect, useRef, useState, type ReactNode} from 'react'
import {ArrowLeft, ArrowRight, Maximize2, Minimize2, Pause, Play, Volume2, VolumeX, X} from 'lucide-react'
import {iconButton, outlineButton} from '../lib/classes'
import type {Picture} from '../lib/image'
import {LoadingCurtain} from './loadingCurtain'

const mediaDialog = 'm-auto max-h-[94dvh] w-[min(95vw,1230px)] max-w-none border border-zinc-200 bg-paper p-4 text-zinc-900 backdrop:bg-black/70'
const mediaContents = 'block max-h-[75dvh] w-full object-contain'
const dialogClose = iconButton + ' absolute top-2.5 right-2.5 z-1 cursor-pointer'
const galleryTrack = {
  story: 'grid grid-cols-[1.25fr_.8fr] gap-4',
  mosaic: 'grid aspect-[1.4] grid-cols-[1.72fr_1fr] grid-rows-2 gap-2 min-[801px]:aspect-[2.2]',
  strip: 'flex snap-x snap-mandatory gap-3 overflow-x-auto [scrollbar-color:var(--color-piramide)_var(--color-zinc-100)]',
}
const galleryTile = {
  story: 'aspect-[1.5] first:col-span-full first:aspect-[2.5] md:[&:nth-child(3)]:mt-[clamp(16px,7vw,90px)]',
  mosaic: 'min-h-0 first:row-span-2 only:col-span-full [&:nth-child(2):last-child]:row-span-2 motion-safe:animate-image-in motion-safe:[&:nth-child(2)]:[animation-delay:90ms] motion-safe:[&:nth-child(3)]:[animation-delay:170ms]',
  strip: 'aspect-[1.5] flex-[0_0_min(76%,940px)] snap-start',
}

export function Frame({photo, sizes = '100vw', priority = false, className}: {photo: Picture; sizes?: string; priority?: boolean; className?: string}) {
  return <img className={className} src={photo.src} srcSet={photo.srcSet} sizes={sizes} alt={photo.alt} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : undefined} decoding="async" />
}

export function ImmersiveCover({
  photo, src, header, children, placeholder = false,
}: {
  photo: Picture
  src?: string | null
  header: ReactNode
  children: ReactNode
  placeholder?: boolean
}) {
  const [stage, setStage] = useState<'cover' | 'intro' | 'player' | 'paused'>('cover')
  const [playing, setPlaying] = useState(false)
  const [failed, setFailed] = useState(false)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [nativeFullscreen, setNativeFullscreen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const container = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const fullscreen = nativeFullscreen || expanded
  const showOverlay = stage !== 'intro' && !playing
  const videoLabel = placeholder ? 'Clipe demonstrativo' : 'Clipe de abertura'

  const startPlayback = useCallback(() => {
    const player = video.current
    if (!player) return
    setStage('player')
    void player.play().catch(() => {
      // The play button remains available if the browser requires another gesture.
    })
  }, [])

  useEffect(() => {
    const sync = () => setNativeFullscreen(document.fullscreenElement === container.current)
    document.addEventListener('fullscreenchange', sync)
    return () => document.removeEventListener('fullscreenchange', sync)
  }, [])

  useEffect(() => {
    if (!expanded) return
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setExpanded(false)
    }
    document.addEventListener('keydown', escape)
    return () => document.removeEventListener('keydown', escape)
  }, [expanded])

  async function toggleFullscreen() {
    if (expanded) {
      setExpanded(false)
      return
    }
    const element = container.current
    if (!element) return
    if (document.fullscreenElement === element) {
      await document.exitFullscreen()
      return
    }
    try {
      if (document.fullscreenEnabled) {
        await element.requestFullscreen()
        return
      }
    } catch {
      // Embedded browsers can restrict the Fullscreen API.
    }
    setExpanded(true)
  }

  function toggleMute() {
    const player = video.current
    if (!player) return
    if (player.volume === 0) {
      player.volume = 1
      player.muted = false
    } else {
      player.muted = !player.muted
    }
  }

  function startIntro() {
    const player = video.current
    if (!player) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      startPlayback()
      return
    }
    player.load()
    setStage('intro')
  }

  return (
    <div className="relative aspect-[5/6] min-[801px]:aspect-[2/1]">
      <div ref={container} className={'isolate grid items-end overflow-hidden [&:fullscreen]:bg-black ' + (expanded ? 'fixed inset-0 z-[100000] bg-black' : 'absolute inset-0 bg-paper ' + (stage === 'player' ? 'z-50' : ''))}>
      <Frame className="absolute inset-0 size-full object-cover motion-safe:animate-image-in" photo={photo} priority />
      {src && !failed && (
        <video
          ref={video}
          src={src}
          aria-label={videoLabel}
          aria-hidden={stage !== 'player'}
          preload="none"
          playsInline
          disablePictureInPicture
          className={'absolute inset-0 size-full bg-black object-contain ' + (stage === 'player' ? '' : 'pointer-events-none invisible')}
          onVolumeChange={({currentTarget}) => {
            setVolume(currentTarget.volume)
            setMuted(currentTarget.muted)
          }}
          onPlay={() => setPlaying(true)}
          onPause={() => {
            setPlaying(false)
            setStage((current) => current === 'player' ? 'paused' : current)
          }}
          onEnded={() => {
            setPlaying(false)
            setStage('cover')
          }}
          onError={() => {
            setFailed(true)
            setPlaying(false)
            setStage('cover')
          }}
        />
      )}
      {showOverlay && <>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,#161616e6_0%,#16161670_37%,transparent_68%),linear-gradient(to_bottom,#16161680_0%,transparent_34%)]" />
        {header}
        <div className="pointer-events-none relative z-1 mx-auto w-[calc(100%-2.25rem)] max-w-6xl pb-[clamp(4.5rem,7vw,7rem)] text-center text-white">
          {src && !failed && !fullscreen && (stage === 'cover' || stage === 'paused') && (
            <button
              type="button"
              onClick={stage === 'paused' ? startPlayback : startIntro}
              aria-label={(stage === 'paused' ? 'Continuar ' : 'Reproduzir ') + videoLabel.toLowerCase()}
              className="pointer-events-auto mb-5 inline-grid size-14 cursor-pointer place-items-center rounded-full border border-white/65 bg-black/45 text-white transition-colors hover:border-white hover:bg-white hover:text-coal focus-visible:bg-white focus-visible:text-coal sm:size-16"
            >
              <Play aria-hidden="true" size={23} className="ml-0.5 fill-current" />
            </button>
          )}
          {children}
        </div>
      </>}
      {stage === 'intro' && <LoadingCurtain embedded onComplete={startPlayback} />}
      {(stage === 'player' || (fullscreen && stage !== 'intro')) && (
        <div role="group" aria-label="Controles do vídeo" className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-coal/90 p-1.5 text-white shadow-lg sm:bottom-6 sm:gap-3">
          <button type="button" aria-label={playing ? 'Pausar vídeo' : 'Reproduzir vídeo'} onClick={() => {
            if (playing) video.current?.pause()
            else if (stage === 'cover') startIntro()
            else startPlayback()
          }} className="grid size-10 cursor-pointer place-items-center rounded-full bg-piramide transition-colors hover:bg-piramide/85">
            {playing ? <Pause aria-hidden="true" size={17} className="fill-current" /> : <Play aria-hidden="true" size={17} className="ml-0.5 fill-current" />}
          </button>
          <div className="flex items-center gap-1">
            <button type="button" aria-label={muted || volume === 0 ? 'Ativar som' : 'Silenciar'} onClick={toggleMute} className="grid size-9 cursor-pointer place-items-center rounded-full hover:bg-white/10">
              {muted || volume === 0 ? <VolumeX aria-hidden="true" size={18} /> : <Volume2 aria-hidden="true" size={18} />}
            </button>
            <input type="range" aria-label="Volume do vídeo" min="0" max="1" step="0.01" value={muted ? 0 : volume} className="h-6 w-14 cursor-pointer accent-piramide sm:w-20" onChange={(event) => {
              const player = video.current
              if (!player) return
              player.volume = Number(event.currentTarget.value)
              player.muted = false
            }} />
          </div>
          <button type="button" aria-label={fullscreen ? 'Sair da tela cheia' : 'Tela cheia'} onClick={toggleFullscreen} className="grid size-9 cursor-pointer place-items-center rounded-full hover:bg-white/10">
            {fullscreen ? <Minimize2 aria-hidden="true" size={17} /> : <Maximize2 aria-hidden="true" size={17} />}
          </button>
        </div>
      )}
      </div>
    </div>
  )
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
          <button key={photo.src + index} className={'group relative block cursor-zoom-in overflow-hidden bg-zinc-100 ' + galleryTile[layout]} onClick={(event) => open(index, event.currentTarget)} aria-label={'Ampliar foto ' + (index + 1) + ': ' + photo.alt}>
            <Frame className="size-full object-cover motion-safe:transition-transform motion-safe:duration-600 motion-safe:group-hover:scale-105" photo={photo} sizes={layout === 'story' ? '(max-width: 800px) 100vw, 75vw' : '(max-width: 800px) 100vw, 60vw'} priority={layout === 'mosaic' && index === 0} />
            <span className="absolute right-3 bottom-3 grid size-10 place-items-center rounded-full bg-white text-piramide group-hover:bg-piramide group-hover:text-white group-focus-visible:bg-piramide group-focus-visible:text-white motion-safe:transition-colors" aria-hidden="true"><Maximize2 size={17} strokeWidth={1.5} /></span>
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

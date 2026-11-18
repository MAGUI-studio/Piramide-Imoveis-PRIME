'use client'

import {useCallback, useEffect, useRef, useState, type ReactNode} from 'react'
import {ArrowLeft, ArrowRight, Maximize2, Minimize2, Pause, Play, Volume2, VolumeX, X} from 'lucide-react'
import {glassAction, glassControl, outlineButton, sweepButton, sweepFill, sweepOnCover, wrap} from '../lib/classes'
import type {Picture} from '../lib/image'
import {LoadingCurtain} from './loadingCurtain'
import {CinemaIcon} from './cinemaIcon'
import {ScrollArea} from './scrollArea'

const mediaDialog = 'm-auto max-h-[94dvh] w-[min(92vw,1200px)] max-w-none overflow-visible border-0 bg-transparent p-0 text-white outline-none backdrop:bg-black/0 backdrop:backdrop-blur-none backdrop:transition-all backdrop:duration-400 backdrop:ease-out open:data-[visible=true]:backdrop:backdrop-blur-md'
const photoBackdrop = 'open:data-[visible=true]:backdrop:bg-black/90'
const mediaContents = 'block size-full object-cover'
const videoContents = 'block max-h-[78dvh] w-full object-contain shadow-2xl'
const dialogButton = 'inline-grid size-10 shrink-0 cursor-pointer place-items-center rounded-none border border-white/25 bg-black/55 text-white backdrop-blur-md transition-colors hover:border-piramide hover:bg-piramide'
const dialogClose = dialogButton + ' fixed top-5 right-5 z-20 sm:top-7 sm:right-8'
const galleryTrack = {
  story: 'grid grid-cols-2 gap-2 sm:gap-3 lg:auto-rows-[clamp(11rem,17vw,17rem)] lg:grid-cols-12',
  mosaic: 'grid aspect-[1.4] grid-cols-[1.72fr_1fr] grid-rows-2 gap-2 min-[801px]:aspect-[2.2]',
  strip: 'flex w-max gap-3',
}
const galleryTile = {
  story: 'min-h-0 focus-visible:-outline-offset-4 lg:aspect-auto',
  mosaic: 'min-h-0 first:row-span-2 only:col-span-full [&:nth-child(2):last-child]:row-span-2 motion-safe:animate-image-in motion-safe:[&:nth-child(2)]:[animation-delay:90ms] motion-safe:[&:nth-child(3)]:[animation-delay:170ms]',
  strip: 'aspect-[1.55] w-[min(82cqw,53rem)] shrink-0 snap-start bg-[#ede5f0] only:w-[100cqw] focus-visible:-outline-offset-4 min-[53rem]:aspect-[1.8] min-[53rem]:w-[min(62cqw,53rem)] min-[53rem]:only:w-[100cqw]',
}
const storyLead = 'col-span-2 aspect-[1.55] lg:col-span-7 lg:row-span-2'
const storySmall = 'aspect-[1.15]'
const storyWide = 'col-span-2 aspect-[1.8]'
const storyPatterns = [
  [storyWide + ' lg:col-span-12 lg:row-span-2'],
  [storyLead, storyWide + ' lg:col-span-5 lg:row-span-2'],
  [storyLead, storySmall + ' lg:col-span-5', storySmall + ' lg:col-span-5'],
  [storyLead, storySmall + ' lg:col-span-2', storySmall + ' lg:col-span-3', storyWide + ' lg:col-span-5'],
  [storyLead, storySmall + ' lg:col-span-5', storySmall + ' lg:col-span-5', storySmall + ' lg:col-span-5', storySmall + ' lg:col-span-7'],
]

function storyGroups(count: number) {
  const groups = Math.ceil(count / storyPatterns.length)
  const groupSize = Math.floor(count / groups)
  const remainder = count % groups
  return Array.from({length: groups}, (_, group) => ({
    start: group * groupSize + Math.max(0, group - (groups - remainder)),
    pattern: storyPatterns[groupSize + Number(group >= groups - remainder) - 1],
  }))
}

export function Frame({photo, sizes = '100vw', priority = false, className}: {photo: Picture; sizes?: string; priority?: boolean; className?: string}) {
  return <img className={className} src={photo.src} srcSet={photo.srcSet} sizes={sizes} alt={photo.alt} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : undefined} decoding="async" />
}

export function ImmersiveCover({
  photo, src, header, children,
}: {
  photo: Picture
  src?: string | null
  header: ReactNode
  children: ReactNode
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
          aria-label="Clipe de abertura"
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
              aria-label={stage === 'paused' ? 'Continuar clipe de abertura' : 'Reproduzir clipe de abertura'}
              className={sweepButton + ' ' + sweepOnCover + ' pointer-events-auto mb-5 size-14 sm:size-16'}
            >
              <span aria-hidden="true" className={sweepFill} />
              <Play aria-hidden="true" size={23} className="relative z-10 ml-0.5 fill-current transition-colors duration-300 group-hover/cta:text-white group-focus-visible/cta:text-white motion-reduce:transition-none" />
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
  const [slide, setSlide] = useState<{current: number; previous: number; direction: 1 | -1}>({
    current: 0,
    previous: -1,
    direction: 1,
  })
  const dialog = useRef<HTMLDialogElement>(null)
  const opener = useRef<HTMLElement | null>(null)
  const stage = useRef<HTMLDivElement>(null)
  const drag = useRef({active: false, startX: 0, deltaX: 0})
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [opened, setOpened] = useState(false)
  const [visible, setVisible] = useState(false)
  const [dragging, setDragging] = useState(false)
  const count = photos.length
  const current = slide.current

  function onStagePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (count < 2 || (event.pointerType === 'mouse' && event.button !== 0)) return
    drag.current = {active: true, startX: event.clientX, deltaX: 0}
    setDragging(true)
    stage.current?.setPointerCapture(event.pointerId)
  }

  function onStagePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current.active || !stage.current) return
    const delta = event.clientX - drag.current.startX
    drag.current.deltaX = delta
    stage.current.style.setProperty('--drag-x', delta + 'px')
  }

  function onStagePointerEnd(event: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current.active) return
    const delta = drag.current.deltaX
    drag.current.active = false
    setDragging(false)
    stage.current?.style.setProperty('--drag-x', '0px')
    if (stage.current?.hasPointerCapture(event.pointerId)) {
      stage.current.releasePointerCapture(event.pointerId)
    }
    if (Math.abs(delta) > 60 && count > 1) {
      step(delta < 0 ? 1 : -1)
    }
  }

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }, [])

  function step(direction: 1 | -1) {
    setSlide((prev) => ({
      current: (prev.current + direction + count) % count,
      previous: prev.current,
      direction,
    }))
  }
  function goTo(index: number) {
    setSlide((prev) => (index === prev.current
      ? prev
      : {current: index, previous: prev.current, direction: index > prev.current ? 1 : -1}))
  }
  function open(index: number, element: HTMLElement) {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    opener.current = element
    setSlide({current: index, previous: -1, direction: 1})
    setOpened(true)
    if (!dialog.current?.open) dialog.current?.showModal()
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
  }
  function requestClose() {
    setVisible(false)
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => {
      dialog.current?.close()
      setOpened(false)
    }, 320)
  }
  if (!count) return <>{children}</>
  const displayed = layout === 'mosaic' ? photos.slice(0, 3) : photos
  const cinemaLayout = layout === 'strip'
  const editorialLayout = layout === 'story'
  function renderPhoto(photo: Picture, index: number, placement = '') {
    const sizes = editorialLayout
      ? placement.includes('lg:col-span-12')
        ? '100vw'
        : placement.startsWith('col-span-2')
        ? '(max-width: 1023px) 100vw, 60vw'
        : '(max-width: 1023px) 50vw, 42vw'
      : '(max-width: 800px) 85vw, 60vw'
    return (
      <button type="button" tabIndex={cinemaLayout ? -1 : undefined} key={photo.src + index} className={'group relative block cursor-zoom-in overflow-hidden ' + galleryTile[layout] + ' ' + placement + (cinemaLayout ? '' : ' bg-zinc-100')} onClick={(event) => open(index, event.currentTarget)} aria-label={'Ampliar foto ' + (index + 1) + ': ' + photo.alt}>
        <Frame className={'size-full object-cover motion-safe:transition-transform motion-safe:duration-600 motion-safe:group-hover:scale-105' + (editorialLayout ? ' absolute inset-0' : '')} photo={photo} sizes={sizes} priority={layout === 'mosaic' && index === 0} />
        <span className={glassControl + ' pointer-events-none absolute right-3 bottom-3 size-11' + (cinemaLayout ? '' : ' opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 motion-safe:transition-opacity')} aria-hidden="true"><CinemaIcon name="expand" /></span>
      </button>
    )
  }
  const track = editorialLayout ? (
    <div className="grid gap-2 sm:gap-3">
      {storyGroups(count).map(({start, pattern}, groupIndex) => (
        <div className={galleryTrack.story + (groupIndex % 2 ? ' lg:[direction:rtl]' : '')} key={start}>
          {pattern.map((placement, offset) => renderPhoto(photos[start + offset], start + offset, placement))}
        </div>
      ))}
    </div>
  ) : (
    <div className={galleryTrack[layout]}>
      {displayed.map((photo, index) => renderPhoto(photo, index))}
    </div>
  )
  const actionLayout = layout === 'mosaic' ? wrap + ' py-4' : 'mt-4'
  const actions = (
    <div className={'flex flex-wrap items-center gap-2.5 ' + (cinemaLayout ? '' : actionLayout)}>
      <button type="button" className={cinemaLayout || editorialLayout ? glassAction : outlineButton + ' cursor-pointer'} onClick={(event) => open(0, event.currentTarget)}>
        {(cinemaLayout || editorialLayout) && <CinemaIcon name="photos" />} Ver todas as fotos
      </button>
      {children}
    </div>
  )

  return (
    <div data-gallery={layout}>
      {cinemaLayout ? <ScrollArea actions={actions}>{track}</ScrollArea> : <>{track}{actions}</>}
      <dialog
        className={mediaDialog + ' ' + photoBackdrop}
        ref={dialog}
        data-visible={visible}
        aria-label="Fotos do imóvel"
        onCancel={(event) => {
          event.preventDefault()
          requestClose()
        }}
        onClose={() => {
          setVisible(false)
          setOpened(false)
          opener.current?.focus({preventScroll: cinemaLayout})
        }}
        onClick={(event) => {
          if (event.target === dialog.current) requestClose()
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') {event.preventDefault(); step(-1)}
          if (event.key === 'ArrowRight') {event.preventDefault(); step(1)}
        }}
      >
        <div
          className={
            'transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ' +
            (visible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-3 scale-[0.96] opacity-0')
          }
        >
          <button type="button" className={dialogClose} aria-label="Fechar galeria" onClick={requestClose}><X size={18} /></button>
          {opened && (
            <div
              ref={stage}
              onPointerDown={onStagePointerDown}
              onPointerMove={onStagePointerMove}
              onPointerUp={onStagePointerEnd}
              onPointerCancel={onStagePointerEnd}
              onDragStart={(event) => event.preventDefault()}
              className={
                'relative h-[75dvh] w-full touch-pan-y overflow-hidden bg-black/40 shadow-2xl select-none ' +
                (count > 1 ? (dragging ? 'cursor-grabbing' : 'cursor-grab') : '')
              }
            >
              {photos.map((photo, idx) => {
                const isCurrent = idx === current
                const isPrevious = idx === slide.previous && slide.previous !== current
                if (!isCurrent && !isPrevious) return null
                const animClass = slide.previous < 0
                  ? ''
                  : isCurrent
                    ? slide.direction === 1
                      ? 'motion-safe:animate-[gallery-in-next_.55s_cubic-bezier(0.16,1,0.3,1)_both]'
                      : 'motion-safe:animate-[gallery-in-prev_.55s_cubic-bezier(0.16,1,0.3,1)_both]'
                    : slide.direction === 1
                      ? 'motion-safe:animate-[gallery-out-next_.55s_cubic-bezier(0.16,1,0.3,1)_both]'
                      : 'motion-safe:animate-[gallery-out-prev_.55s_cubic-bezier(0.16,1,0.3,1)_both]'
                return (
                  <div
                    key={photo.src + idx}
                    aria-hidden={!isCurrent}
                    className={'absolute inset-0 ' + (isCurrent ? 'z-2 ' : 'z-1 pointer-events-none ') + animClass}
                  >
                    <div
                      className={'size-full ' + (!dragging ? 'transition-transform duration-300 ease-out' : '')}
                      style={isCurrent ? {transform: 'translateX(var(--drag-x, 0px))'} : undefined}
                    >
                      <Frame className={mediaContents} photo={photo} priority={isCurrent} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          {count > 1 && (
            <div className="mt-5 flex items-center justify-center gap-4">
              <button type="button" className={dialogButton} aria-label="Foto anterior" onClick={() => step(-1)}><ArrowLeft size={17} /></button>
              <div className="flex items-center gap-2" role="group" aria-label="Selecionar foto">
                {photos.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => goTo(idx)}
                    aria-label={`Ir para foto ${idx + 1} de ${count}`}
                    aria-current={idx === current ? 'true' : undefined}
                    className="group flex h-4 cursor-pointer items-center"
                  >
                    <div
                      className={
                        'h-1.5 rounded-none transition-all duration-300 ' +
                        (idx === current ? 'w-10 bg-white' : 'w-3.5 bg-white/30 group-hover:bg-white/60')
                      }
                    />
                  </button>
                ))}
              </div>
              <button type="button" className={dialogButton} aria-label="Próxima foto" onClick={() => step(1)}><ArrowRight size={17} /></button>
            </div>
          )}
        </div>
      </dialog>
    </div>
  )
}

function parseEmbedVideo(url: string): string | null {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') {
      const id = parsed.pathname.slice(1).split('/')[0]
      return id ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0` : null
    }
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      const id = parsed.searchParams.get('v') || parsed.pathname.match(/^\/(?:embed|shorts)\/([^/?#]+)/)?.[1]
      return id ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0` : null
    }
    if (host === 'vimeo.com' || host === 'player.vimeo.com') {
      const id = parsed.pathname.match(/\/(?:video\/)?(\d+)/)?.[1]
      return id ? `https://player.vimeo.com/video/${id}?autoplay=1` : null
    }
  } catch {
    return null
  }
  return null
}

export function WatchVideo({src, label, poster, external = false, cinemaLayout = false, glassActions = cinemaLayout}: {src: string; label: string; poster?: string; external?: boolean; cinemaLayout?: boolean; glassActions?: boolean}) {
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const embedSrc = external ? parseEmbedVideo(src) : null
  const isDirectVideo = !external || /\.(mp4|webm|mov)(?:[?#]|$)/i.test(src)
  const actionClass = glassActions ? glassAction : outlineButton
  const playIcon = glassActions ? <CinemaIcon name="play" /> : <Play size={16} />

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }, [])

  if (external && !embedSrc && !isDirectVideo) {
    return <a className={actionClass} href={src} target="_blank" rel="noopener noreferrer">{playIcon} {label}</a>
  }

  function openModal() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpen(true)
    if (!dialog.current?.open) dialog.current?.showModal()
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
  }

  function requestClose() {
    setVisible(false)
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => {
      dialog.current?.close()
      setOpen(false)
    }, 320)
  }

  return <>
    <button type="button" ref={button} className={actionClass + ' cursor-pointer'} onClick={openModal}>{playIcon} {label}</button>
    <dialog
      className={mediaDialog + ' ' + (cinemaLayout ? 'open:data-[visible=true]:backdrop:bg-[#f7f0f9]/88' : photoBackdrop)}
      aria-label={label}
      ref={dialog}
      data-visible={visible}
      onCancel={(event) => {
        event.preventDefault()
        requestClose()
      }}
      onClose={() => {
        setVisible(false)
        setOpen(false)
        button.current?.focus()
      }}
      onClick={(event) => {
        if (event.target === dialog.current) requestClose()
      }}
    >
      <div
        className={
          'transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ' +
          (visible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-3 scale-[0.96] opacity-0')
        }
      >
        <button type="button" className={cinemaLayout ? glassControl + ' fixed top-3 right-3 z-20 size-11' : dialogClose} aria-label="Fechar vídeo" onClick={requestClose}>
          {cinemaLayout ? <CinemaIcon name="close" /> : <X size={18} />}
        </button>
        {open && (embedSrc
          ? <iframe className="aspect-video max-h-[78dvh] w-full bg-black shadow-2xl" src={embedSrc} title={label} allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowFullScreen />
          : <video className={videoContents} controls autoPlay playsInline src={src} poster={poster} />)}
      </div>
    </dialog>
  </>
}

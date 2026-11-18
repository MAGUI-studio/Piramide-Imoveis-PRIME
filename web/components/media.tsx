'use client'

import {useCallback, useEffect, useId, useRef, useState, type ReactNode, type RefObject} from 'react'
import {ArrowLeft, ArrowRight, Maximize2, Minimize2, Pause, Play, Volume2, VolumeX, X} from 'lucide-react'
import {glassAction, glassControl, heading, outlineButton, sweepButton, sweepFill, sweepOnCover, wrap} from '../lib/classes'
import type {Picture} from '../lib/image'
import {CinemaIcon} from './cinemaIcon'
import {ScrollArea} from './scrollArea'

const mediaDialog = 'm-auto max-h-[94dvh] w-[min(92vw,1200px)] max-w-none overflow-visible border-0 bg-transparent p-0 text-white outline-none backdrop:bg-black/0 backdrop:backdrop-blur-none backdrop:transition-all backdrop:duration-400 backdrop:ease-out open:data-[visible=true]:backdrop:backdrop-blur-md'
const photoBackdrop = 'open:data-[visible=true]:backdrop:bg-black/90'
const mediaContents = 'block size-full object-cover'
const dialogButton = 'inline-grid size-10 shrink-0 cursor-pointer place-items-center rounded-none border border-white/25 bg-black/55 text-white backdrop-blur-md transition-colors hover:border-piramide hover:bg-piramide'
const dialogClose = dialogButton + ' fixed top-5 right-5 z-20 sm:top-7 sm:right-8'
const galleryTrack = {
  story: 'grid grid-cols-2 gap-2 sm:gap-3 lg:auto-rows-[clamp(11rem,17vw,17rem)] lg:grid-cols-12',
  mosaic: 'grid aspect-[1.4] grid-cols-[1.72fr_1fr] grid-rows-2 gap-2 overflow-clip min-[801px]:aspect-[2.2]',
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
  const [stage, setStage] = useState<'cover' | 'player' | 'paused'>('cover')
  const [playing, setPlaying] = useState(false)
  const [failed, setFailed] = useState(false)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [nativeFullscreen, setNativeFullscreen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const container = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const fullscreen = nativeFullscreen || expanded
  const showOverlay = !playing

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

  return (
    <div className="relative aspect-[5/6] min-[801px]:aspect-[2/1]">
      <div ref={container} className={'isolate grid place-items-center overflow-hidden [&:fullscreen]:bg-black ' + (expanded ? 'fixed inset-0 z-[100000] bg-black' : 'absolute inset-0 bg-paper ' + (stage === 'player' ? 'z-50' : ''))}>
      <Frame className="absolute inset-0 size-full object-cover motion-safe:animate-image-in" photo={photo} priority />
      {src && !failed && (
        <video
          ref={video}
          src={src}
          aria-label="Clipe de abertura"
          aria-hidden={stage !== 'player'}
          preload="none"
          playsInline
          controlsList="nodownload noremoteplayback"
          disablePictureInPicture
          disableRemotePlayback
          onContextMenu={(event) => event.preventDefault()}
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
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,#16161680_0%,#16161640_60%,transparent_100%),linear-gradient(to_top,#161616bf_0%,#1616164d_50%,#16161680_100%)]" />
        {header}
        <div className="pointer-events-none relative z-1 mx-auto w-[calc(100%-2.25rem)] max-w-6xl py-16 text-center text-white">
          {src && !failed && !fullscreen && (stage === 'cover' || stage === 'paused') && (
            <button
              type="button"
              onClick={startPlayback}
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
      {(stage === 'player' || fullscreen) && (
        <div role="group" aria-label="Controles do vídeo" className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-coal/90 p-1.5 text-white shadow-lg sm:bottom-6 sm:gap-3">
          <button type="button" aria-label={playing ? 'Pausar vídeo' : 'Reproduzir vídeo'} onClick={() => {
            if (playing) video.current?.pause()
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
  const captionPrefix = useId()
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
    const captionId = editorialLayout && photo.caption ? captionPrefix + '-caption-' + index : undefined
    const sizes = editorialLayout
      ? placement.includes('lg:col-span-12')
        ? '100vw'
        : placement.startsWith('col-span-2')
        ? '(max-width: 1023px) 100vw, 60vw'
        : '(max-width: 1023px) 50vw, 42vw'
      : '(max-width: 800px) 85vw, 60vw'
    return (
      <button type="button" tabIndex={cinemaLayout ? -1 : undefined} key={photo.src + index} className={'group relative block cursor-zoom-in overflow-hidden ' + galleryTile[layout] + ' ' + placement + (cinemaLayout ? '' : ' bg-zinc-100')} onClick={(event) => open(index, event.currentTarget)} aria-label={'Ampliar foto ' + (index + 1) + ': ' + photo.alt} aria-describedby={captionId}>
        <Frame className={'size-full object-cover motion-safe:transition-transform motion-safe:duration-600 motion-safe:group-hover:scale-105' + (editorialLayout ? ' absolute inset-0' : '')} photo={photo} sizes={sizes} priority={layout === 'mosaic' && index === 0} />
        {captionId && <span id={captionId} className="pointer-events-none absolute inset-x-2 bottom-2 line-clamp-3 w-fit max-w-[calc(100%-4.5rem)] bg-paper/95 px-2.5 py-1.5 text-start text-xs font-medium text-zinc-800 backdrop-blur-md sm:inset-s-3 sm:bottom-3">{photo.caption}</span>}
        <span className={glassControl + ' pointer-events-none absolute right-3 bottom-3 size-11 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 motion-safe:transition-opacity'} aria-hidden="true"><CinemaIcon name="expand" /></span>
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

function parseEmbedVideo(url: string, autoplay = true): string | null {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, '')
    const auto = autoplay ? '1' : '0'
    if (host === 'youtu.be') {
      const id = parsed.pathname.slice(1).split('/')[0]
      return id ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=${auto}&rel=0` : null
    }
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      const id = parsed.searchParams.get('v') || parsed.pathname.match(/^\/(?:embed|shorts)\/([^/?#]+)/)?.[1]
      return id ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=${auto}&rel=0` : null
    }
    if (host === 'vimeo.com' || host === 'player.vimeo.com') {
      const id = parsed.pathname.match(/\/(?:video\/)?(\d+)/)?.[1]
      return id ? `https://player.vimeo.com/video/${id}?autoplay=${auto}` : null
    }
  } catch {
    return null
  }
  return null
}

export type StoryVideo = {url: string; title: string; poster: Picture; external?: boolean}
const directVideoPattern = /\.(mp4|webm|mov)(?:[?#]|$)/i

function videoTime(seconds: number) {
  const whole = Math.floor(seconds)
  return Math.floor(whole / 60) + ':' + String(whole % 60).padStart(2, '0')
}

function PropertyVideoPlayer({src, label, poster, autoplay = false, playerRef, className, inline = false}: {
  src: string
  label: string
  poster?: string
  autoplay?: boolean
  playerRef?: RefObject<HTMLVideoElement | null>
  className: string
  inline?: boolean
}) {
  const localVideo = useRef<HTMLVideoElement>(null)
  const video = playerRef ?? localVideo
  const frame = useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const sync = () => setFullscreen(document.fullscreenElement === frame.current)
    document.addEventListener('fullscreenchange', sync)
    return () => document.removeEventListener('fullscreenchange', sync)
  }, [])

  function togglePlayback() {
    const node = video.current
    if (!node) return
    if (node.paused) void node.play().catch(() => {})
    else node.pause()
  }

  function toggleFullscreen() {
    if (document.fullscreenElement === frame.current) void document.exitFullscreen().catch(() => {})
    else void frame.current?.requestFullscreen?.().catch(() => {})
  }

  const playerControl = 'grid size-9 shrink-0 cursor-pointer place-items-center ' + (inline
    ? 'text-zinc-800 hover:bg-zinc-200 focus-visible:outline-piramide'
    : 'text-white hover:bg-white/15 focus-visible:outline-white')

  return (
    <div ref={frame} className={'isolate overflow-hidden ' + (inline ? 'flex flex-col bg-zinc-100 ' : 'bg-black ') + className} onContextMenu={(event) => event.preventDefault()}>
      <div className={inline ? 'relative aspect-video bg-black ' + (fullscreen ? 'min-h-0 flex-1' : '') : 'absolute inset-0'}>
      <video
        ref={video}
        className="absolute inset-0 size-full object-contain"
        aria-label={label}
        src={src}
        poster={poster}
        autoPlay={autoplay}
        playsInline
        preload="metadata"
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
        disableRemotePlayback
        onClick={togglePlayback}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onVolumeChange={(event) => setMuted(event.currentTarget.muted)}
        onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
        onDurationChange={(event) => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)}
      />
      {!playing && (
        <button type="button" className={'absolute top-1/2 left-1/2 grid size-13 -translate-1/2 cursor-pointer place-items-center border backdrop-blur-md sm:size-16 ' + (inline ? 'border-white/75 bg-white/80 text-zinc-900 hover:bg-white' : 'border-white/55 bg-black/45 text-white hover:bg-black/65')} aria-label="Reproduzir vídeo" onClick={togglePlayback}>
          <Play aria-hidden="true" size={22} className="ms-0.5 fill-current" />
        </button>
      )}
      </div>
      <div className={'flex items-center gap-1 px-1.5 py-1 text-sm sm:gap-2 sm:px-2.5 ' + (inline ? 'min-h-12 border-b border-zinc-300/65 bg-zinc-100 text-zinc-700' : 'absolute inset-x-0 bottom-0 bg-black/70 text-white backdrop-blur-md')} role="group" aria-label="Controles do vídeo">
        <button type="button" className={playerControl} aria-label={playing ? 'Pausar vídeo' : 'Reproduzir'} onClick={togglePlayback}>
          {playing ? <Pause aria-hidden="true" size={16} className="fill-current" /> : <Play aria-hidden="true" size={16} className="fill-current" />}
        </button>
        <input type="range" aria-label="Posição do vídeo" aria-valuetext={videoTime(time) + ' de ' + videoTime(duration)} className={'min-w-0 flex-1 cursor-pointer disabled:cursor-default ' + (inline ? 'accent-piramide' : 'accent-white')} min={0} max={duration || 1} step={0.1} value={Math.min(time, duration)} disabled={!duration} onChange={(event) => {
          if (!video.current) return
          video.current.currentTime = Number(event.currentTarget.value)
          setTime(video.current.currentTime)
        }} />
        <span className="hidden text-[11px] whitespace-nowrap tabular-nums min-[370px]:inline">{videoTime(time)} / {videoTime(duration)}</span>
        <button type="button" className={playerControl} aria-label={muted ? 'Ativar som' : 'Silenciar'} onClick={() => {if (video.current) video.current.muted = !video.current.muted}}>
          {muted ? <VolumeX aria-hidden="true" size={17} /> : <Volume2 aria-hidden="true" size={17} />}
        </button>
        <button type="button" className={playerControl} aria-label={fullscreen ? 'Sair da tela cheia' : 'Tela cheia'} onClick={toggleFullscreen}>
          {fullscreen ? <Minimize2 aria-hidden="true" size={16} /> : <Maximize2 aria-hidden="true" size={16} />}
        </button>
      </div>
    </div>
  )
}

export function InlineVideoTour({videos, virtualTour}: {videos: StoryVideo[]; virtualTour?: ReactNode}) {
  const [selection, setSelection] = useState<string | null>(null)
  const player = useRef<HTMLVideoElement>(null)
  const current = videos.find((video) => video.url === selection) ?? videos[0]
  if (!current) return null

  const autoplay = selection === current.url
  const embed = current.external ? parseEmbedVideo(current.url, autoplay) : null
  const direct = !current.external || directVideoPattern.test(current.url)

  function choose(video: StoryVideo) {
    setSelection(video.url)
    if (video.url === current.url && player.current) void player.current.play().catch(() => {})
  }

  return (
    <div className={'grid gap-x-[clamp(1.75rem,4vw,4rem)] gap-y-5 ' + (videos.length > 1 ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)] lg:items-stretch' : '')}>
      {videos.length > 1 && (
        <div className="min-w-0 lg:relative lg:col-start-1 lg:row-start-1">
          <ol aria-label="Capítulos da visita" className="grid min-w-0 grid-cols-2 gap-x-3 gap-y-4 lg:absolute lg:inset-0 lg:auto-rows-fr">
            {videos.map((video, index) => {
              const wide = index === 0 && videos.length % 2 === 1
              return (
              <li key={video.url} className={'min-w-0 lg:min-h-0 ' + (wide ? 'col-span-2' : '')}>
                <button type="button" aria-current={current.url === video.url ? 'true' : undefined} onClick={() => choose(video)} className="group/chapter flex h-full w-full cursor-pointer flex-col text-start focus-visible:outline-offset-2">
                  <span className={'relative block w-full overflow-hidden bg-zinc-200 lg:aspect-auto lg:min-h-0 lg:flex-1 ' + (wide ? 'aspect-[3.4]' : 'aspect-video')}>
                    <Frame className="absolute inset-0 size-full object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover/chapter:scale-105" photo={{...video.poster, alt: ''}} sizes={wide ? '(max-width: 1023px) 100vw, 36vw' : '(max-width: 1023px) 50vw, 18vw'} />
                    <span aria-hidden="true" className="absolute inset-0 border-2 border-transparent group-aria-[current=true]/chapter:border-piramide" />
                    <span aria-hidden="true" className={glassControl + ' pointer-events-none absolute top-1/2 left-1/2 size-10 min-h-0 -translate-1/2 opacity-0 group-hover/chapter:opacity-100 group-focus-visible/chapter:opacity-100 motion-safe:transition-opacity'}>
                      <Play size={14} className="ms-0.5 fill-current" />
                    </span>
                  </span>
                  <span className="mt-1.5 block shrink-0 text-xs leading-snug font-medium wrap-anywhere group-aria-[current=true]/chapter:font-bold group-aria-[current=true]/chapter:text-piramide sm:text-sm">{video.title}</span>
                </button>
              </li>
              )
            })}
          </ol>
        </div>
      )}
      <div className={'row-start-1 min-w-0 ' + (videos.length > 1 ? 'lg:col-start-2 lg:row-start-1' : '')}>
        {embed ? (
            <iframe key={embed} className="block aspect-video w-full bg-black" src={embed} title={current.title} allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowFullScreen />
          ) : direct ? (
            <PropertyVideoPlayer key={current.url} playerRef={player} className="relative" src={current.url} label={current.title} poster={current.poster.src} autoplay={autoplay} inline />
          ) : (
            <div className="relative isolate grid aspect-video place-items-center bg-black">
              <Frame className="absolute inset-0 -z-10 size-full object-cover" photo={current.poster} />
              <a className={glassAction} href={current.url} target="_blank" rel="noopener noreferrer">Abrir vídeo externo <CinemaIcon name="external" /></a>
            </div>
          )}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <p aria-live="polite" className={heading + ' text-base sm:text-lg'}>{current.title}</p>
          {virtualTour}
        </div>
      </div>
    </div>
  )
}

export function WatchVideo({src, label, poster, external = false, cinemaLayout = false, glassActions = cinemaLayout}: {src: string; label: string; poster?: string; external?: boolean; cinemaLayout?: boolean; glassActions?: boolean}) {
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const embedSrc = external ? parseEmbedVideo(src) : null
  const isDirectVideo = !external || directVideoPattern.test(src)
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
          : <PropertyVideoPlayer className="relative aspect-video max-h-[78dvh] w-full shadow-2xl" autoplay src={src} poster={poster} label={label} />)}
      </div>
    </dialog>
  </>
}

export function FaqAccordion({entries}: {entries: {_key: string; question: string; answer: string}[]}) {
  const baseId = useId()
  const [openKeys, setOpenKeys] = useState<Record<string, boolean>>({})

  function toggle(key: string) {
    setOpenKeys((prev) => ({...prev, [key]: !prev[key]}))
  }

  return (
    <div className="divide-y divide-zinc-300/75 border-y border-zinc-300/75">
      {entries.map(({_key, question, answer}, index) => {
        const isOpen = !!openKeys[_key]
        const buttonId = `${baseId}-btn-${_key}`
        const panelId = `${baseId}-panel-${_key}`
        return (
          <div
            key={_key}
            data-open={isOpen}
            className="group/faq transition-colors duration-300 data-[open=true]:bg-white/65"
          >
            <h3 className="m-0">
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(_key)}
                className="flex w-full cursor-pointer items-center justify-between gap-4 px-3 py-5 text-start focus-visible:outline-offset-[-2px] sm:px-5"
              >
                <span className="flex min-w-0 items-baseline gap-3.5 sm:gap-4">
                  <span aria-hidden="true" className="text-xs font-bold tracking-widest text-piramide/75 tabular-nums">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="text-base leading-snug font-semibold tracking-tight text-zinc-900 transition-colors duration-200 group-hover/faq:text-piramide sm:text-[1.0625rem]">
                    {question}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="relative grid size-9 shrink-0 place-items-center border border-zinc-300/90 bg-white/75 text-zinc-800 transition-all duration-300 group-hover/faq:border-piramide group-hover/faq:text-piramide group-data-[open=true]/faq:border-piramide group-data-[open=true]/faq:bg-piramide group-data-[open=true]/faq:text-white"
                >
                  <span className="h-[1.5px] w-3.5 bg-current" />
                  <span className={'absolute h-[1.5px] w-3.5 bg-current transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ' + (isOpen ? 'rotate-0' : 'rotate-90')} />
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              aria-hidden={!isOpen}
              className={'grid transition-[grid-template-rows,opacity] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ' + (isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}
            >
              <div className="overflow-hidden">
                <p className="max-w-[65ch] ps-10 pe-5 pb-5 text-sm leading-[1.8] whitespace-pre-line text-zinc-600 sm:ps-13 sm:pe-14 sm:pb-6 sm:text-[0.9375rem]">
                  {answer}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}


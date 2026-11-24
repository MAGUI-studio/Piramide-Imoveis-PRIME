'use client'

import {useState, useEffect, useRef, useCallback} from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Building2,
  ChevronLeft,
  ChevronRight,
  EyeOff,
  Home,
  Info,
  Pause,
  Play,
  PlayCircle,
  RotateCcw,
  VideoOff,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import {VerticalScrollArea} from './scrollArea'
import {socialIconPaths} from './socialIconPaths'
import type {ReelItem} from '../lib/model'
import {safeExternalUrl} from '../lib/siteSettings'

interface VideoModalPlayerProps {
  reels: ReelItem[]
  selectedIdx: number | null
  onClose: () => void
  onSelectIdx: (idx: number) => void
}

export function VideoModalPlayer({
  reels,
  selectedIdx,
  onClose,
  onSelectIdx,
}: VideoModalPlayerProps) {
  const isOpen = selectedIdx !== null && selectedIdx >= 0 && selectedIdx < reels.length

  useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  if (!isOpen || selectedIdx === null) return null

  return (
    <VideoModalShell
      reels={reels}
      selectedIdx={selectedIdx}
      onClose={onClose}
      onSelectIdx={onSelectIdx}
    />
  )
}

function VideoModalShell({
  reels,
  selectedIdx,
  onClose,
  onSelectIdx,
}: {
  reels: ReelItem[]
  selectedIdx: number
  onClose: () => void
  onSelectIdx: (idx: number) => void
}) {
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [showMobileInfo, setShowMobileInfo] = useState(false)
  const [countdownRemaining, setCountdownRemaining] = useState<number | null>(null)
  const [isAutoAdvanceDisabled, setIsAutoAdvanceDisabled] = useState(false)

  const videoRef = useRef<HTMLVideoElement | null>(null)

  const currentReel = reels[selectedIdx]
  const nextIdx = (selectedIdx + 1) % reels.length
  const nextReel = reels.length > 1 ? reels[nextIdx] : null

  const handleNext = useCallback(() => {
    if (reels.length === 0) return
    const next = (selectedIdx + 1) % reels.length
    setCountdownRemaining(null)
    setIsAutoAdvanceDisabled(false)
    setIsPlaying(true)
    onSelectIdx(next)
  }, [selectedIdx, reels.length, onSelectIdx])

  const handlePrev = useCallback(() => {
    if (reels.length === 0) return
    const prev = (selectedIdx - 1 + reels.length) % reels.length
    setCountdownRemaining(null)
    setIsAutoAdvanceDisabled(false)
    setIsPlaying(true)
    onSelectIdx(prev)
  }, [selectedIdx, reels.length, onSelectIdx])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowRight') {
        handleNext()
      } else if (e.key === 'ArrowLeft') {
        handlePrev()
      } else if (e.key === ' ') {
        e.preventDefault()
        if (videoRef.current) {
          if (videoRef.current.paused) {
            void videoRef.current.play()
            setIsPlaying(true)
          } else {
            videoRef.current.pause()
            setIsPlaying(false)
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNext, handlePrev, onClose])

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    const {currentTime, duration} = videoRef.current

    if (!duration || Number.isNaN(duration) || reels.length <= 1) return

    const remaining = duration - currentTime

    if (remaining <= 10 && remaining > 0.2 && !isAutoAdvanceDisabled) {
      setCountdownRemaining(Math.ceil(remaining))
    } else {
      setCountdownRemaining(null)
    }
  }

  const handleVideoEnded = () => {
    if (!isAutoAdvanceDisabled && reels.length > 1) {
      handleNext()
    } else {
      setIsPlaying(false)
    }
  }

  const handleRestart = () => {
    if (!videoRef.current) return
    videoRef.current.currentTime = 0
    void videoRef.current.play()
    setIsPlaying(true)
    setCountdownRemaining(null)
    setIsAutoAdvanceDisabled(false)
  }

  const togglePlay = () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      void videoRef.current.play()
      setIsPlaying(true)
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !videoRef.current.muted
    setIsMuted(videoRef.current.muted)
  }

  if (!currentReel) return null

  const videoSrc = currentReel.videoFileUrl || safeExternalUrl(currentReel.videoUrl)
  const listingHref = currentReel.listingHref
  const listingLabel = currentReel.listingLabel || 'Ver Imóvel no Site'
  const instagramHref = safeExternalUrl(currentReel.instagramUrl)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={currentReel.title}
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-2 backdrop-blur-md sm:p-4 md:p-6 dark:bg-black/90"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex h-[92vh] max-h-[920px] w-full max-w-6xl flex-col overflow-hidden border border-zinc-200 bg-white shadow-2xl md:flex-row dark:border-white/15 dark:bg-zinc-950"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar player de vídeo"
          title="Fechar (Esc)"
          className="absolute top-3 right-3 z-40 flex size-10 cursor-pointer items-center justify-center rounded-full border border-zinc-200 bg-white/90 text-zinc-900 shadow-xl transition-all hover:scale-105 hover:bg-white dark:border-white/20 dark:bg-black/80 dark:text-white dark:hover:bg-black"
        >
          <X className="size-5" aria-hidden="true" />
        </button>

        <div className="relative mx-auto flex h-[55vh] w-full shrink-0 aspect-[9/16] items-center justify-center overflow-hidden bg-black md:mx-0 md:h-full md:w-auto">
          {videoSrc ? (
            <video
              ref={videoRef}
              key={currentReel._id}
              src={videoSrc}
              poster={currentReel.posterUrl || undefined}
              autoPlay
              playsInline
              muted={isMuted}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnded}
              onClick={togglePlay}
              className="size-full cursor-pointer bg-black object-cover select-none"
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center space-y-3 p-6 text-center text-zinc-400">
              <VideoOff className="size-16 text-zinc-600" aria-hidden="true" />
              <p className="text-sm font-light">Vídeo indisponível no momento.</p>
            </div>
          )}

          <div className="absolute top-3 left-3 z-30 flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
              title={isPlaying ? 'Pausar' : 'Reproduzir'}
              className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/70 text-white shadow-md transition-all hover:scale-105 hover:bg-black"
            >
              {isPlaying ? (
                <Pause className="size-4 fill-current" aria-hidden="true" />
              ) : (
                <Play className="ml-0.5 size-4 fill-current" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? 'Ativar som' : 'Desativar som'}
              title={isMuted ? 'Ativar som' : 'Desativar som'}
              className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/70 text-white shadow-md transition-all hover:scale-105 hover:bg-black"
            >
              {isMuted ? (
                <VolumeX className="size-4" aria-hidden="true" />
              ) : (
                <Volume2 className="size-4" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              onClick={handleRestart}
              aria-label="Reiniciar vídeo do início"
              title="Reiniciar vídeo do início"
              className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/70 text-white shadow-md transition-all hover:scale-105 hover:bg-black"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
            </button>
          </div>

          {countdownRemaining !== null && !isAutoAdvanceDisabled && reels.length > 1 && (
            <div className="absolute right-3 bottom-16 z-30 max-w-[270px] space-y-2 border border-piramide/40 bg-black/90 p-3 shadow-2xl backdrop-blur-md sm:right-5 sm:p-4 md:bottom-6">
              <div className="flex items-center justify-between font-mono text-xs font-bold text-white">
                <span className="flex items-center gap-1.5 text-piramide">
                  <PlayCircle className="size-4 animate-pulse" aria-hidden="true" />
                  Próximo Vídeo
                </span>
                <span className="font-bold text-piramide tabular-nums">
                  {countdownRemaining}s
                </span>
              </div>

              {nextReel && (
                <p className="line-clamp-1 text-[11px] font-light text-zinc-300">
                  {nextReel.propertyTitle || nextReel.title}
                </p>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 cursor-pointer bg-piramide px-2.5 py-1.5 font-mono text-[10px] font-bold tracking-wider text-white uppercase transition-colors hover:bg-piramide/90"
                >
                  Assistir Agora
                </button>
                <button
                  type="button"
                  onClick={() => setIsAutoAdvanceDisabled(true)}
                  title="Cancelar avanço automático"
                  className="cursor-pointer bg-white/10 px-2.5 py-1.5 font-mono text-[10px] font-bold tracking-wider text-zinc-300 uppercase transition-colors hover:bg-white/20"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <div className="pointer-events-none absolute inset-x-3 bottom-3 z-30 flex items-center justify-between md:hidden">
            <button
              type="button"
              onClick={() => setShowMobileInfo((prev) => !prev)}
              className="pointer-events-auto flex cursor-pointer items-center gap-1.5 rounded-full border border-white/20 bg-black/80 px-3.5 py-1.5 font-mono text-xs font-bold tracking-wider text-white uppercase shadow-lg backdrop-blur-md hover:bg-black"
            >
              {showMobileInfo ? (
                <EyeOff className="size-3.5 text-piramide" aria-hidden="true" />
              ) : (
                <Info className="size-3.5 text-piramide" aria-hidden="true" />
              )}
              <span>{showMobileInfo ? 'Ocultar Detalhes' : 'Mostrar Detalhes'}</span>
            </button>

            <div className="pointer-events-auto flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Vídeo anterior"
                title="Anterior"
                className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/80 text-white shadow-md"
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Próximo vídeo"
                title="Próximo"
                className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/80 text-white shadow-md"
              >
                <ChevronRight className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <div
          className={`min-h-0 flex-1 flex-col border-t border-zinc-200 bg-white text-espresso transition-all duration-300 md:border-t-0 md:border-l dark:border-white/10 dark:bg-zinc-950 dark:text-white ${
            showMobileInfo ? 'flex max-h-[50vh] md:max-h-none' : 'hidden md:flex'
          }`}
        >
          <VerticalScrollArea className="h-full">
            <div className="flex min-h-full flex-col justify-between space-y-6 p-6 md:p-8 lg:p-10">
              <div key={currentReel._id} className="space-y-4">
                {currentReel.propertyTitle && (
                  <div className="inline-flex items-center gap-1.5 border border-zinc-200 bg-zinc-100 px-3 py-1 font-mono text-xs font-bold tracking-widest text-espresso uppercase backdrop-blur-md dark:border-white/15 dark:bg-white/10 dark:text-white">
                    <Building2 className="size-3.5 text-piramide" aria-hidden="true" />
                    <span>{currentReel.propertyTitle}</span>
                  </div>
                )}

                <h3 className="text-xl leading-snug font-black tracking-tight text-espresso uppercase sm:text-2xl lg:text-3xl dark:text-white">
                  {currentReel.title}
                </h3>

                {currentReel.description && (
                  <p className="text-sm leading-relaxed font-light whitespace-pre-line text-zinc-600 sm:text-base dark:text-zinc-300">
                    {currentReel.description}
                  </p>
                )}
              </div>

              <div className="mt-auto space-y-3 border-t border-zinc-200 pt-6 dark:border-white/10">
                {listingHref &&
                  (currentReel.listingIsInternal ? (
                    <Link
                      href={listingHref}
                      onClick={onClose}
                      className="flex w-full cursor-pointer items-center justify-center gap-2.5 bg-piramide px-6 py-4 font-mono text-xs font-bold tracking-wider text-white uppercase shadow-lg transition-all hover:bg-piramide/90 sm:text-sm"
                    >
                      <Home className="size-4 sm:size-5" aria-hidden="true" />
                      <span>{listingLabel}</span>
                      <ArrowUpRight className="ml-auto size-4" aria-hidden="true" />
                    </Link>
                  ) : (
                    <a
                      href={listingHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full cursor-pointer items-center justify-center gap-2.5 bg-piramide px-6 py-4 font-mono text-xs font-bold tracking-wider text-white uppercase shadow-lg transition-all hover:bg-piramide/90 sm:text-sm"
                    >
                      <Home className="size-4 sm:size-5" aria-hidden="true" />
                      <span>{listingLabel}</span>
                      <ArrowUpRight className="ml-auto size-4" aria-hidden="true" />
                    </a>
                  ))}

                {instagramHref && (
                  <a
                    href={instagramHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full cursor-pointer items-center justify-center gap-2.5 border border-zinc-200 bg-zinc-100 px-6 py-3.5 font-mono text-xs font-bold tracking-wider text-zinc-800 uppercase transition-all hover:bg-zinc-200 sm:text-sm dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 256 256"
                      fill="currentColor"
                      className="size-4 text-pink-500 sm:size-5 dark:text-pink-400"
                    >
                      <path d={socialIconPaths.instagram} />
                    </svg>
                    <span>Ver Post no Instagram</span>
                    <ArrowUpRight className="ml-auto size-4" aria-hidden="true" />
                  </a>
                )}

                {reels.length > 1 && (
                  <div className="hidden items-center justify-between pt-4 font-mono text-xs text-zinc-500 md:flex dark:text-zinc-400">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="inline-flex cursor-pointer items-center gap-1.5 transition-colors hover:text-espresso dark:hover:text-white"
                    >
                      <ArrowLeft className="size-3.5" aria-hidden="true" />
                      <span>Vídeo Anterior</span>
                    </button>
                    <span className="font-bold text-espresso dark:text-white">
                      {selectedIdx + 1} de {reels.length}
                    </span>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="inline-flex cursor-pointer items-center gap-1.5 transition-colors hover:text-espresso dark:hover:text-white"
                    >
                      <span>Próximo Vídeo</span>
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </VerticalScrollArea>
        </div>
      </div>
    </div>
  )
}

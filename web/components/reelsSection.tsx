'use client'

import {useRef, useEffect, useMemo, useCallback, useState} from 'react'
import Link from 'next/link'
import {useSearchParams} from 'next/navigation'
import {ArrowRight, Building2, Play, Video} from 'lucide-react'
import {VideoModalPlayer} from './videoModalPlayer'
import {wrap} from '../lib/classes'
import {slugifyText, type ReelItem} from '../lib/model'

interface ReelsSectionProps {
  reels: ReelItem[]
}

export function ReelsSection({reels = []}: ReelsSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const isDraggingRef = useRef(false)
  const startXRef = useRef(0)
  const startScrollLeftRef = useRef(0)
  const totalDragDistanceRef = useRef(0)
  const searchParams = useSearchParams()

  const displayReels = useMemo(() => reels.slice(0, 5), [reels])
  const [videoParam, setVideoParamState] = useState(() => searchParams.get('video') || '')

  useEffect(() => {
    setVideoParamState(searchParams.get('video') || '')
  }, [searchParams])

  const setVideoParam = useCallback((slug: string | null) => {
    const next = slug || ''
    setVideoParamState(next)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      if (next) url.searchParams.set('video', next)
      else url.searchParams.delete('video')
      window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash)
    }
  }, [])

  const selectedIdx = useMemo(() => {
    if (!videoParam || displayReels.length === 0) return null
    const cleanParam = videoParam.toLowerCase().trim()
    const matchIndex = displayReels.findIndex((r) => {
      const titleSlug = slugifyText(r.title)
      return titleSlug === cleanParam || r.title.toLowerCase().includes(cleanParam)
    })
    return matchIndex !== -1 ? matchIndex : null
  }, [videoParam, displayReels])

  const handleCardClick = (originalIndex: number) => {
    if (totalDragDistanceRef.current > 10) return
    const targetReel = displayReels[originalIndex]
    if (targetReel) {
      setVideoParam(slugifyText(targetReel.title) || null)
    }
  }

  const handleClose = useCallback(() => {
    setVideoParam(null)
  }, [setVideoParam])

  const handleSelectIdx = useCallback(
    (idx: number) => {
      const targetReel = displayReels[idx]
      if (targetReel) {
        setVideoParam(slugifyText(targetReel.title) || null)
      }
    },
    [displayReels, setVideoParam],
  )

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }
    let animationFrameId: number
    const speed = 0.7

    const loop = () => {
      const container = scrollContainerRef.current
      if (container && !isDraggingRef.current) {
        container.scrollLeft += speed
        const halfWidth = container.scrollWidth / 2
        if (halfWidth > 0 && container.scrollLeft >= halfWidth) {
          container.scrollLeft -= halfWidth
        }
      }
      animationFrameId = requestAnimationFrame(loop)
    }

    animationFrameId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animationFrameId)
  }, [])

  if (!displayReels || displayReels.length === 0) return null

  const infiniteReels = [...displayReels, ...displayReels, ...displayReels, ...displayReels]

  const handleMouseDown = (e: React.MouseEvent) => {
    const container = scrollContainerRef.current
    if (!container) return
    isDraggingRef.current = true
    startXRef.current = e.pageX - container.offsetLeft
    startScrollLeftRef.current = container.scrollLeft
    totalDragDistanceRef.current = 0
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return
    const container = scrollContainerRef.current
    if (!container) return
    e.preventDefault()
    const x = e.pageX - container.offsetLeft
    const walk = (x - startXRef.current) * 1.3
    totalDragDistanceRef.current += Math.abs(walk)
    container.scrollLeft = startScrollLeftRef.current - walk

    const halfWidth = container.scrollWidth / 2
    if (halfWidth > 0) {
      if (container.scrollLeft >= halfWidth) {
        container.scrollLeft -= halfWidth
        startScrollLeftRef.current -= halfWidth
      } else if (container.scrollLeft <= 0) {
        container.scrollLeft += halfWidth
        startScrollLeftRef.current += halfWidth
      }
    }
  }

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    const container = scrollContainerRef.current
    if (!container) return
    isDraggingRef.current = true
    startXRef.current = e.touches[0].pageX - container.offsetLeft
    startScrollLeftRef.current = container.scrollLeft
    totalDragDistanceRef.current = 0
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return
    const container = scrollContainerRef.current
    if (!container) return
    const x = e.touches[0].pageX - container.offsetLeft
    const walk = (x - startXRef.current) * 1.3
    totalDragDistanceRef.current += Math.abs(walk)
    container.scrollLeft = startScrollLeftRef.current - walk

    const halfWidth = container.scrollWidth / 2
    if (halfWidth > 0) {
      if (container.scrollLeft >= halfWidth) {
        container.scrollLeft -= halfWidth
        startScrollLeftRef.current -= halfWidth
      } else if (container.scrollLeft <= 0) {
        container.scrollLeft += halfWidth
        startScrollLeftRef.current += halfWidth
      }
    }
  }

  const handleTouchEnd = () => {
    isDraggingRef.current = false
  }

  return (
    <section
      id="videos-e-bastidores"
      aria-labelledby="titulo-videos-exclusivos"
      className="relative w-full space-y-6 overflow-hidden py-12 sm:py-16"
    >
      <div className={wrap}>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="space-y-1">
            <span className="flex items-center gap-1.5 font-mono text-xs font-bold tracking-widest text-piramide uppercase">
              <Video className="size-3.5 fill-current" aria-hidden="true" />
              <span>Vídeos &amp; Bastidores</span>
            </span>
            <h2
              id="titulo-videos-exclusivos"
              className="text-2xl font-black tracking-tight text-espresso uppercase sm:text-3xl lg:text-4xl"
            >
              Tours &amp; Vídeos Exclusivos
            </h2>
          </div>

          <Link
            href="/videos"
            className="group/action flex shrink-0 items-center gap-1.5 font-mono text-xs font-bold tracking-wider text-piramide uppercase transition-colors hover:underline"
          >
            <span>Ver todos os vídeos</span>
            <ArrowRight
              className="size-3.5 transition-transform duration-300 ease-out group-hover/action:translate-x-1.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="flex w-full cursor-grab items-center overflow-hidden py-2 select-none active:cursor-grabbing"
      >
        <div className="flex w-max shrink-0 items-center gap-4 sm:gap-6">
          {infiniteReels.map((reel, idx) => {
            const originalIndex = idx % displayReels.length

            return (
              <div
                key={`${reel._id}-${idx}`}
                role="button"
                tabIndex={idx < displayReels.length ? 0 : -1}
                aria-label={`Assistir vídeo: ${reel.title}`}
                onClick={() => handleCardClick(originalIndex)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleCardClick(originalIndex)
                  }
                }}
                className="group/card relative w-[240px] shrink-0 cursor-pointer overflow-hidden bg-zinc-900 shadow-none aspect-[9/16] sm:w-[280px] md:w-[320px] lg:w-[360px] xl:w-[380px]"
              >
                {reel.thumbnailUrl ? (
                  <img
                    src={reel.thumbnailUrl}
                    alt={reel.title}
                    loading="lazy"
                    decoding="async"
                    className="pointer-events-none size-full object-cover object-center transition-transform duration-700 select-none group-hover/card:scale-105"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-zinc-800 text-zinc-600">
                    <Video className="size-10" aria-hidden="true" />
                  </div>
                )}

                <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent" />

                <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                  <div className="flex size-12 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white shadow-xl backdrop-blur-md transition-all duration-300 group-hover/card:scale-115 group-hover/card:border-white/40 group-hover/card:bg-black/60 sm:size-14">
                    <Play className="ml-0.5 size-5 fill-current text-white sm:size-6" aria-hidden="true" />
                  </div>
                </div>

                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 space-y-2 p-4 sm:p-5">
                  {reel.propertyTitle && (
                    <div className="inline-flex max-w-full items-center gap-1.5 rounded-none border-none bg-black/50 px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest text-white uppercase shadow-xs backdrop-blur-md">
                      <Building2 className="size-3 shrink-0 text-white" aria-hidden="true" />
                      <span className="truncate">{reel.propertyTitle}</span>
                    </div>
                  )}
                  <h3 className="line-clamp-2 text-sm leading-tight font-black text-white uppercase sm:text-base">
                    {reel.title}
                  </h3>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <VideoModalPlayer
        reels={displayReels}
        selectedIdx={selectedIdx}
        onClose={handleClose}
        onSelectIdx={handleSelectIdx}
      />
    </section>
  )
}

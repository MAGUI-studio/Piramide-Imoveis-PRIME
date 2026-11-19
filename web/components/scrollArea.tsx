'use client'

import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area'
import {useEffect, useRef, useState, type ReactNode} from 'react'
import {CinemaIcon} from './cinemaIcon'
import {glassControl} from '../lib/classes'

const arrow = glassControl + ' w-11 shrink-0'

export function ScrollArea({children, actions}: {children: ReactNode; actions: ReactNode}) {
  const viewport = useRef<HTMLDivElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({offset: 0, max: 0})

  useEffect(() => {
    const node = viewport.current
    if (!node) return
    const update = () => {
      const offset = node.scrollLeft
      const max = node.scrollWidth - node.clientWidth
      setPosition({offset, max})
    }
    const observer = new ResizeObserver(update)
    observer.observe(node)
    if (content.current) observer.observe(content.current)
    node.addEventListener('scroll', update, {passive: true})
    update()
    return () => {
      node.removeEventListener('scroll', update)
      observer.disconnect()
    }
  }, [])

  function move(direction: number) {
    const node = viewport.current
    if (!node) return
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
    node.scrollBy({left: node.clientWidth * .75 * direction, behavior})
  }

  return (
    <ScrollAreaPrimitive.Root>
      <ScrollAreaPrimitive.Viewport ref={viewport} className="@container w-full snap-x snap-mandatory [touch-action:pan-y_pinch-zoom]">
        <div ref={content}>{children}</div>
      </ScrollAreaPrimitive.Viewport>
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
        {actions}
        {position.max > 1 && (
          <div className="ms-auto flex gap-2" role="group" aria-label="Navegação da galeria">
            <button type="button" className={arrow} disabled={position.offset <= 1} onClick={() => move(-1)} aria-label="Rolar para as fotos anteriores">
              <CinemaIcon name="arrow" className="rotate-180" />
            </button>
            <button type="button" className={arrow} disabled={position.offset >= position.max - 1} onClick={() => move(1)} aria-label="Rolar para as próximas fotos">
              <CinemaIcon name="arrow" />
            </button>
          </div>
        )}
      </div>
    </ScrollAreaPrimitive.Root>
  )
}

export function VerticalScrollArea({children, className = ''}: {children: ReactNode; className?: string}) {
  return (
    <ScrollAreaPrimitive.Root className="relative overflow-hidden">
      <ScrollAreaPrimitive.Viewport className={'w-full ' + className}>
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollAreaPrimitive.Scrollbar
        orientation="vertical"
        className="flex w-2 touch-none select-none p-0.5 transition-colors"
      >
        <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-piramide/45 transition-colors hover:bg-piramide/75" />
      </ScrollAreaPrimitive.Scrollbar>
    </ScrollAreaPrimitive.Root>
  )
}

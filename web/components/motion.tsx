'use client'

import {useEffect, type ReactNode, useRef, useState} from 'react'

const numberFormatter = new Intl.NumberFormat('pt-BR')
export const riseIn = 'opacity-0 motion-reduce:opacity-100 group-data-[entered=true]:animate-rise motion-reduce:animate-none'

export function Words({text, className = '', start = 0, step = 70}: {text: string; className?: string; start?: number; step?: number}) {
  return (
    <span className={className}>
      {text.split(' ').map((word, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
          <span className={'inline-block ' + riseIn} style={{animationDelay: start + i * step + 'ms'}}>{word}&nbsp;</span>
        </span>
      ))}
    </span>
  )
}

export function Reveal({children, className, id}: {children: ReactNode; className?: string; id?: string}) {
  const element = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const node = element.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        node.dataset.entered = 'true'
        observer.disconnect()
      }
    }, {threshold: 0.07})
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return <div ref={element} className={className} id={id}>{children}</div>
}

export function CountUp({value, duration = 2000}: {value: number; duration?: number}) {
  const spanRef = useRef<HTMLSpanElement>(null)
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const node = spanRef.current
    if (!node) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCurrent(value)
      return
    }
    let frameId = 0
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      const start = performance.now()
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / duration)
        const eased = 1 - Math.pow(1 - progress, 4)
        setCurrent(Math.round(eased * value))
        if (progress < 1) frameId = requestAnimationFrame(tick)
      }
      frameId = requestAnimationFrame(tick)
    }, {threshold: 0.25})
    observer.observe(node)
    return () => {
      observer.disconnect()
      if (frameId) cancelAnimationFrame(frameId)
    }
  }, [value, duration])

  return <span ref={spanRef}>{numberFormatter.format(current)}</span>
}


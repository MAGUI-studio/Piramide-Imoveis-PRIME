'use client'

import {useEffect, type ReactNode, useRef} from 'react'

export function Reveal({children, className}: {children: ReactNode; className?: string}) {
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
  return <div ref={element} className={className}>{children}</div>
}

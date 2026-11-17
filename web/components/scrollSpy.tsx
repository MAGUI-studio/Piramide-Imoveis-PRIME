'use client'

import {useEffect} from 'react'

export function ScrollSpy({containerId, finalSectionId}: {containerId: string; finalSectionId?: string}) {
  useEffect(() => {
    const container = document.getElementById(containerId)
    if (!container) return
    const pathname = window.location.pathname
    let timer: number | undefined

    function syncHash() {
      if (!container || window.location.pathname !== pathname) return
      const sections = Array.from(container.querySelectorAll<HTMLElement>(':scope > [id]'))
      const finalSection = finalSectionId ? document.getElementById(finalSectionId) : null
      if (finalSection) sections.push(finalSection)
      const readingLine = Math.min(96, window.innerHeight * 0.2)
      let active = sections[0]
      for (const section of sections) {
        if (section.getBoundingClientRect().top > readingLine) break
        active = section
      }

      const url = new URL(window.location.href)
      if (!active || url.hash === '#' + active.id) return
      url.hash = active.id
      window.history.replaceState(window.history.state, '', url)
    }

    function schedule() {
      window.clearTimeout(timer)
      timer = window.setTimeout(syncHash, 120)
    }

    if (!window.location.hash) schedule()
    window.addEventListener('scroll', schedule, {passive: true})
    window.addEventListener('resize', schedule)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [containerId, finalSectionId])

  return null
}

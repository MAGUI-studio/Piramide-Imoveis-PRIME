'use client'

import {useEffect} from 'react'

export function ScrollSpy({containerId, finalSectionIds}: {containerId: string; finalSectionIds: string[]}) {
  useEffect(() => {
    const container = document.getElementById(containerId)
    if (!container) return
    const pathname = window.location.pathname
    let frame: number | undefined

    function syncHash() {
      if (!container || window.location.pathname !== pathname) return
      const sections = Array.from(container.querySelectorAll<HTMLElement>(':scope > [id]'))
      for (const id of finalSectionIds) {
        const section = document.getElementById(id)
        if (section) sections.push(section)
      }
      const readingLine = Math.min(96, window.innerHeight * 0.2)
      let active = sections[0]
      for (const section of sections) {
        if (section.getBoundingClientRect().top > readingLine) break
        active = section
      }

      const url = new URL(window.location.href)
      const nextHash = !active || active === sections[0] ? '' : '#' + active.id
      if (url.hash === nextHash) return
      url.hash = nextHash
      window.history.replaceState(window.history.state, '', url)
    }

    function schedule() {
      if (frame !== undefined) return
      frame = window.requestAnimationFrame(() => {
        frame = undefined
        syncHash()
      })
    }

    window.addEventListener('scroll', schedule, {passive: true})
    window.addEventListener('resize', schedule)
    return () => {
      if (frame !== undefined) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [containerId, finalSectionIds])

  return null
}

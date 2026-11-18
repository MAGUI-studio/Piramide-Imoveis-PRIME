'use client'

import {useEffect, useRef, useState} from 'react'
import type {Map as LeafletMap} from 'leaflet'
import 'leaflet/dist/leaflet.css'

type Props = {lat: number; lng: number; title: string; approximate: boolean}

export function PropertyMap({lat, lng, title, approximate}: Props) {
  const container = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    const element = container.current
    if (!element) return
    let disposed = false
    let map: LeafletMap | undefined
    let resize: ResizeObserver | undefined

    async function initialize() {
      setStatus('loading')
      try {
        const L = await import('leaflet')
        if (disposed || !element) return
        map = L.map(element, {scrollWheelZoom: false, attributionControl: false, zoomControl: false})
          .setView([lat, lng], approximate ? 15 : 17)
        L.control.zoom({position: 'topright', zoomInTitle: 'Aproximar', zoomOutTitle: 'Afastar'}).addTo(map)
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 19})
          .on('tileload', () => setStatus('ready'))
          .on('tileerror', () => setStatus((current) => current === 'ready' ? current : 'error'))
          .addTo(map)
        L.marker([lat, lng], {
          title,
          alt: title,
          icon: L.divIcon({
            className: 'prime-map-marker',
            html: '<span aria-hidden="true"></span>',
            iconSize: [38, 38],
            iconAnchor: [19, 19],
            popupAnchor: [0, -14],
          }),
        }).addTo(map).bindPopup(Object.assign(document.createElement('span'), {
          textContent: approximate ? 'Localização aproximada de ' + title : title,
        }))
        resize = new ResizeObserver(() => map?.invalidateSize({pan: false}))
        resize.observe(element)
      } catch {
        if (!disposed) setStatus('error')
      }
    }

    const visibility = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      visibility.disconnect()
      void initialize()
    }, {rootMargin: '200px'})
    visibility.observe(element)
    return () => {
      disposed = true
      visibility.disconnect()
      resize?.disconnect()
      map?.remove()
    }
  }, [lat, lng, title, approximate])

  return (
    <div className="prime-map relative isolate h-full w-full overflow-hidden bg-[#eeece7]">
      <div ref={container} className="absolute inset-0" aria-label={'Mapa de ' + title} role="region" />
      {status !== 'ready' && (
        <p role="status" className="pointer-events-none absolute inset-0 z-500 grid place-items-center px-16 text-center text-sm font-medium text-zinc-700">
          {status === 'error' ? 'Mapa indisponível. Use o link para abrir a localização.' : 'Carregando mapa…'}
        </p>
      )}
      <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer"
        className="absolute end-0 bottom-0 z-500 bg-coal/90 px-2 py-0.5 text-[11px] text-zinc-200 underline-offset-2 hover:underline">
        © OpenStreetMap contributors
      </a>
    </div>
  )
}

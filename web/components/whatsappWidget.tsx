'use client'

import {useEffect, useRef, useState} from 'react'
import {ArrowUpRight, Building2, X} from 'lucide-react'
import {locationOf, whatsappLink, type PropertyCard} from '../lib/model'

type WidgetProperty = Pick<PropertyCard, 'id' | 'title' | 'propertyType' | 'city' | 'neighborhood'>

export function WhatsAppWidget({
  phone,
  properties = [],
}: {
  phone: string | null
  properties?: WidgetProperty[]
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current)
    }
  }, [])

  const handleMouseEnter = () => {
    if (
      typeof window !== 'undefined' &&
      !window.matchMedia('(hover: hover) and (pointer: fine)').matches
    ) {
      return
    }
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current)
      leaveTimerRef.current = null
    }
    setIsOpen(true)
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current)
    leaveTimerRef.current = setTimeout(() => {
      setIsOpen(false)
      setIsHovered(false)
    }, 150)
  }

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: PointerEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-whatsapp-widget]')) {
        setIsOpen(false)
        setIsHovered(false)
      }
    }
    document.addEventListener('pointerdown', handleClickOutside)
    return () => document.removeEventListener('pointerdown', handleClickOutside)
  }, [isOpen])

  const buildUrl = (propertyTitle?: string) => {
    return (
      whatsappLink(phone, propertyTitle) ||
      'https://wa.me/?text=' +
        encodeURIComponent(
          propertyTitle
            ? 'Olá! Gostaria de saber mais sobre o empreendimento ' + propertyTitle + '.'
            : 'Olá! Gostaria de conversar sobre os empreendimentos da Pirâmide PRIME.',
        )
    )
  }

  const handleSelectOption = (propertyTitle?: string) => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current)
    window.open(buildUrl(propertyTitle), '_blank', 'noopener,noreferrer')
    setIsOpen(false)
    setIsHovered(false)
  }

  const handleButtonClick = () => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current)
    if (!properties.length) {
      handleSelectOption()
      return
    }
    setIsOpen((prev) => !prev)
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40">
      <div className="mx-auto flex w-full max-w-[110rem] justify-end px-5 sm:px-9 lg:px-14">
        <div
          data-whatsapp-widget
          className="pointer-events-auto relative size-14 sm:size-15"
        >
          {isOpen && properties.length > 0 && (
            <div
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className=" absolute right-0 bottom-full mb-3 w-72 origin-bottom-right rounded-2xl border border-zinc-800 bg-zinc-900/95 p-3 shadow-xl backdrop-blur-xl sm:w-80 motion-safe:animate-enter"
            >
              <div className="mb-2 flex items-center justify-between border-b border-zinc-800 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
                      Atendimento Online
                    </p>
                    <p className="text-xs font-extrabold text-white">
                      Fale com um Especialista
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current)
                    setIsOpen(false)
                    setIsHovered(false)
                  }}
                  className="cursor-pointer rounded-lg p-1 text-zinc-400 transition-colors hover:text-zinc-200"
                  aria-label="Fechar atendimento"
                >
                  <X size={14} strokeWidth={2.5} />
                </button>
              </div>

              <div className="space-y-1">
                {properties.slice(0, 4).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectOption(item.title)}
                    className="group/item flex w-full cursor-pointer items-center justify-between rounded-xl p-2.5 text-left transition-all hover:bg-zinc-800/80"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="shrink-0 rounded-lg bg-piramide/15 p-2 text-piramide">
                        <Building2 size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="block truncate text-xs font-bold text-white">
                            {item.title}
                          </span>
                          {item.propertyType && (
                            <span className="border border-piramide/30 bg-piramide/15 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-ivory uppercase">
                              {item.propertyType}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-[11px] leading-tight text-zinc-400">
                          {locationOf(item)}
                        </p>
                      </div>
                    </div>

                    <ArrowUpRight
                      size={14}
                      className="ml-1.5 shrink-0 text-zinc-400 transition-transform group-hover/item:translate-x-0.5 group-hover/item:-translate-y-0.5 group-hover/item:text-piramide"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleButtonClick}
            aria-label="Conversar pelo WhatsApp"
            className={
              'relative flex size-14 cursor-pointer select-none items-center justify-center bg-transparent p-0.5 drop-shadow-xl transition-transform duration-300 active:scale-95 sm:size-15 ' +
              (isHovered || isOpen ? 'scale-108' : 'motion-safe:animate-[whatsapp-pulse_2.2s_ease-in-out_infinite]')
            }
          >
            <img
              src="/utils/icons/whatsapp.svg"
              alt="WhatsApp Pirâmide Imóveis"
              width={60}
              height={60}
              className="size-full object-contain"
            />
          </button>
        </div>
      </div>
    </div>
  )
}

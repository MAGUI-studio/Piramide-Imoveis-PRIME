'use client'

import {useEffect, useRef, useState} from 'react'
import {ArrowUpRight, MessageCircle, X} from 'lucide-react'
import {whatsappLink} from '../lib/model'

export function WhatsAppWidget({phone}: {phone: string | null}) {
  const href = whatsappLink(phone) ||
    'https://wa.me/?text=' +
      encodeURIComponent('Olá! Gostaria de conversar sobre os empreendimentos da Pirâmide Imóveis Prime.')

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

  const handleButtonClick = () => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current)
    setIsOpen((prev) => !prev)
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40">
      <div className="mx-auto flex w-full max-w-[110rem] justify-end px-5 sm:px-9 lg:px-14">
        <div
          data-whatsapp-widget
          className="pointer-events-auto relative size-14 sm:size-15"
        >
          {isOpen && (
            <div
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="absolute right-0 bottom-full mb-3 w-72 origin-bottom-right rounded-2xl border border-zinc-800 bg-zinc-900/95 p-3 shadow-xl backdrop-blur-xl sm:w-80 motion-safe:animate-enter"
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

              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                onClick={() => {
                  setIsOpen(false)
                  setIsHovered(false)
                }}
                className="group flex w-full items-center gap-3 rounded-xl p-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800/80 hover:text-piramide"
              >
                <span className="rounded-lg bg-piramide/15 p-2 text-piramide">
                  <MessageCircle aria-hidden="true" size={18} />
                </span>
                Fale com um Especialista
                <ArrowUpRight aria-hidden="true" size={16} className="ml-auto text-zinc-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-piramide" />
              </a>
            </div>
          )}

          <button
            type="button"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleButtonClick}
            aria-label="Atendimento pelo WhatsApp"
            aria-expanded={isOpen}
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

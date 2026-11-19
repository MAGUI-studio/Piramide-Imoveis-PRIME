'use client'

import {useEffect, useId, useRef, useState} from 'react'
import {ArrowUpRight, MessageCircle, X} from 'lucide-react'
import {wrap} from '../lib/classes'
import {whatsappLink} from '../lib/model'

export function WhatsAppWidget({phone}: {phone: string | null}) {
  const href = whatsappLink(phone)
  const panelId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)

  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

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
    setIsOpen((prev) => !prev)
  }

  if (!href) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40">
      <div className={wrap + ' flex justify-end'}>
        <div
          onKeyDown={(event) => {
            if (event.key !== 'Escape' || !isOpen) return
            event.preventDefault()
            event.stopPropagation()
            setIsOpen(false)
            setIsHovered(false)
            triggerRef.current?.focus()
          }}
          data-whatsapp-widget
          className="pointer-events-auto relative size-16 sm:size-20"
        >
          {isOpen && (
            <div
              id={panelId}
              role="region"
              aria-label="Atendimento pelo WhatsApp"
              className="absolute right-0 bottom-full mb-3 w-72 max-w-[calc(100vw-2rem)] origin-bottom-right rounded-none border border-zinc-200 bg-white/95 p-3 text-ink shadow-xl backdrop-blur-xl sm:w-80 motion-safe:animate-enter dark:border-white/10 dark:bg-[#181818]/95 dark:text-zinc-100"
            >
              <div className="mb-2 flex items-center justify-between border-b border-zinc-200 px-3 py-2 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full motion-safe:animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold tracking-wider text-earth uppercase">
                      Atendimento Online
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsOpen(false)
                    setIsHovered(false)
                  }}
                  className="grid size-11 cursor-pointer place-items-center rounded-none text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
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
                className="group flex w-full items-center gap-3 rounded-none p-2.5 text-sm font-semibold text-ink transition-colors hover:bg-piramide/5 hover:text-piramide dark:text-zinc-100 dark:hover:bg-piramide/15"
              >
                <span className="rounded-none bg-piramide/15 p-2 text-piramide">
                  <MessageCircle aria-hidden="true" size={18} />
                </span>
                Fale com um Especialista
                <ArrowUpRight aria-hidden="true" size={16} className="ml-auto text-zinc-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-piramide" />
              </a>
            </div>
          )}

          <button
            type="button"
            ref={triggerRef}
            aria-controls={isOpen ? panelId : undefined}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleButtonClick}
            aria-label="Atendimento pelo WhatsApp"
            aria-expanded={isOpen}
            className={
              'relative flex size-16 cursor-pointer select-none items-center justify-center bg-transparent p-0.5 drop-shadow-xl transition-transform duration-300 active:scale-95 sm:size-20 ' +
              (isHovered || isOpen ? 'scale-108' : 'motion-safe:animate-[whatsapp-pulse_2.2s_ease-in-out_infinite]')
            }
          >
            <img
              src="/utils/icons/whatsapp.svg"
              alt="WhatsApp Pirâmide Imóveis"
              width={80}
              height={80}
              className="size-full object-contain"
            />
          </button>
        </div>
      </div>
    </div>
  )
}

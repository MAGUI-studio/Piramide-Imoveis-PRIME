'use client'

import {useEffect, useId, useRef, useState} from 'react'
import {Check, ChevronDown, MapPin, Search} from 'lucide-react'
import {glassField} from '../lib/classes'
import {VerticalScrollArea} from './scrollArea'

const normalize = (text: string) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('pt-BR')

type SelectOption = {value: string; label: string}

export function MultiSelect({
  label,
  placeholder,
  icon: Icon,
  values,
  options,
  onChange,
}: {
  label: string
  placeholder: string
  icon: typeof MapPin
  values: string[]
  options: SelectOption[]
  onChange: (values: string[]) => void
}) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const container = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const selected = options.filter(({value}) => values.includes(value))
  const term = normalize(search).trim()
  const matching = options.filter((option) => normalize(option.label).includes(term))

  function close() {
    setOpen(false)
    setSearch('')
  }

  useEffect(() => {
    if (!open) return
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) input.current?.focus()
    function closeOutside(event: PointerEvent) {
      if (!container.current?.contains(event.target as Node)) close()
    }
    document.addEventListener('pointerdown', closeOutside)
    return () => document.removeEventListener('pointerdown', closeOutside)
  }, [open])

  return (
    <div
      ref={container}
      className="relative min-w-0"
      onBlur={(event) => {
        if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) close()
      }}
      onKeyDown={(event) => {
        if (!open || event.key !== 'Escape') return
        event.preventDefault()
        event.stopPropagation()
        close()
        trigger.current?.focus()
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => open ? close() : setOpen(true)}
        className={glassField + ' w-full cursor-pointer text-left aria-expanded:border-piramide/70 aria-expanded:ring-1 aria-expanded:ring-piramide/25'}
      >
        <Icon aria-hidden="true" size={17} strokeWidth={1.6} className="shrink-0 text-piramide" />
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-semibold tracking-wider text-earth uppercase">{label}</span>
          <span className="mt-0.5 block truncate text-sm font-medium text-espresso">{selected[0]?.label || placeholder}</span>
        </span>
        {selected.length > 1 && <span className="shrink-0 bg-piramide/10 px-1.5 py-0.5 text-[10px] font-bold text-piramide">+{selected.length - 1}</span>}
        <ChevronDown aria-hidden="true" size={15} className={'shrink-0 text-piramide motion-safe:transition-transform ' + (open ? 'rotate-180' : '')} />
      </button>

      {open && (
        <div
          id={id}
          className="absolute inset-x-0 top-full z-30 mt-2 border border-[#1b1916]/[0.08] bg-white/75 p-2 shadow-[0_16px_40px_rgba(27,25,22,0.10),inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-xl backdrop-saturate-150 motion-safe:animate-enter dark:border-white/[0.08] dark:bg-[#0e0e12]/72 dark:shadow-[0_20px_50px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.05)]"
        >
          <label className="flex items-center gap-2 border border-[#1b1916]/[0.08] bg-[#1b1916]/[0.03] px-2.5 text-piramide transition-colors focus-within:border-piramide/70 dark:border-white/[0.08] dark:bg-white/[0.04]">
            <Search aria-hidden="true" size={16} className="shrink-0" />
            <span className="sr-only">Pesquisar opções de {label.toLowerCase()}</span>
            <input
              ref={input}
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Pesquisar opções"
              className="h-10 w-full min-w-0 bg-transparent text-sm text-espresso placeholder:text-earth focus:outline-none"
            />
          </label>

          <VerticalScrollArea className="mt-2 max-h-52 overscroll-contain pr-2.5">
            <fieldset className="min-w-0">
              <legend className="sr-only">{label}</legend>
              {matching.map(({value, label: optionLabel}) => {
                const checked = values.includes(value)
                return (
                  <label key={value} className="flex min-h-10 cursor-pointer items-center gap-2.5 px-2.5 py-2 text-sm text-espresso transition-colors hover:bg-[#1b1916]/[0.06] focus-within:bg-piramide/10 dark:hover:bg-white/[0.08]">
                    <span className="relative grid size-4 shrink-0 place-items-center">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onChange(checked ? values.filter((selection) => selection !== value) : [...values, value])}
                        className="peer size-4 appearance-none border border-espresso/30 checked:border-piramide checked:bg-piramide focus-visible:outline-piramide"
                      />
                      <Check aria-hidden="true" size={12} strokeWidth={2.5} className="pointer-events-none absolute hidden text-white peer-checked:block" />
                    </span>
                    <span className="min-w-0 break-words">{optionLabel}</span>
                  </label>
                )
              })}
              {!matching.length && <p role="status" className="px-2.5 py-3 text-xs text-earth">Nenhuma opção encontrada.</p>}
            </fieldset>
          </VerticalScrollArea>
          {!!selected.length && <div className="mt-2 flex items-center justify-between gap-2 border-t border-[#1b1916]/10 px-2.5 pt-2 text-xs dark:border-white/[0.10]">
            <span className="text-earth">{selected.length} {selected.length === 1 ? 'selecionado' : 'selecionados'}</span>
            <button type="button" className="cursor-pointer py-1 font-semibold text-piramide hover:underline" onClick={() => {
              input.current?.focus()
              onChange([])
            }}>Limpar seleção</button>
          </div>}
        </div>
      )}
    </div>
  )
}


'use client'

import {useEffect, useId, useRef, useState} from 'react'
import {Check, ChevronDown, MapPin, Search} from 'lucide-react'

const normalize = (text: string) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('pt-BR')
const filterField = 'flex min-h-15 items-center gap-3 border-b border-espresso/25 bg-transparent px-1 transition-colors hover:border-espresso/55 focus-within:border-piramide sm:px-2'

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
        className={filterField + ' w-full cursor-pointer text-left aria-expanded:border-piramide'}
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
        <div id={id} className="absolute inset-x-0 top-full z-30 mt-2 border border-espresso/15 bg-paper p-2 shadow-lg motion-safe:animate-enter">
          <label className="flex items-center gap-2 border-b border-espresso/20 px-2.5 text-piramide focus-within:border-piramide">
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

          <fieldset className="mt-2 max-h-52 min-w-0 overflow-y-auto overscroll-contain">
            <legend className="sr-only">{label}</legend>
            {matching.map(({value, label: optionLabel}) => {
              const checked = values.includes(value)
              return (
                <label key={value} className="flex min-h-10 cursor-pointer items-center gap-2.5 px-2.5 py-2 text-sm text-espresso hover:bg-espresso/5 focus-within:bg-piramide/10">
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
          {!!selected.length && <div className="mt-2 flex items-center justify-between gap-2 border-t border-espresso/10 px-2.5 pt-2 text-xs">
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


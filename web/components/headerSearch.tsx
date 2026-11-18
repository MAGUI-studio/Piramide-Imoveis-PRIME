'use client'

import {useEffect, useId, useRef, useState, type FormEvent} from 'react'
import {useRouter} from 'next/navigation'
import {ArrowUpRight, Search, X} from 'lucide-react'

export function HeaderSearch({light, hasContact}: {light: boolean; hasContact: boolean}) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const container = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const router = useRouter()

  function close(restoreFocus = false) {
    setOpen(false)
    if (restoreFocus) trigger.current?.focus({preventScroll: true})
  }

  useEffect(() => {
    if (!open) return
    input.current?.focus({preventScroll: true})
    function outside(event: PointerEvent) {
      if (!container.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', outside)
    return () => document.removeEventListener('pointerdown', outside)
  }, [open])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const query = String(new FormData(event.currentTarget).get('busca') || '').trim()
    const params = new URLSearchParams()
    if (query) params.set('busca', query)
    close()
    router.push('/empreendimentos' + (query ? '?' + params.toString() : '') + '#resultados')
  }

  return (
    <div
      ref={container}
      className="flex shrink-0 items-center gap-2 min-[400px]:gap-3 sm:gap-4"
      onBlur={(event) => {
        if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) close()
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Escape' || !open) return
        event.preventDefault()
        event.stopPropagation()
        close(true)
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-label="Pesquisar imóveis"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => setOpen((value) => !value)}
        className={'grid size-11 cursor-pointer place-items-center transition-colors motion-reduce:transition-none ' + (light
          ? 'text-ink hover:bg-piramide/10 hover:text-piramide aria-expanded:bg-piramide/10 aria-expanded:text-piramide'
          : 'text-ivory hover:bg-white/10 aria-expanded:bg-white/10')}
      >
        <Search aria-hidden="true" size={20} strokeWidth={1.6} />
      </button>
      {hasContact && <span aria-hidden="true" className={'h-11 w-px shrink-0 ' + (light ? 'bg-ink/25' : 'bg-ivory/45')} />}

      {open && (
        <div id={id} className="absolute right-0 top-full z-30 w-full max-w-md border border-zinc-200 bg-paper p-5 text-ink shadow-[0_16px_48px_#16161626] motion-safe:animate-enter sm:p-6 [color-scheme:light]">
          <div className="mb-4 flex items-center justify-between gap-4">
            <label htmlFor={id + '-input'} className="text-xs font-semibold tracking-[.12em] text-piramide uppercase">Encontre seu próximo imóvel</label>
            <button type="button" onClick={() => close(true)} aria-label="Fechar pesquisa" className="-mr-2 grid size-11 shrink-0 cursor-pointer place-items-center text-earth transition-colors hover:bg-piramide/10 hover:text-piramide motion-reduce:transition-none">
              <X aria-hidden="true" size={18} />
            </button>
          </div>
          <form action="/empreendimentos" role="search" aria-label="Pesquisar empreendimentos" onSubmit={submit}>
            <div className="flex min-h-13 items-center gap-3 border-b border-ink/30 transition-colors focus-within:border-piramide motion-reduce:transition-none">
              <Search aria-hidden="true" size={19} strokeWidth={1.6} className="shrink-0 text-piramide" />
              <input ref={input} id={id + '-input'} name="busca" type="search" maxLength={160} placeholder="O que você procura?" aria-describedby={id + '-hint'} className="min-w-0 flex-1 bg-transparent py-3 text-base text-ink placeholder:text-earth/70 focus:outline-none" />
              <button type="submit" aria-label="Buscar imóveis" className="grid size-11 shrink-0 cursor-pointer place-items-center bg-piramide text-white transition-colors hover:bg-piramide/85 motion-reduce:transition-none">
                <ArrowUpRight aria-hidden="true" size={21} />
              </button>
            </div>
            <p id={id + '-hint'} className="mt-3 text-xs leading-relaxed text-earth">Pesquise por nome, condomínio, bairro ou código.</p>
          </form>
        </div>
      )}
    </div>
  )
}

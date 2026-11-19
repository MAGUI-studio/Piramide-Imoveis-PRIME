'use client'

import Link from 'next/link'
import {usePathname, useRouter} from 'next/navigation'
import {useEffect, useRef, useState, type FormEvent} from 'react'
import {ArrowUpRight, Menu, Search, X} from 'lucide-react'
import {sweepButton, sweepContent, sweepFill, sweepOnLight, wrap} from '../lib/classes'
import {socialIconPaths} from './socialIconPaths'
import {ThemeToggle} from './themeToggle'

type SocialLink = {
  label: string
  href: string
  icon?: string
}

interface HeaderProps {
  contact?: string | null
  portalUrl?: string | null
  socialLinks?: SocialLink[]
}

const navLinks = [
  {label: 'Início', href: '/'},
  {label: 'Imóveis', href: '/empreendimentos'},
  {label: 'Condomínios', href: '/condominios'},
]

export function Header({contact = null, portalUrl = null, socialLinks = []}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)
  const lastScrollY = useRef(0)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setIsScrolled(currentScrollY > 20)

      if (currentScrollY < 60) {
        setIsVisible(true)
        lastScrollY.current = currentScrollY
        return
      }

      if (currentScrollY > lastScrollY.current + 8) {
        setIsVisible(false)
        lastScrollY.current = currentScrollY
      } else if (currentScrollY < lastScrollY.current - 8) {
        setIsVisible(true)
        lastScrollY.current = currentScrollY
      }
    }

    window.addEventListener('scroll', handleScroll, {passive: true})
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsVisible(true)
        const input = document.getElementById('header-search-input')
        if (input) input.focus()
      } else if (e.key === 'Escape' && isMobileOpen) {
        setIsMobileOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMobileOpen])

  useEffect(() => {
    if (!isMobileOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isMobileOpen])

  function handleSearchSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const query = searchQuery.trim()
    const params = new URLSearchParams()
    if (query) params.set('busca', query)
    setSearchQuery('')
    setIsMobileOpen(false)
    router.push('/empreendimentos' + (query ? '?' + params.toString() : '') + '#resultados')
  }

  const headerShown = isVisible || isMobileOpen

  return (
    <>
      <header
        onFocus={() => setIsVisible(true)}
        style={{transform: headerShown ? 'translateY(0)' : 'translateY(-100%)'}}
        className={
          'sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-[#F8F9FA] text-ink transition-[transform,box-shadow] duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:transition-none dark:border-white/10 dark:bg-[#141414] dark:text-zinc-100 ' +
          (isScrolled ? 'shadow-md' : 'shadow-2xs')
        }
      >
        <div className="w-full border-b border-zinc-200/80 bg-white py-2.5 text-[11px] text-zinc-600 transition-colors dark:border-white/10 dark:bg-[#111111] dark:text-zinc-400">
          <div className={wrap + ' flex items-center justify-between gap-4'}>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 font-bold tracking-wider text-ink uppercase dark:text-zinc-100">
                <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
                Pirâmide Prime
              </span>
              <span className="hidden text-zinc-300 sm:inline dark:text-zinc-700">•</span>
              <span className="hidden font-light text-zinc-600 sm:inline dark:text-zinc-400">
                Imóveis de Alto Padrão &amp; Curadoria Exclusiva
              </span>
            </div>

            <div className="flex items-center gap-4">
              <a
                href={portalUrl || 'https://www.piramideimoveissjc.com.br/'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 font-bold tracking-wide text-ink transition-colors hover:text-piramide dark:text-zinc-100"
              >
                <span>Ver Imóveis à Venda</span>
                <ArrowUpRight aria-hidden="true" className="size-3.5 text-piramide" />
              </a>
            </div>
          </div>
        </div>

        <div className={wrap + ' flex items-center justify-between gap-4 py-3.5 sm:gap-6 sm:py-4'}>
          <div className="flex shrink-0 items-center">
            <Link
              href="/"
              aria-label="Pirâmide Imóveis — início"
              className="flex items-center transition-opacity hover:opacity-90"
            >
              <img
                src="/logos/piramide/logo_black.svg"
                alt=""
                width={1000}
                height={512}
                className="h-12 w-auto object-contain sm:h-14 lg:h-16 dark:hidden"
              />
              <img
                src="/logos/piramide/logo_white.svg"
                alt=""
                width={1000}
                height={512}
                className="hidden h-12 w-auto object-contain sm:h-14 lg:h-16 dark:block"
              />
            </Link>
          </div>

          <nav aria-label="Navegação principal" className="hidden items-center gap-1 text-xs whitespace-nowrap xl:flex">
            {navLinks.map((item) => {
              const active = item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={
                    'rounded-xs px-3.5 py-2 font-bold tracking-wider whitespace-nowrap uppercase transition-all ' +
                    (active
                      ? 'bg-zinc-200/70 text-ink dark:bg-white/10 dark:text-white'
                      : 'text-zinc-700 hover:bg-zinc-200/60 hover:text-ink dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white')
                  }
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2.5 sm:gap-3.5">
            <form
              onSubmit={handleSearchSubmit}
              role="search"
              aria-label="Pesquisar imóveis"
              className={
                'relative hidden items-center transition-all duration-300 md:flex ' +
                (isSearchFocused ? 'w-60 lg:w-72' : 'w-44 lg:w-56')
              }
            >
              <input
                id="header-search-input"
                type="text"
                placeholder="Pesquisar imóveis..."
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-xs border border-zinc-300/80 bg-white pr-11 pl-9 text-xs text-ink shadow-2xs transition-all placeholder:text-zinc-500 focus:border-piramide focus:ring-1 focus:ring-piramide/30 focus:outline-none dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-400"
              />
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 size-3.5 text-zinc-500 dark:text-zinc-400"
              />
              <kbd className="pointer-events-none absolute top-2.5 right-2 rounded-xs border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                ⌘K
              </kbd>
            </form>

            <ThemeToggle isDarkOverlay={false} />

            {contact && (
              <a
                href={contact}
                target="_blank"
                rel="noreferrer"
                aria-label="Falar com especialista"
                className={
                  sweepButton +
                  ' min-h-11 shrink-0 px-3.5 py-2.5 text-center text-xs font-semibold whitespace-nowrap sm:min-h-12 sm:px-6 sm:py-3 sm:text-sm lg:min-h-13 lg:px-7 lg:text-base ' +
                  sweepOnLight
                }
              >
                <span aria-hidden="true" className={sweepFill} />
                <span className={sweepContent + ' gap-2! sm:gap-2.5!'}>
                  <span className="min-[420px]:hidden">Fale conosco</span>
                  <span className="hidden min-[420px]:inline sm:hidden">Fale com especialista</span>
                  <span className="hidden sm:inline">Falar com especialista</span>
                  <ArrowUpRight
                    size={20}
                    className="size-4 shrink-0 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5 motion-reduce:transition-none sm:size-5"
                  />
                </span>
              </a>
            )}

            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              aria-label="Abrir menu lateral"
              aria-expanded={isMobileOpen}
              className="cursor-pointer rounded-xs border border-zinc-300 bg-white p-2.5 text-ink transition-colors hover:border-piramide hover:text-piramide xl:hidden dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <Menu aria-hidden="true" className="size-5" />
            </button>
          </div>
        </div>
      </header>

      {isMobileOpen && (
        <div className="fixed inset-0 z-[60] xl:hidden">
          <div
            aria-hidden="true"
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
            className="fixed inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white p-6 text-ink shadow-2xl dark:border-l dark:border-white/10 dark:bg-[#141414] dark:text-zinc-100"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-white/10">
              <Link href="/" onClick={() => setIsMobileOpen(false)} aria-label="Pirâmide Imóveis — início">
                <img
                  src="/logos/piramide/logo_black.svg"
                  alt=""
                  width={1000}
                  height={512}
                  className="h-10 w-auto object-contain dark:hidden"
                />
                <img
                  src="/logos/piramide/logo_white.svg"
                  alt=""
                  width={1000}
                  height={512}
                  className="hidden h-10 w-auto object-contain dark:block"
                />
              </Link>
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                aria-label="Fechar menu lateral"
                className="cursor-pointer rounded-xs border border-zinc-200 p-2 text-zinc-600 transition-colors hover:border-piramide hover:text-piramide dark:border-white/10 dark:text-zinc-300"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} role="search" className="relative my-4 w-full">
              <input
                type="text"
                placeholder="Pesquisar imóveis, condomínios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 w-full rounded-xs border border-zinc-200 bg-zinc-100 pr-3 pl-10 text-xs text-ink placeholder:text-zinc-500 focus:border-piramide focus:outline-none dark:border-white/10 dark:bg-zinc-800/80 dark:text-zinc-100 dark:placeholder:text-zinc-400"
              />
              <Search aria-hidden="true" className="pointer-events-none absolute top-3.5 left-3 size-4 text-zinc-500 dark:text-zinc-400" />
            </form>

            <nav aria-label="Menu mobile" className="flex-1 space-y-1 overflow-y-auto">
              {navLinks.map((item) => {
                const active = item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={
                      'block rounded-xs p-3 text-sm font-bold tracking-wider uppercase transition-colors ' +
                      (active ? 'bg-piramide text-white' : 'text-ink hover:bg-piramide hover:text-white dark:text-zinc-100')
                    }
                  >
                    {item.label}
                  </Link>
                )
              })}
              <a
                href={portalUrl || 'https://www.piramideimoveissjc.com.br/'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center justify-between rounded-xs p-3 text-sm font-bold tracking-wider text-ink uppercase transition-colors hover:bg-piramide hover:text-white dark:text-zinc-100"
              >
                <span>Ver Imóveis à Venda</span>
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </a>
            </nav>

            {contact && (
              <div className="pt-4">
                <a
                  href={contact}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setIsMobileOpen(false)}
                  className={sweepButton + ' min-h-12 w-full px-5 py-3 text-sm font-semibold ' + sweepOnLight}
                >
                  <span aria-hidden="true" className={sweepFill} />
                  <span className={sweepContent}>
                    Falar com especialista
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                  </span>
                </a>
              </div>
            )}

            {socialLinks.length > 0 && (
              <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-white/10">
                <span className="text-xs font-bold tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
                  Redes Sociais
                </span>
                <div className="flex items-center gap-2">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="rounded-xs border border-zinc-200 p-2 text-zinc-600 transition-colors hover:border-piramide hover:text-piramide dark:border-zinc-800 dark:text-zinc-400"
                    >
                      <svg aria-hidden="true" viewBox="0 0 256 256" fill="currentColor" className="size-4">
                        <path d={socialIconPaths[social.icon as keyof typeof socialIconPaths] || socialIconPaths.globe} />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  )
}

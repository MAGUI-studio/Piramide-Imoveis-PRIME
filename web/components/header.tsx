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
  {label: 'Imóveis', href: '/imoveis'},
  {label: 'Condomínios', href: '/condominios'},
]

export function Header({contact = null, portalUrl = null, socialLinks = []}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const lastScrollY = useRef(0)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const headerHeight = headerRef.current?.offsetHeight ?? 140
      setIsScrolled(currentScrollY > 20)

      if (currentScrollY <= headerHeight) {
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
    const previousBodyOverflow = document.body.style.overflow
    const previousHtmlOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousHtmlOverflow
    }
  }, [isMobileOpen])

  function handleSearchSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const query = searchQuery.trim()
    const params = new URLSearchParams()
    if (query) params.set('busca', query)
    setSearchQuery('')
    setIsMobileOpen(false)
    router.push('/imoveis' + (query ? '?' + params.toString() : '') + '#resultados')
  }

  const headerShown = isVisible || isMobileOpen

  return (
    <>
      <header
        ref={headerRef}
        onFocus={() => setIsVisible(true)}
        style={{transform: headerShown ? 'translateY(0)' : 'translateY(-100%)'}}
        className={
          'sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-[#F8F9FA]/95 text-zinc-900 backdrop-blur-md transition-[transform,box-shadow] duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:transition-none dark:border-white/[0.07] dark:bg-[#0e0e11]/92 dark:text-[#f5f2ec] ' +
          (isScrolled ? 'shadow-md dark:shadow-[0_10px_30px_rgba(0,0,0,0.45)]' : 'shadow-2xs')
        }
      >
        <div className="w-full border-b border-zinc-200/80 bg-white py-2.5 text-[11px] text-zinc-600 transition-colors dark:border-white/[0.06] dark:bg-[#070708] dark:text-[#9c968e]">
          <div className={wrap + ' flex items-center justify-between gap-4'}>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 font-bold tracking-wider text-zinc-900 uppercase dark:text-[#f5f2ec]">
                <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
                Pirâmide Prime
              </span>
              <span className="hidden text-zinc-300 sm:inline dark:text-white/20">•</span>
              <span className="hidden font-light text-zinc-600 sm:inline dark:text-[#9c968e]">
                Imóveis de Alto Padrão &amp; Curadoria Exclusiva
              </span>
            </div>

            <div className="flex items-center gap-4">
              <a
                href={portalUrl || 'https://www.piramideimoveissjc.com.br/'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 font-bold tracking-wide text-zinc-900 transition-colors hover:text-piramide dark:text-[#f5f2ec]"
              >
                <span>Ver Imóveis à Venda</span>
                <ArrowUpRight aria-hidden="true" className="size-3.5 text-piramide" />
              </a>
            </div>
          </div>
        </div>

        <div className={wrap + ' flex items-center justify-between gap-4 py-3.5 sm:gap-6 sm:py-4'}>
          <div className="flex shrink-0 items-center gap-5 lg:gap-6">
            <Link
              href="/"
              aria-label="Pirâmide Imóveis — início"
              className="flex items-center transition-opacity hover:opacity-90"
            >
              <img
                src="/logos/piramide/logo_black.png"
                alt=""
                width={1000}
                height={512}
                className="h-12 w-auto object-contain sm:h-14 lg:h-16 dark:hidden"
              />
              <img
                src="/logos/piramide/logo_white.png"
                alt=""
                width={1000}
                height={512}
                className="hidden h-12 w-auto object-contain sm:h-14 lg:h-16 dark:block"
              />
            </Link>

            <span
              aria-hidden="true"
              className="hidden h-7 w-px shrink-0 bg-zinc-300/80 xl:block dark:bg-white/15"
            />

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
                        ? 'bg-zinc-200/70 text-zinc-900 dark:bg-white/[0.08] dark:text-[#f5f2ec]'
                        : 'text-zinc-700 hover:bg-zinc-200/60 hover:text-zinc-900 dark:text-[#b5afa6] dark:hover:bg-white/[0.05] dark:hover:text-[#f5f2ec]')
                    }
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>

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
                className="h-10 w-full rounded-none border border-[#1b1916]/[0.10] bg-white/70 pr-11 pl-9 text-xs text-zinc-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] backdrop-blur-md transition-all placeholder:text-zinc-500 hover:border-[#1b1916]/20 hover:bg-white/90 focus:border-piramide/70 focus:bg-white focus:ring-1 focus:ring-piramide/25 focus:outline-none dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-[#f5f2ec] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] dark:placeholder:text-[#8a847c] dark:hover:border-white/[0.15] dark:hover:bg-white/[0.06] dark:focus:border-piramide/70 dark:focus:bg-white/[0.07]"
              />
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 size-3.5 text-zinc-500 dark:text-[#8a847c]"
              />
              <kbd className="pointer-events-none absolute top-2.5 right-2 rounded-xs border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-zinc-500 dark:border-white/[0.10] dark:bg-[#1b1b20] dark:text-[#9c968e]">
                ⌘K
              </kbd>
            </form>

            <ThemeToggle isDarkOverlay={false} />

            {contact && (
              <div className="hidden shrink-0 items-center gap-3.5 md:flex">
                <span
                  aria-hidden="true"
                  className="h-7 w-px shrink-0 bg-zinc-300/80 dark:bg-white/15"
                />
                <a
                  href={contact}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Falar com especialista"
                  className={
                    sweepButton +
                    ' min-h-12 shrink-0 px-6 py-3 text-center text-sm font-semibold whitespace-nowrap lg:min-h-13 lg:px-7 lg:text-base ' +
                    sweepOnLight
                  }
                >
                  <span aria-hidden="true" className={sweepFill} />
                  <span className={sweepContent + ' gap-2.5!'}>
                    <span>Falar com especialista</span>
                    <ArrowUpRight
                      size={20}
                      className="size-5 shrink-0 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5 motion-reduce:transition-none"
                    />
                  </span>
                </a>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              aria-label="Abrir menu lateral"
              aria-expanded={isMobileOpen}
              className="cursor-pointer rounded-xs border border-zinc-300 bg-white p-2.5 text-zinc-900 transition-colors hover:border-piramide hover:text-piramide xl:hidden dark:border-white/[0.10] dark:bg-[#141418] dark:text-[#f5f2ec]"
            >
              <Menu aria-hidden="true" className="size-5" />
            </button>
          </div>
        </div>
      </header>

      <div
        aria-hidden={!isMobileOpen}
        className={
          'fixed inset-0 z-[60] xl:hidden transition-opacity duration-300 ease-out motion-reduce:transition-none ' +
          (isMobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0')
        }
      >
        <div
          aria-hidden="true"
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/55 backdrop-blur-xs"
        />
        <aside
          role="dialog"
          aria-modal={isMobileOpen}
          aria-label="Menu de navegação"
          style={{transform: isMobileOpen ? 'translateX(0)' : 'translateX(100%)'}}
          className="fixed inset-y-0 right-0 flex h-dvh w-full max-w-sm flex-col overflow-hidden overscroll-contain bg-white p-6 text-zinc-900 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:transition-none dark:border-l dark:border-white/[0.08] dark:bg-[#0c0c0e] dark:text-[#f5f2ec]"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 pb-4 dark:border-white/10">
            <Link
              href="/"
              tabIndex={isMobileOpen ? 0 : -1}
              onClick={() => setIsMobileOpen(false)}
              aria-label="Pirâmide Imóveis — início"
            >
              <img
                src="/logos/piramide/logo_black.png"
                alt=""
                width={1000}
                height={512}
                className="h-10 w-auto object-contain dark:hidden"
              />
              <img
                src="/logos/piramide/logo_white.png"
                alt=""
                width={1000}
                height={512}
                className="hidden h-10 w-auto object-contain dark:block"
              />
            </Link>
            <button
              type="button"
              tabIndex={isMobileOpen ? 0 : -1}
              onClick={() => setIsMobileOpen(false)}
              aria-label="Fechar menu lateral"
              className="cursor-pointer rounded-xs border border-zinc-200 p-2 text-zinc-600 transition-colors hover:border-piramide hover:text-piramide dark:border-white/10 dark:text-zinc-300"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} role="search" className="relative my-4 w-full shrink-0">
            <input
              type="text"
              tabIndex={isMobileOpen ? 0 : -1}
              placeholder="Pesquisar imóveis, condomínios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full rounded-none border border-[#1b1916]/[0.10] bg-[#1b1916]/[0.03] pr-3 pl-10 text-xs text-ink backdrop-blur-md transition-colors placeholder:text-zinc-500 focus:border-piramide/70 focus:outline-none dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-zinc-100 dark:placeholder:text-zinc-400"
            />
            <Search aria-hidden="true" className="pointer-events-none absolute top-3.5 left-3 size-4 text-zinc-500 dark:text-zinc-400" />
          </form>

          <nav aria-label="Menu mobile" className="flex-1 space-y-1">
            {navLinks.map((item) => {
              const active = item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  tabIndex={isMobileOpen ? 0 : -1}
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
              tabIndex={isMobileOpen ? 0 : -1}
              onClick={() => setIsMobileOpen(false)}
              className="flex items-center justify-between rounded-xs p-3 text-sm font-bold tracking-wider text-ink uppercase transition-colors hover:bg-piramide hover:text-white dark:text-zinc-100"
            >
              <span>Ver Imóveis à Venda</span>
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </a>
          </nav>

          {contact && (
            <div className="shrink-0 pt-4">
              <a
                href={contact}
                target="_blank"
                rel="noreferrer"
                tabIndex={isMobileOpen ? 0 : -1}
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
            <div className="mt-4 flex shrink-0 items-center justify-between border-t border-zinc-200 pt-4 dark:border-white/10">
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
                    tabIndex={isMobileOpen ? 0 : -1}
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
    </>
  )
}

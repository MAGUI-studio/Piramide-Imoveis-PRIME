import Link from 'next/link'
import type {ReactNode} from 'react'
import {ArrowDownRight, ArrowUpRight, ChevronUp, Clock, MapPin, Menu, Search} from 'lucide-react'
import {wrap} from '../lib/classes'
import {socialIconPaths} from './socialIconPaths'
import {PrivacyLink} from './siteUtilities'

const portalUrl = 'https://www.piramideimoveissjc.com.br/'
const footerHeading = 'text-xs font-bold tracking-widest text-white uppercase'
const footerLink = 'flex w-fit items-center gap-1 transition-colors before:text-piramide before:opacity-0 before:transition-opacity before:content-["›"/""] hover:text-piramide hover:before:opacity-100 focus-visible:before:opacity-100'
const socialLinks = [
  {label: 'Instagram', href: 'https://www.instagram.com/piramideimoveis', icon: socialIconPaths.instagram},
  {label: 'YouTube', href: 'https://www.youtube.com/@piramideimoveis9390/featured', icon: socialIconPaths.youtube},
  {label: 'LinkedIn', href: 'https://www.linkedin.com/company/piramide-im%C3%B3veis-queops-ltda', icon: socialIconPaths.linkedin},
  {label: 'Facebook', href: 'https://www.facebook.com/imobiliariapiramide', icon: socialIconPaths.facebook},
  {label: 'Portal Oficial', href: portalUrl, icon: socialIconPaths.globe},
]
const branches = [
  {label: 'Unidade Urbanova', href: 'https://www.google.com/search?q=Pir%C3%A2mide+im%C3%B3veis+unidade+Urbanova+SJC'},
  {label: 'Unidade Litoral', href: 'https://www.google.com/search?q=Pir%C3%A2mide+im%C3%B3veis+unidade+caraguatatuba'},
]
const defaultWhatsapp = 'https://wa.me/?text=' + encodeURIComponent('Olá! Gostaria de conversar sobre os empreendimentos da Pirâmide PRIME.')

export function TopBar() {
  return (
    <div className="flex w-full items-center justify-between border-b border-white/15 bg-coal/30 px-5 py-2.5 text-[11px] text-ivory/80 backdrop-blur-md sm:px-9 lg:px-14">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 font-bold tracking-wider text-white uppercase">
          <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
          Pirâmide PRIME
        </span>
        <span className="hidden text-white/35 sm:inline">•</span>
        <span className="hidden font-light text-ivory/90 sm:inline">
          Referência Absoluta em Alto Padrão — Curadoria Exclusiva dos Endereços Mais Desejados da Região
        </span>
      </div>

      <div className="flex items-center gap-4">
        <a
          href={portalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group/sale flex items-center gap-1 font-bold tracking-wide text-white"
        >
          <span>Ver Imóveis à Venda</span>
          <ArrowUpRight size={14} strokeWidth={2.5} className="text-piramide transition-transform duration-300 ease-out group-hover/sale:translate-x-0.5 group-hover/sale:-translate-y-0.5 motion-reduce:transition-none" />
        </a>
      </div>
    </div>
  )
}

export function Header({home = false, overlay = false, contact = null}: {home?: boolean; overlay?: boolean; contact?: string | null}) {
  return (
    <header className={overlay ? 'absolute inset-x-0 top-0 z-5' : 'border-b border-white/15'}>
      <TopBar />
      <div className={overlay ? 'flex items-center justify-between gap-4 px-5 py-4 sm:px-9 sm:py-5 lg:px-14 lg:py-6' : wrap + ' flex items-center justify-between gap-4 py-4 md:py-5'}>
        <Link href="/" className="inline-flex shrink-0" aria-label="Pirâmide Imóveis — início">
          <img className={overlay ? 'h-auto w-[clamp(68px,6.5vw,104px)]' : 'h-auto w-[clamp(96px,10vw,128px)]'} src="/logos/piramide/logo_white.svg" alt="" width={1000} height={512} />
        </Link>
        <div className="flex items-center gap-3 text-ivory sm:gap-4">
          {!home && <nav aria-label="Navegação principal" className="mr-2 hidden sm:block">
            <Link className="inline-flex items-center gap-2 border-b border-ivory/50 py-2 text-xs hover:text-gold sm:text-sm" href="/#empreendimentos">Empreendimentos <ArrowDownRight size={16} strokeWidth={1.4} /></Link>
          </nav>}
          <button type="button" className="inline-grid size-9 cursor-pointer place-items-center text-ivory transition-colors hover:text-piramide sm:size-10" aria-label="Pesquisar">
            <Search size={20} strokeWidth={1.7} />
          </button>
          <button type="button" className="inline-grid size-9 cursor-pointer place-items-center text-ivory transition-colors hover:text-piramide sm:size-10" aria-label="Abrir menu">
            <Menu size={22} strokeWidth={1.7} />
          </button>
          <span aria-hidden="true" className="select-none text-lg font-extralight text-ivory/55 sm:text-xl">|</span>
          <a
            href={contact || defaultWhatsapp}
            target="_blank"
            rel="noreferrer"
            className="group/cta relative inline-flex cursor-pointer select-none items-center justify-center overflow-hidden border border-ivory/65 bg-coal/35 px-3.5 py-2 text-xs font-medium text-ivory backdrop-blur-xs transition-all duration-300 ease-out hover:border-piramide active:scale-[0.98] will-change-transform sm:px-4 sm:py-2.5 sm:text-sm"
          >
            <span aria-hidden="true" className="pointer-events-none absolute inset-0 size-full translate-y-full bg-piramide transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/cta:translate-y-0" />
            <span className="pointer-events-none relative z-10 inline-flex items-center justify-center gap-2 transition-colors duration-300 group-hover/cta:text-white">
              Falar com especialista <ArrowUpRight size={16} className="transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5 motion-reduce:transition-none" />
            </span>
          </a>
        </div>
      </div>
    </header>
  )
}

export function Footer({contact, children}: {contact: string | null; children?: ReactNode}) {
  return (
    <footer className={'relative w-full overflow-hidden text-zinc-300 ' + (children ? 'bg-paper' : 'bg-coal')}>
      {children}
      <div className={'relative z-1 isolate ' + (children ? '-mt-8 sm:-mt-14' : 'pt-10 sm:pt-14')}>
        {children && <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-1 top-8 bg-coal sm:top-14" />}
        <div className={wrap + ' px-5 py-8 sm:px-8 sm:pt-14 sm:pb-10 lg:px-12'}>
          <div className="grid gap-8 md:grid-cols-[1fr_.8fr_1.25fr] lg:gap-14">
            <div className="space-y-4">
              <Link href="/" className="inline-flex transition-opacity hover:opacity-80" aria-label="Pirâmide Imóveis — início">
                <img className="h-14 w-auto object-contain" src="/logos/piramide/logo_white.svg" alt="" width={1000} height={512} loading="lazy" />
              </Link>
              <p className="max-w-[34ch] text-sm leading-relaxed">
                Mais de 45 anos de tradição no mercado imobiliário de São José dos Campos e região.
              </p>
              <p className="text-xs font-semibold tracking-wide text-white">CRECI 3787-J</p>
            </div>

            <nav aria-label="Navegação do rodapé" className="space-y-4">
              <h2 className={footerHeading}>Explore</h2>
              <ul className="grid gap-2.5 text-sm">
                <li><Link href="/" className={footerLink}>Início</Link></li>
                <li><Link href="/empreendimentos" className={footerLink}>Empreendimentos</Link></li>
                <li><a href={portalUrl} target="_blank" rel="noreferrer" className={footerLink}>Portal Pirâmide Imóveis</a></li>
                <li><a href={contact || defaultWhatsapp} target="_blank" rel="noreferrer" className={footerLink}>Fale com um especialista</a></li>
              </ul>
            </nav>

            <div className="space-y-4">
              <h2 className={footerHeading}>Sede principal</h2>
              <address className="flex items-start gap-2.5 text-sm leading-relaxed not-italic">
                <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-piramide" />
                <span>Av. São João, 1301, Jardim Esplanada<br />São José dos Campos, SP · 12242-840</span>
              </address>
              <div className="flex items-start gap-2.5 text-sm leading-relaxed">
                <Clock aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-piramide" />
                <p>Segunda a sexta, 8h às 18h<br />Sábado, 9h às 13h</p>
              </div>
              <ul aria-label="Outras unidades" className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
                {branches.map(({label, href}) => (
                  <li key={label}>
                    <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 transition-colors hover:text-white">
                      {label} <ArrowUpRight aria-hidden="true" size={13} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className={wrap + ' flex flex-wrap items-center justify-between gap-x-6 gap-y-5 pt-6 pb-24 sm:px-18 sm:pb-6'}>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {socialLinks.map(({label, href, icon}) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} title={label} className="inline-flex min-h-9 items-center text-white transition-colors hover:text-piramide">
                <svg aria-hidden="true" viewBox="0 0 256 256" fill="currentColor" className="size-5">
                  <path d={icon} />
                </svg>
              </a>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-xs">
            <p>© {new Date().getFullYear()} Pirâmide Imóveis. Todos os direitos reservados.</p>
            <PrivacyLink className="cursor-pointer transition-colors hover:text-white" />
            <a href="#" className="inline-flex items-center gap-1 font-medium text-white transition-colors hover:text-piramide">
              Voltar ao topo <ChevronUp aria-hidden="true" className="size-3.5 shrink-0" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

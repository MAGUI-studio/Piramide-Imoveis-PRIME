import Link from 'next/link'
import {ArrowDownRight, ArrowUpRight, Building2, ChevronUp, Clock, MapPin, Menu, Search} from 'lucide-react'
import {wrap} from '../lib/classes'
import {socialIconPaths} from './socialIconPaths'
import {Reveal} from './motion'
import {PrivacyLink} from './siteUtilities'

const portalUrl = 'https://www.piramideimoveissjc.com.br/'
const footerHeading = 'font-mono text-xs font-bold tracking-widest text-white uppercase'
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
    <div className="flex w-full items-center justify-between border-b border-white/15 bg-coal/30 px-5 py-2.5 font-mono text-[11px] text-ivory/80 backdrop-blur-md sm:px-9 lg:px-14">
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

export function Footer({contact}: {contact: string | null}) {
  return (
    <footer className="relative w-full overflow-hidden border-t border-zinc-800 bg-[#161616] px-6 py-16 text-zinc-400 sm:py-20 md:px-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff07_1px,transparent_1px)] [background-size:32px_32px]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -bottom-6 flex justify-center overflow-hidden select-none">
        <span className="text-7xl leading-none font-black tracking-tighter whitespace-nowrap text-white/[0.03] uppercase sm:text-9xl lg:text-[140px]">Pirâmide Imóveis</span>
      </div>

      <Reveal className="relative mx-auto w-full max-w-440 space-y-12 motion-safe:data-[entered=true]:animate-enter sm:space-y-16">
        <div className="flex flex-col items-start justify-between gap-4 border-b border-zinc-800/80 pb-8 md:flex-row md:items-center">
          <p className="text-xs leading-relaxed font-medium text-zinc-300">
            Curadoria de empreendimentos de alto padrão em São José dos Campos e região.
          </p>
          <div className="flex shrink-0 items-center gap-4 sm:gap-5">
            {socialLinks.map(({label, href, icon}) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} title={label} className="group text-white transition-colors hover:text-piramide">
                <svg aria-hidden="true" viewBox="0 0 256 256" fill="currentColor" className="size-[22px] motion-safe:transition-transform motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:scale-110">
                  <path d={icon} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-x-8 xl:gap-x-12">
          <div className="space-y-6 md:col-span-12 lg:col-span-3 xl:col-span-4">
            <Link href="/" className="inline-flex transition-opacity hover:opacity-90" aria-label="Pirâmide Imóveis — início">
              <img className="h-14 w-auto object-contain sm:h-18" src="/logos/piramide/logo_white.svg" alt="" width={1000} height={512} loading="lazy" />
            </Link>
            <p className="max-w-md text-sm leading-relaxed font-light">
              Mais de 45 anos de tradição, credibilidade e excelência no mercado imobiliário de São José dos Campos e região.
            </p>
            <div className="inline-flex items-center gap-2 border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs">
              <span className="font-mono font-bold text-piramide">CRECI 3787-J</span>
              <span aria-hidden="true" className="text-zinc-700">•</span>
              <span className="font-medium text-zinc-300">Imobiliária Oficial</span>
            </div>
          </div>

          <nav aria-label="Navegação do rodapé" className="space-y-4 md:col-span-3 lg:col-span-2">
            <h2 className={footerHeading}>Navegação</h2>
            <ul className="space-y-2.5 text-sm font-light">
              <li><Link href="/" className={footerLink}>Início</Link></li>
              <li><Link href="/#empreendimentos" className={footerLink}>Empreendimentos</Link></li>
            </ul>
          </nav>

          <nav aria-label="Pirâmide Imóveis" className="space-y-4 md:col-span-3 lg:col-span-2">
            <h2 className={footerHeading}>Pirâmide Imóveis</h2>
            <ul className="space-y-2.5 text-sm font-light">
              <li><a href={portalUrl} target="_blank" rel="noreferrer" className={footerLink}>Buscar imóveis</a></li>
              <li><a href={contact || defaultWhatsapp} target="_blank" rel="noreferrer" className={footerLink}>Fale conosco</a></li>
            </ul>
          </nav>

          <div className="space-y-4 md:col-span-6 lg:col-span-5 xl:col-span-4">
            <h2 className={footerHeading}>Sede principal</h2>
            <div className="space-y-3.5 text-xs font-light">
              <address className="flex items-start gap-2.5 leading-relaxed text-zinc-300 not-italic">
                <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-piramide" />
                <span>Av. São João, 1301 - Jardim Esplanada, São José dos Campos - SP, 12242-840</span>
              </address>
              <div className="flex items-start gap-2.5">
                <Clock aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-piramide" />
                <div className="space-y-0.5 font-mono text-zinc-300">
                  <p>Segunda a sexta, 8h às 18h</p>
                  <p className="text-zinc-400">Sábado, 9h às 13h</p>
                </div>
              </div>
              <div className="space-y-2 border-t border-zinc-800 pt-2">
                <p className="flex items-center gap-1 font-mono text-[10px] font-bold tracking-wider uppercase">
                  <Building2 aria-hidden="true" className="size-3.5 text-piramide" /> Outras unidades
                </p>
                <div className="grid gap-2 min-[380px]:grid-cols-2">
                  {branches.map(({label, href}) => (
                    <a key={label} href={href} target="_blank" rel="noreferrer" className="inline-flex items-center justify-between gap-2 border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 font-mono text-[11px] text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white">
                      {label}
                      <Search aria-hidden="true" className="size-3 shrink-0 text-zinc-500" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-zinc-800 pt-6 text-center text-xs text-zinc-400 sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} Pirâmide Imóveis. Todos os direitos reservados.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <PrivacyLink className="cursor-pointer transition-colors hover:text-piramide" />
            <span aria-hidden="true" className="text-white/25">|</span>
            <a href="#" className="inline-flex items-center gap-1 font-medium text-white transition-colors hover:text-piramide">
              Voltar ao topo <ChevronUp aria-hidden="true" className="size-3.5 shrink-0" />
            </a>
          </div>
        </div>
      </Reveal>
    </footer>
  )
}

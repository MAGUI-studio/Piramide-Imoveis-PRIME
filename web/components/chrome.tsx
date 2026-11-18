import Link from 'next/link'
import type {ReactNode} from 'react'
import {ArrowUpRight, ChevronUp, Clock, MapPin} from 'lucide-react'
import {sweepButton, sweepFill, sweepOnCover, wrap} from '../lib/classes'
import {socialIconPaths} from './socialIconPaths'
import {PrivacyLink} from './siteUtilities'

const portalUrl = 'https://www.piramideimoveissjc.com.br/'
const footerHeading = 'text-xs font-bold tracking-widest uppercase'
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
const defaultWhatsapp = 'https://wa.me/?text=' + encodeURIComponent('Olá! Gostaria de conversar sobre os empreendimentos da Pirâmide Imóveis Prime.')

export function Header({overlay = false, light = false, splitOverlay = false, contact = null}: {home?: boolean; overlay?: boolean; light?: boolean; splitOverlay?: boolean; contact?: string | null}) {
  return (
    <header className={overlay ? 'absolute inset-x-0 top-0 z-5' : undefined}>
      <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-9 sm:py-5 lg:px-14 lg:py-6">
        <Link href="/" className="inline-flex shrink-0" aria-label="Pirâmide Imóveis — início">
          {splitOverlay ? (
            <>
              <img className="h-auto w-[clamp(60px,5.5vw,92px)] min-[801px]:hidden" src="/logos/piramide/logo_white.svg" alt="" width={1000} height={512} />
              <img className="hidden h-auto w-[clamp(60px,5.5vw,92px)] min-[801px]:block" src="/logos/piramide/logo_black.svg" alt="" width={1000} height={512} />
            </>
          ) : (
            <img className="h-auto w-[clamp(60px,5.5vw,92px)]" src={light ? '/logos/piramide/logo_black.svg' : '/logos/piramide/logo_white.svg'} alt="" width={1000} height={512} />
          )}
        </Link>
        <a
          href={contact || defaultWhatsapp}
          target="_blank"
          rel="noreferrer"
          className={sweepButton + ' px-3.5 py-2 text-xs font-medium sm:px-4 sm:py-2.5 sm:text-sm ' + (light ? 'border-zinc-900/30 text-zinc-900' : sweepOnCover)}
        >
          <span aria-hidden="true" className={sweepFill} />
          <span className="pointer-events-none relative z-10 inline-flex items-center justify-center gap-2 transition-colors duration-300 group-hover/cta:text-white group-focus-visible/cta:text-white motion-reduce:transition-none">
            Falar com especialista <ArrowUpRight size={16} className="transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5 motion-reduce:transition-none" />
          </span>
        </a>
      </div>
    </header>
  )
}

export function Footer({contact, children, light = false, integrated = false}: {contact: string | null; children?: ReactNode; light?: boolean; integrated?: boolean}) {
  const strongText = light ? 'text-zinc-900' : 'text-white'
  const overlap = children && !integrated
  return (
    <footer className={'relative w-full overflow-hidden ' + (light ? 'border-t border-zinc-200 bg-paper text-zinc-600' : (overlap ? 'bg-paper' : 'bg-coal') + ' text-zinc-300')}>
      {children}
      <div className={'relative z-1 isolate overflow-hidden ' + (overlap ? '-mt-8 sm:-mt-14' : integrated ? '' : 'pt-10 sm:pt-14')}>
        {overlap && <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-1 top-8 bg-coal sm:top-14" />}
        {!light && (
          <img
            src="/logos/piramide/icon.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -right-4 bottom-0 -z-1 w-[clamp(18rem,38vw,34rem)] max-w-none select-none opacity-12 brightness-150 grayscale"
          />
        )}
        <div className={wrap + ' px-5 py-8 sm:px-8 sm:pt-14 sm:pb-10 lg:px-12'}>
          <div className="grid gap-8 md:grid-cols-[1fr_.8fr_1.25fr] lg:gap-14">
            <div className="space-y-4">
              <Link href="/" className="inline-flex transition-opacity hover:opacity-80" aria-label="Pirâmide Imóveis — início">
                <img className="h-14 w-auto object-contain" src={light ? '/logos/piramide/logo_black.svg' : '/logos/piramide/logo_white.svg'} alt="" width={1000} height={512} loading="lazy" />
              </Link>
              <p className="max-w-[34ch] text-sm leading-relaxed">
                Mais de 45 anos de tradição no mercado imobiliário de São José dos Campos e região.
              </p>
              <p className={'text-xs font-semibold tracking-wide ' + strongText}>CRECI 3787-J</p>
            </div>

            <nav aria-label="Navegação do rodapé" className="space-y-4">
              <h2 className={footerHeading + ' ' + strongText}>Explore</h2>
              <ul className="grid gap-2.5 text-sm">
                <li><Link href="/" className={footerLink}>Início</Link></li>
                <li><Link href="/empreendimentos" className={footerLink}>Empreendimentos</Link></li>
                <li><a href={portalUrl} target="_blank" rel="noreferrer" className={footerLink}>Portal Pirâmide Imóveis</a></li>
                <li><a href={contact || defaultWhatsapp} target="_blank" rel="noreferrer" className={footerLink}>Fale com um especialista</a></li>
              </ul>
            </nav>

            <div className="space-y-4">
              <h2 className={footerHeading + ' ' + strongText}>Sede principal</h2>
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
                    <a href={href} target="_blank" rel="noreferrer" className={'inline-flex items-center gap-1.5 transition-colors ' + (light ? 'hover:text-piramide' : 'hover:text-white')}>
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
              <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} title={label} className={'inline-flex min-h-9 items-center transition-colors hover:text-piramide ' + strongText}>
                <svg aria-hidden="true" viewBox="0 0 256 256" fill="currentColor" className="size-5">
                  <path d={icon} />
                </svg>
              </a>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-xs">
            <p>© {new Date().getFullYear()} Pirâmide Imóveis. Todos os direitos reservados.</p>
            <PrivacyLink className={'cursor-pointer transition-colors ' + (light ? 'hover:text-piramide' : 'hover:text-white')} />
            <a href="#" className={'inline-flex items-center gap-1 font-medium transition-colors hover:text-piramide ' + strongText}>
              Voltar ao topo <ChevronUp aria-hidden="true" className="size-3.5 shrink-0" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

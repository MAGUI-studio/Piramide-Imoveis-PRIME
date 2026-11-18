import Link from 'next/link'
import type {ReactNode} from 'react'
import {ArrowUpRight, ChevronUp, Clock, MapPin} from 'lucide-react'
import {sweepCompact, sweepOnLight, sweepContent, sweepButton, sweepFill, sweepOnCover, wrap} from '../lib/classes'
import {socialIconPaths} from './socialIconPaths'
import {getSiteSettings, isPreview} from '../lib/sanity'
import {organizationAddress, safeExternalUrl} from '../lib/siteSettings'
import {PrivacyLink} from './siteUtilities'
import {HeaderSearch} from './headerSearch'

const footerHeading = 'text-xs font-bold tracking-widest uppercase'
const footerLink = 'flex w-fit items-center gap-1 transition-colors before:text-piramide before:opacity-0 before:transition-opacity before:content-["›"/""] hover:text-piramide hover:before:opacity-100 focus-visible:before:opacity-100'
export function Header({overlay = false, light = false, splitOverlay = false, contact = null}: {home?: boolean; overlay?: boolean; light?: boolean; splitOverlay?: boolean; contact?: string | null}) {
  return (
    <header className={overlay ? 'absolute inset-x-0 top-0 z-20' : 'relative z-20'}>
      <div className={wrap + ' relative flex min-h-20 items-center justify-between gap-2 py-3 sm:min-h-0 sm:gap-4 sm:py-5 lg:py-6'}>
        <Link href="/" className="inline-flex shrink-0" aria-label="Pirâmide Imóveis — início">
          {splitOverlay ? (
            <>
              <img className="h-auto w-[clamp(72px,6.5vw,110px)] min-[801px]:hidden" src="/logos/piramide/logo_white.svg" alt="" width={1000} height={512} />
              <img className="hidden h-auto w-[clamp(72px,6.5vw,110px)] min-[801px]:block" src="/logos/piramide/logo_black.svg" alt="" width={1000} height={512} />
            </>
          ) : (
            <img className="h-auto w-[clamp(72px,6.5vw,110px)]" src={light ? '/logos/piramide/logo_black.svg' : '/logos/piramide/logo_white.svg'} alt="" width={1000} height={512} />
          )}
        </Link>
        <div className="flex min-w-0 items-center gap-2 min-[400px]:gap-3 sm:gap-5">
        <HeaderSearch light={light} hasContact={!!contact} />
        {contact && <a
          href={contact}
          target="_blank"
          rel="noreferrer"
          aria-label="Falar com especialista"
          className={sweepButton + sweepCompact + ' shrink-0 px-2.5! text-center text-[11px]! whitespace-nowrap sm:px-4! sm:text-sm! ' + (light ? sweepOnLight : sweepOnCover)}
        >
          <span aria-hidden="true" className={sweepFill} />
          <span className={sweepContent + ' gap-1.5! sm:gap-2.5!'}>
            <span className="min-[400px]:hidden">Fale conosco</span>
            <span className="hidden min-[400px]:inline sm:hidden">Fale com especialista</span>
            <span className="hidden sm:inline">Falar com especialista</span>
            <ArrowUpRight size={16} className="size-3.5 shrink-0 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5 motion-reduce:transition-none sm:size-4" />
          </span>
        </a>}
        </div>
      </div>
    </header>
  )
}

export async function Footer({contact, children, light = false, integrated = false}: {contact: string | null; children?: ReactNode; light?: boolean; integrated?: boolean}) {
  const settings = await getSiteSettings(await isPreview())
  const organization = settings.organization || {}
  const portalUrl = safeExternalUrl(organization.portalUrl)
  const socialLinks = organization.socialLinks || []
  const branches = organization.branches || []
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
        <div className={wrap + ' py-8 sm:pt-14 sm:pb-10'}>
          <div className="grid gap-8 md:grid-cols-[1fr_.8fr_1.25fr] lg:gap-14">
            <div className="space-y-4">
              <Link href="/" className="inline-flex transition-opacity hover:opacity-80" aria-label="Pirâmide Imóveis — início">
                <img className="h-14 w-auto object-contain" src={light ? '/logos/piramide/logo_black.svg' : '/logos/piramide/logo_white.svg'} alt="" width={1000} height={512} loading="lazy" />
              </Link>
              <p className="max-w-[34ch] text-sm leading-relaxed">
                {organization.description}
              </p>
              <p className={'text-xs font-semibold tracking-wide ' + strongText}>{organization.creci && 'CRECI ' + organization.creci}</p>
            </div>

            <nav aria-label="Navegação do rodapé" className="space-y-4">
              <h2 className={footerHeading + ' ' + strongText}>Explore</h2>
              <ul className="grid gap-2.5 text-sm">
                <li><Link href="/" className={footerLink}>Início</Link></li>
                <li><Link href="/empreendimentos" className={footerLink}>Empreendimentos</Link></li>
                {portalUrl && <li><a href={portalUrl} target="_blank" rel="noreferrer" className={footerLink}>Portal {organization.name}</a></li>}
                {contact && <li><a href={contact} target="_blank" rel="noreferrer" className={footerLink}>Fale com um especialista</a></li>}
              </ul>
            </nav>

            <div className="space-y-4">
              <h2 className={footerHeading + ' ' + strongText}>{organization.officeTitle}</h2>
              {organizationAddress(organization) && <address className="flex items-start gap-2.5 text-sm leading-relaxed not-italic">
                <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-piramide" />
                <span>{organizationAddress(organization)}</span>
              </address>}
              {organization.openingHours && <div className="flex items-start gap-2.5 text-sm leading-relaxed">
                <Clock aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-piramide" />
                <p className="whitespace-pre-line">{organization.openingHours}</p>
              </div>}
              <ul aria-label="Outras unidades" className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
                {branches.filter(({href}) => safeExternalUrl(href)).map(({label, href}) => (
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

        <div className={wrap + ' flex flex-wrap items-center justify-between gap-x-6 gap-y-5 pt-6 pb-24 sm:pb-6'}>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {socialLinks.filter(({href}) => safeExternalUrl(href)).map(({label, href, icon}) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} title={label} className={'inline-flex min-h-9 items-center transition-colors hover:text-piramide ' + strongText}>
                <svg aria-hidden="true" viewBox="0 0 256 256" fill="currentColor" className="size-5">
                  <path d={socialIconPaths[icon as keyof typeof socialIconPaths] || socialIconPaths.globe} />
                </svg>
              </a>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-xs">
            <p>© {new Date().getFullYear()} {organization.name}. {organization.copyright}</p>
            {settings.privacy?.title && <PrivacyLink className={'cursor-pointer transition-colors ' + (light ? 'hover:text-piramide' : 'hover:text-white')} />}
            <a href="#" className={'inline-flex items-center gap-1 font-medium transition-colors hover:text-piramide ' + strongText}>
              Voltar ao topo <ChevronUp aria-hidden="true" className="size-3.5 shrink-0" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

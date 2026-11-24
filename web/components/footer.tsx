import Link from 'next/link'
import {ArrowUpRight, Building2, ChevronUp, Clock, MapPin} from 'lucide-react'
import {wrap} from '../lib/classes'
import {whatsappLink} from '../lib/model'
import {getSiteSettings, isPreview} from '../lib/sanity'
import {organizationAddress, safeExternalUrl} from '../lib/siteSettings'
import {PrivacyLink} from './siteUtilities'
import {socialIconPaths} from './socialIconPaths'

const footerHeading = 'font-mono text-xs font-bold tracking-widest text-[#f5f2ec] uppercase'
const footerLink =
  'group inline-flex w-fit items-center text-sm font-light text-[#9c968e] transition-colors duration-200 hover:text-[#f5f2ec]'
const footerLinkAccent =
  'h-px w-0 bg-piramide transition-all duration-300 ease-out group-hover:mr-2.5 group-hover:w-3.5 motion-reduce:transition-none'

export async function Footer() {
  const settings = await getSiteSettings(await isPreview())
  const organization = settings.organization || {}
  const contact = whatsappLink(organization.commercialPhone ?? null)
  const portalUrl = safeExternalUrl(organization.portalUrl)
  const socialLinks = (organization.socialLinks || []).filter(({href}) => !!safeExternalUrl(href))
  const branches = (organization.branches || []).filter(({href}) => !!safeExternalUrl(href))
  const address = organizationAddress(organization)
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative w-full overflow-hidden bg-[#070708] text-[#9c968e] transition-colors">
      <div className="relative w-full pt-12 pb-28 sm:pt-16 sm:pb-28">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff07_1px,transparent_1px)] [background-size:32px_32px]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -bottom-2 flex justify-center overflow-hidden px-3 select-none sm:-bottom-4"
        >
          <span className="font-sans text-[clamp(1.75rem,9.2vw,8.75rem)] leading-none font-black tracking-tighter whitespace-nowrap text-white/[0.03] uppercase">
            PIRÂMIDE IMÓVEIS
          </span>
        </div>

        <div className={wrap + ' relative z-10 space-y-12 sm:space-y-14'}>
          <div className="flex flex-col items-start justify-between gap-4 border-b border-white/[0.06] pb-8 md:flex-row md:items-center">
            <span className="text-xs leading-relaxed font-medium text-zinc-300">
              Curadoria exclusiva de imóveis de alto padrão no Vale do Paraíba e Litoral Norte
            </span>

            {socialLinks.length > 0 && (
              <div className="flex shrink-0 items-center gap-4 self-start sm:gap-5 md:self-auto">
                {socialLinks.map(({label, href, icon}) => (
                  <a
                    key={label}
                    href={safeExternalUrl(href)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className="group cursor-pointer text-white transition-colors duration-300 hover:text-piramide"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 256 256"
                      fill="currentColor"
                      className="size-[22px] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110"
                    >
                      <path d={socialIconPaths[icon as keyof typeof socialIconPaths] || socialIconPaths.globe} />
                    </svg>
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-10 md:grid-cols-12 lg:gap-14">
            <div className="space-y-6 md:col-span-12 lg:col-span-4">
              <Link
                href="/"
                aria-label="Pirâmide Imóveis — início"
                className="inline-flex items-center transition-opacity hover:opacity-90"
              >
                <img
                  src="/logos/piramide/logo_white.png"
                  alt=""
                  width={1000}
                  height={512}
                  loading="lazy"
                  className="h-24 w-auto object-contain sm:h-28 lg:h-32"
                />
              </Link>

              {organization.description && (
                <p className="max-w-md text-sm leading-relaxed font-light text-zinc-400">
                  {organization.description}
                </p>
              )}

              {organization.creci && (
                <div className="inline-flex items-center gap-2 border border-white/[0.08] bg-[#111114] px-3 py-1.5 text-xs">
                  <span className="font-mono font-bold text-piramide">CRECI {organization.creci}</span>
                  <span className="text-white/20">•</span>
                  <span className="font-medium text-[#e5e0d8]">Imobiliária Oficial</span>
                </div>
              )}
            </div>

            <nav aria-label="Navegação do rodapé" className="space-y-4 md:col-span-3 lg:col-span-2">
              <h2 className={footerHeading}>Navegação</h2>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/" className={footerLink}>
                    <span aria-hidden="true" className={footerLinkAccent} />
                    <span>Início</span>
                  </Link>
                </li>
                <li>
                  <Link href="/imoveis" className={footerLink}>
                    <span aria-hidden="true" className={footerLinkAccent} />
                    <span>Imóveis</span>
                  </Link>
                </li>
                <li>
                  <Link href="/condominios" className={footerLink}>
                    <span aria-hidden="true" className={footerLinkAccent} />
                    <span>Condomínios</span>
                  </Link>
                </li>
                <li>
                  <Link href="/videos" className={footerLink}>
                    <span aria-hidden="true" className={footerLinkAccent} />
                    <span>Vídeos</span>
                  </Link>
                </li>
              </ul>
            </nav>

            <nav aria-label="Links institucionais" className="space-y-4 md:col-span-3 lg:col-span-2">
              <h2 className={footerHeading}>{organization.name || 'Pirâmide Imóveis'}</h2>
              <ul className="space-y-2.5">
                <li>
                  <a
                    href={portalUrl || 'https://www.piramideimoveissjc.com.br/'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={footerLink}
                  >
                    <span aria-hidden="true" className={footerLinkAccent} />
                    <span>Site Oficial</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://blog.piramideimoveissjc.com.br/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={footerLink}
                  >
                    <span aria-hidden="true" className={footerLinkAccent} />
                    <span>Blog Pirâmide</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://parqueuna.piramideimoveissjc.com.br/pt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={footerLink}
                  >
                    <span aria-hidden="true" className={footerLinkAccent} />
                    <span>Parque Una</span>
                  </a>
                </li>
                {contact && (
                  <li>
                    <a href={contact} target="_blank" rel="noopener noreferrer" className={footerLink}>
                      <span aria-hidden="true" className={footerLinkAccent} />
                      <span>Fale com Especialista</span>
                    </a>
                  </li>
                )}
              </ul>
            </nav>

            <div className="space-y-4 md:col-span-6 lg:col-span-4">
              <h2 className={footerHeading}>{organization.officeTitle || 'Sede Principal'}</h2>
              <div className="space-y-3.5 text-xs font-light">
                {address && (
                  <address className="flex items-start gap-2.5 not-italic">
                    <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-piramide" />
                    <span className="leading-relaxed text-zinc-300">{address}</span>
                  </address>
                )}

                {organization.openingHours && (
                  <div className="flex items-start gap-2.5">
                    <Clock aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-piramide" />
                    <p className="font-mono leading-relaxed whitespace-pre-line text-zinc-300">
                      {organization.openingHours}
                    </p>
                  </div>
                )}

                {branches.length > 0 && (
                  <div className="space-y-2 border-t border-white/[0.06] pt-3">
                    <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-wider text-[#9c968e] uppercase">
                      <Building2 aria-hidden="true" className="size-3.5 text-piramide" />
                      <span>Outras Unidades:</span>
                    </span>
                    <ul aria-label="Outras unidades" className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {branches.map(({label, href}) => (
                        <li key={label}>
                          <a
                            href={safeExternalUrl(href)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex w-full items-center justify-between border border-white/[0.08] bg-[#111114] px-2.5 py-2 font-mono text-[11px] text-[#d4cfc7] transition-colors hover:border-white/15 hover:bg-[#17171b] hover:text-[#f5f2ec]"
                          >
                            <span>{label}</span>
                            <ArrowUpRight aria-hidden="true" className="size-3.5 shrink-0 text-[#9c968e]" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-5 border-t border-white/[0.06] pt-8">
            <div className="flex flex-col items-center justify-between gap-4 text-center text-xs text-zinc-500 sm:flex-row sm:text-left">
              <p>
                © {currentYear} {organization.name || 'Pirâmide Imóveis'}.{' '}
                {organization.copyright || 'Todos os direitos reservados.'}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                {settings.privacy?.title && (
                  <>
                    <PrivacyLink className="cursor-pointer text-zinc-400 transition-colors hover:text-piramide" />
                    <span aria-hidden="true" className="text-white/25">|</span>
                  </>
                )}
                <a
                  href="#"
                  className="inline-flex cursor-pointer items-center gap-1 font-medium text-white transition-colors hover:text-piramide"
                >
                  <span>Voltar ao topo</span>
                  <ChevronUp aria-hidden="true" className="size-3.5 shrink-0" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

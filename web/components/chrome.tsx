import Link from 'next/link'
import {ArrowDownRight, ArrowUp, ArrowUpRight, Clock, MapPin, Menu, Search} from 'lucide-react'
import {eyebrow, wrap} from '../lib/classes'

const footerLink = 'group mb-3 flex w-fit items-center gap-2 text-sm hover:text-gold [&_svg]:text-gold [&_svg]:transition-transform hover:[&_svg]:-translate-y-0.5 hover:[&_svg]:translate-x-0.5 motion-reduce:[&_svg]:transition-none'
const footerHeading = eyebrow + ' mb-4 text-gold'
const footerDetail = 'flex items-start gap-3 text-sm leading-relaxed text-muted [&_svg]:mt-0.5 [&_svg]:shrink-0 [&_svg]:text-gold'
const defaultWhatsapp = 'https://wa.me/?text=' + encodeURIComponent('Olá! Gostaria de conversar sobre os empreendimentos da Pirâmide PRIME.')

export function Header({home = false, overlay = false, contact = null}: {home?: boolean; overlay?: boolean; contact?: string | null}) {
  return (
    <header className={overlay ? 'absolute inset-x-0 top-0 z-5 px-5 py-4 sm:px-9 sm:py-6 lg:px-14 lg:py-8' : 'border-b border-white/15'}>
      <div className={overlay ? 'flex items-center justify-between gap-4' : wrap + ' flex items-center justify-between gap-4 py-4 md:py-5'}>
        <Link href="/" className="inline-flex shrink-0" aria-label="Pirâmide Imóveis — início">
          <img className={overlay ? 'h-auto w-[clamp(68px,6.5vw,104px)]' : 'h-auto w-[clamp(96px,10vw,128px)]'} src="/logos/piramide/logo_white.svg" alt="" width={1000} height={512} />
        </Link>
        <div className="flex items-center gap-3 text-ivory sm:gap-4">
          {!home && <nav aria-label="Navegação principal" className="mr-2 hidden sm:block">
            <Link className="inline-flex items-center gap-2 border-b border-ivory/50 py-2 text-xs hover:text-gold sm:text-sm" href="/#empreendimentos">Empreendimentos <ArrowDownRight size={16} strokeWidth={1.4} /></Link>
          </nav>}
          <button type="button" className="inline-grid size-9 cursor-pointer place-items-center text-ivory transition-colors hover:text-gold sm:size-10" aria-label="Pesquisar">
            <Search size={20} strokeWidth={1.7} />
          </button>
          <button type="button" className="inline-grid size-9 cursor-pointer place-items-center text-ivory transition-colors hover:text-gold sm:size-10" aria-label="Abrir menu">
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
    <footer className="border-t border-gold/30 bg-coal">
      <div className={wrap}>
        <div className="grid gap-[clamp(28px,5vw,90px)] py-[clamp(45px,6vw,91px)] md:grid-cols-[.85fr_1fr_1.3fr]">
          <div className="grid content-start justify-items-start gap-4">
            <Link href="/" className="inline-flex" aria-label="Pirâmide Imóveis — início">
              <img className="h-auto w-36" src="/logos/piramide/logo_white.svg" alt="" width={1000} height={512} loading="lazy" />
            </Link>
            <span className="text-xs tracking-widest text-muted">CRECI 3787-J</span>
          </div>
          <nav aria-label="Links do rodapé">
            <h3 className={footerHeading}>Explore</h3>
            <Link className={footerLink} href="/#empreendimentos">Empreendimentos <ArrowUpRight size={14} /></Link>
            <a className={footerLink} href="https://www.piramideimoveissjc.com.br/" target="_blank" rel="noreferrer">Site da Pirâmide Imóveis <ArrowUpRight size={14} /></a>
            {contact && <a className={footerLink} href={contact} target="_blank" rel="noreferrer">WhatsApp <ArrowUpRight size={14} /></a>}
          </nav>
          <div>
            <h3 className={footerHeading}>Sede principal</h3>
            <address className={footerDetail + ' mb-3 not-italic'}><MapPin size={17} /> <span>Av. São João, 1301, Jardim Esplanada<br />São José dos Campos, SP</span></address>
            <p className={footerDetail}><Clock size={17} /> <span>Segunda a sexta, 8h às 18h<br />Sábado, 9h às 13h</span></p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-gold/30 pt-6 pb-7 text-xs text-muted">
          <span>© {new Date().getFullYear()} Pirâmide Imóveis</span>
          <a className="flex items-center gap-2 text-ivory hover:text-gold" href="#"><span>Voltar ao topo</span><ArrowUp className="text-gold" size={17} /></a>
        </div>
      </div>
    </footer>
  )
}

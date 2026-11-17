'use client'

import {useEffect, useRef, useState} from 'react'
import {ArrowUp, MessageCircle, ShieldCheck, X} from 'lucide-react'

const privacyEvent = 'open-privacy-policy'
const privacySections = [
  ['1. Controlador dos Dados', 'A Pirâmide Imóveis (Queops Empreendimentos Imobiliários Ltda, CRECI 3787-J), com sede na Av. São João, 1301 - Jardim Esplanada, São José dos Campos - SP, atua como controladora e responsável pelos dados tratados neste portal.'],
  ['2. Coleta e Finalidade Exclusiva', 'Os dados pessoais informados voluntariamente (como Nome, WhatsApp/Telefone e E-mail) são utilizados exclusivamente para que nossos corretores e consultores oficiais possam responder às suas solicitações, enviar tabelas de preços, novidades sobre os empreendimentos e prestar atendimento imobiliário personalizado em São José dos Campos e região.'],
  ['3. Cookies e Rastreamento Estatístico', 'Utilizamos cookies e serviços de análise estatística de navegação (como Google Analytics e Meta Ads) para mensurar a audiência, entender os empreendimentos mais visitados e aprimorar a relevância dos nossos serviços. Essas ferramentas não armazenam senhas ou dados financeiros sigilosos.'],
  ['4. Não Compartilhamento e Segurança', 'Seus dados nunca serão comercializados, cedidos ou compartilhados com terceiros não autorizados. Mantemos medidas técnicas adequadas de segurança da informação e criptografia para proteger seus dados contra acessos não autorizados.'],
  ['5. Seus Direitos (LGPD - Lei nº 13.709/2018)', 'Você possui o direito de confirmar a existência de tratamento, acessar seus dados, solicitar correções ou a exclusão definitiva dos seus dados de nossas listas a qualquer momento, sem qualquer burocracia, mediante solicitação em nosso canal oficial de atendimento.'],
]

export function PrivacyLink({className}: {className: string}) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(privacyEvent))}>
      Política de Privacidade (LGPD)
    </button>
  )
}

export function SiteUtilities() {
  const [cookieNotice, setCookieNotice] = useState<'pending' | 'visible' | 'dismissed'>('pending')
  const [showBackToTop, setShowBackToTop] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    let accepted = document.cookie.split('; ').includes('cookie-consent=accepted')
    try {
      accepted ||= localStorage.getItem('cookie_consent') === 'accepted'
    } catch {
      // The cookie can still record acceptance when local storage is unavailable.
    }
    if (accepted) {
      setCookieNotice('dismissed')
      return
    }
    const timer = window.setTimeout(() => setCookieNotice('visible'), 1200)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const updateScroll = () => setShowBackToTop(window.scrollY > 600)
    updateScroll()
    window.addEventListener('scroll', updateScroll, {passive: true})
    return () => window.removeEventListener('scroll', updateScroll)
  }, [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const syncPrivacy = () => {
      const params = new URLSearchParams(window.location.search)
      const shouldOpen = params.get('privacy') === 'true' || params.get('privacidade') === 'true'
      if (shouldOpen && !dialog.open) dialog.showModal()
      if (!shouldOpen && dialog.open) dialog.close()
    }
    syncPrivacy()
    window.addEventListener(privacyEvent, openPrivacy)
    window.addEventListener('popstate', syncPrivacy)
    return () => {
      window.removeEventListener(privacyEvent, openPrivacy)
      window.removeEventListener('popstate', syncPrivacy)
    }
  }, [])

  function openPrivacy() {
    const dialog = dialogRef.current
    if (!dialog || dialog.open) return
    const url = new URL(window.location.href)
    url.searchParams.set('privacy', 'true')
    url.searchParams.delete('privacidade')
    window.history.pushState(null, '', url)
    dialog.showModal()
  }

  function clearPrivacyQuery() {
    const url = new URL(window.location.href)
    if (!url.searchParams.has('privacy') && !url.searchParams.has('privacidade')) return
    url.searchParams.delete('privacy')
    url.searchParams.delete('privacidade')
    window.history.replaceState(null, '', url)
  }

  function acceptCookies() {
    document.cookie = 'cookie-consent=accepted; path=/; max-age=31536000; SameSite=Lax'
    try {
      localStorage.setItem('cookie_consent', 'accepted')
    } catch {
      // The cookie still records the acceptance when local storage is unavailable.
    }
    setCookieNotice('dismissed')
  }

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40">
        <div className="mx-auto flex w-full max-w-440 flex-col items-start gap-3 px-4 sm:px-6 md:px-12">
          {cookieNotice === 'visible' && (
            <section
              aria-labelledby="cookie-notice-title"
              className="pointer-events-auto relative mb-15 w-full overflow-hidden rounded-none border border-zinc-200 bg-white p-5 text-zinc-900 shadow-2xl motion-safe:animate-enter sm:mb-0 sm:max-w-[490px]"
            >
              <ShieldCheck aria-hidden="true" className="pointer-events-none absolute -right-5 -bottom-5 size-40 -rotate-12 text-piramide/[0.07]" />
              <div className="relative space-y-3.5">
                <div className="flex items-start justify-between gap-3">
                  <h2 id="cookie-notice-title" className="inline-flex items-center gap-1.5 border border-piramide/20 bg-piramide/10 px-2 py-0.5 font-mono text-[10px] font-black tracking-wider text-piramide uppercase">
                    <ShieldCheck aria-hidden="true" size={14} /> LGPD &amp; Cookies
                  </h2>
                  <button type="button" onClick={() => setCookieNotice('dismissed')} aria-label="Fechar aviso" className="-mt-1.5 -mr-1.5 shrink-0 cursor-pointer p-1 text-zinc-400 transition-colors hover:text-zinc-700">
                    <X aria-hidden="true" size={16} />
                  </button>
                </div>
                <p className="text-xs leading-relaxed font-light text-zinc-600">
                  Utilizamos cookies e tecnologias semelhantes para aprimorar sua experiência, analisar o tráfego e apresentar conteúdos personalizados sobre o mercado imobiliário. Ao continuar navegando, você concorda com nossos termos.
                </p>
                <div className="flex flex-col gap-2.5 pt-1 sm:flex-row sm:items-center sm:gap-4">
                  <button type="button" onClick={acceptCookies} className="w-full cursor-pointer bg-piramide px-4 py-2 text-center font-mono text-xs font-bold tracking-wider whitespace-nowrap text-white uppercase transition-all hover:bg-piramide/90 hover:shadow-md sm:w-auto">
                    Concordar e Continuar
                  </button>
                  <button type="button" onClick={openPrivacy} className="w-full cursor-pointer py-1 text-center font-mono text-xs font-medium whitespace-nowrap text-zinc-500 underline underline-offset-4 transition-colors hover:text-piramide sm:w-auto sm:py-0 sm:text-left">
                    Termos de Privacidade (LGPD)
                  </button>
                </div>
              </div>
            </section>
          )}
          {cookieNotice === 'dismissed' && showBackToTop && (
            <button
              type="button"
              onClick={() => window.scrollTo({top: 0, behavior: 'auto'})}
              aria-label="Voltar ao topo da página"
              className="group pointer-events-auto ml-2 flex size-11 cursor-pointer items-center justify-center rounded-none border border-zinc-200 bg-white/90 text-zinc-800 shadow-lg backdrop-blur-md transition-all hover:bg-white motion-safe:animate-enter sm:ml-0 sm:size-12"
            >
              <ArrowUp aria-hidden="true" size={18} strokeWidth={2.5} className="text-zinc-600 group-hover:text-piramide motion-safe:transition-transform motion-safe:group-hover:-translate-y-0.5" />
            </button>
          )}
        </div>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby="privacy-modal-title"
        onClose={clearPrivacyQuery}
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close()
        }}
        className="fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-2xl overflow-hidden rounded-none border border-zinc-200 bg-white text-zinc-900 shadow-2xl [color-scheme:light] backdrop:bg-black/75 backdrop:backdrop-blur-sm open:flex open:flex-col"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-zinc-200 bg-zinc-50/70 p-6 sm:p-7">
          <div className="space-y-1.5">
            <p className="inline-flex items-center gap-1.5 border border-piramide/20 bg-piramide/10 px-2.5 py-0.5 font-mono text-[11px] font-bold tracking-wider text-piramide uppercase">
              <ShieldCheck aria-hidden="true" size={14} /> LGPD &amp; Transparência
            </p>
            <h2 id="privacy-modal-title" className="text-lg font-bold sm:text-xl">Política de Privacidade e Proteção de Dados</h2>
            <p className="text-xs font-light text-zinc-500">Compromisso com a sua privacidade, transparência e segurança na Pirâmide Imóveis.</p>
          </div>
          <button type="button" onClick={() => dialogRef.current?.close()} aria-label="Fechar" className="shrink-0 cursor-pointer p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900">
            <X aria-hidden="true" size={20} />
          </button>
        </header>

        <div className="min-h-0 space-y-6 overflow-y-auto overscroll-contain p-6 text-xs leading-relaxed font-light text-zinc-600 sm:p-8 sm:text-sm">
          {privacySections.map(([title, body]) => (
            <section key={title} className="space-y-2">
              <h3 className="flex items-center gap-2 font-mono text-xs font-bold tracking-wider text-zinc-900 uppercase">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-piramide" />
                {title}
              </h3>
              <p className="border-l border-zinc-200 pl-3.5">{body}</p>
            </section>
          ))}
        </div>

        <footer className="flex shrink-0 flex-col items-center justify-between gap-3 border-t border-zinc-200 bg-zinc-50/70 p-4 sm:flex-row sm:p-6">
          <button type="button" onClick={() => dialogRef.current?.close()} className="w-full cursor-pointer border border-zinc-300 px-5 py-2.5 font-mono text-xs font-bold tracking-wider text-zinc-700 uppercase transition-colors hover:bg-zinc-100 sm:w-auto">
            Fechar
          </button>
          <a
            href={'https://wa.me/5512991599801?text=' + encodeURIComponent('Olá! Gostaria de falar com o encarregado de atendimento sobre privacidade e dados (LGPD) da Pirâmide Imóveis.')}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 bg-piramide px-5 py-2.5 text-center font-mono text-xs font-bold tracking-wider text-white uppercase shadow-sm transition-colors hover:bg-piramide/90 sm:w-auto"
          >
            <MessageCircle aria-hidden="true" size={16} />
            Falar com o Atendimento no WhatsApp
          </a>
        </footer>
      </dialog>
    </>
  )
}

import Link from 'next/link'
import type {Metadata} from 'next'
import {ArrowUpRight} from 'lucide-react'
import {BackButton} from '../components/backButton'
import {eyebrow, heading, outlineButton, sweepButton, wrap} from '../lib/classes'
import {picture} from '../lib/image'
import {getSiteSettings, isPreview} from '../lib/sanity'

export const metadata: Metadata = {
  title: {absolute: 'Página não encontrada | Pirâmide Imóveis Prime'},
  robots: {index: false, follow: true},
}

export default async function NotFound() {
  const settings = await getSiteSettings(await isPreview())
  const image = settings.homeCta?.image
  return (
    <div className="min-h-dvh bg-paper text-espresso">
      <main id="conteudo" className={wrap + ' grid items-center gap-10 pt-10 pb-12 sm:pt-14 sm:pb-16 lg:min-h-[calc(100dvh-10rem)] lg:grid-cols-[1fr_.9fr] lg:gap-16'}>
        <div className="max-w-[38rem]">
          <p className={eyebrow + ' mb-5 text-piramide'}>Erro 404 · Página não encontrada</p>
          <h1 className={heading + ' text-[clamp(2.5rem,5vw,5rem)]'}>Este endereço não foi encontrado.</h1>
          <p className="mt-6 max-w-[43ch] text-base leading-relaxed text-earth sm:text-lg">
            O link pode estar incorreto ou a página pode ter sido removida. Explore nosso portfólio para encontrar seu próximo imóvel.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/imoveis" className={sweepButton + ' border-piramide bg-piramide px-5 py-3.5 text-sm font-semibold text-white hover:bg-piramide/90'}>
              <span className="relative z-10 inline-flex items-center gap-3">
                Explorar imóveis <ArrowUpRight size={17} aria-hidden="true" />
              </span>
            </Link>
            <Link href="/" className={outlineButton}>Ir para o início</Link>
          </div>
          <div className="mt-7">
            <BackButton />
          </div>
        </div>
        <div className="relative isolate aspect-[1.4] overflow-hidden bg-coal lg:aspect-[.9]" aria-hidden="true">
          {image?.asset && <img src={picture(image, 0.9).src} alt="" className="absolute inset-0 size-full object-cover object-[65%_center]" />}
          <div className="absolute inset-0 bg-linear-to-t from-coal/80 via-transparent to-transparent" />
          <div className="absolute inset-x-6 bottom-6 flex items-end justify-between gap-4 text-white sm:inset-x-8 sm:bottom-8">
            <span className="text-[clamp(5rem,10vw,10rem)] leading-none font-semibold tracking-tighter">404</span>
            <span className="max-w-[12ch] pb-2 text-right text-xs leading-relaxed tracking-wider uppercase">Pirâmide Imóveis Prime</span>
          </div>
        </div>
      </main>
    </div>
  )
}

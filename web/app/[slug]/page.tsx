import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {ArrowUpRight, Check} from 'lucide-react'
import {Header, Footer} from '../../components/chrome'
import {Frame, Gallery, ImmersiveCover, WatchVideo} from '../../components/media'
import {Reveal} from '../../components/motion'
import {WhatsAppWidget} from '../../components/whatsappWidget'
import {button, eyebrow, heading, previewBanner, textLink, wrap} from '../../lib/classes'
import {picture} from '../../lib/image'
import {locationOf, whatsappLink, type Property} from '../../lib/model'
import {getProperty, isPreview} from '../../lib/sanity'

type Props = {params: Promise<{slug: string}>}
const currency = new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'})
const sectionTitle = heading + ' mb-4 text-[clamp(2.1rem,3.5vw,3.6rem)]'
const article = 'pb-[clamp(70px,10vw,120px)]'
const body = wrap + ' mt-12 grid gap-8 border-t border-zinc-200 pt-10'

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug} = await params
  const data = await getProperty(slug, false)
  const property = data?.property
  if (!property) return {robots: {index: false}}
  return {
    title: property.title,
    description: property.summary,
    alternates: {canonical: '/' + slug},
    openGraph: {
      title: property.title,
      description: property.summary,
      url: '/' + slug,
      images: [picture(property.cover, 1200 / 630, 1200).src],
    },
  }
}

function PropertyTitle({property, onCover = false}: {property: Property; onCover?: boolean}) {
  return <><p className={eyebrow + (onCover ? ' text-white' : ' text-piramide')}>{locationOf(property)}</p><h1 className={heading + ' mt-2.5 wrap-anywhere ' + (onCover ? 'text-[clamp(2.5rem,6.5vw,7.5rem)]' : 'text-[clamp(3.3rem,7vw,7.8rem)]')}>{property.title}</h1></>
}

function Attributes({property}: {property: Property}) {
  const attributes = property.attributes || []
  return <ul className="mt-4 flex flex-wrap gap-4">
    {[property.propertyType, ...attributes].filter(Boolean).map((item, index) => <li className="border-b border-piramide/30 pb-2 text-xs text-zinc-700" key={item + index}>{item}</li>)}
  </ul>
}

function Contact({link}: {link: string | null}) {
  if (!link) return null
  return <a className={button + ' border-transparent bg-piramide px-4 text-white hover:bg-piramide/90'} href={link} target="_blank" rel="noreferrer">Falar pelo WhatsApp <ArrowUpRight size={18} /></a>
}

function Terms({property, link}: {property: Property; link: string | null}) {
  return <div className="grid content-start gap-3"><p className="text-[clamp(1.45rem,2.6vw,2.1rem)] leading-tight font-semibold tabular-nums">{property.price ? currency.format(property.price) : 'Valor sob consulta'}</p><Contact link={link} /></div>
}

function Description({property}: {property: Property}) {
  return <section><h2 className={sectionTitle}>Sobre o imóvel</h2><p className="max-w-[70ch] leading-relaxed whitespace-pre-line">{property.description}</p></section>
}

function Features({property}: {property: Property}) {
  if (!property.features?.length) return null
  return <section><h2 className={sectionTitle}>Diferenciais</h2><ul className="grid gap-3">
    {property.features.map((feature, index) => <li className="flex items-center gap-2.5" key={feature + index}><Check className="shrink-0 text-piramide" size={17} />{feature}</li>)}
  </ul></section>
}

function PropertyLayout({property, link}: {property: Property; link: string | null}) {
  const cover = picture(property.cover, 16 / 9, 2400)
  const photos = (property.gallery || []).map((photo) => picture(photo, 1.5))
  const tour = property.tour && <WatchVideo label={property.tourIsPlaceholder ? 'Ver tour demonstrativo' : 'Assistir ao tour'} src={property.tour} poster={cover.src} />
  const clip = property.clip && <WatchVideo label={property.clipIsPlaceholder ? 'Ver clipe demonstrativo' : 'Ver clipe'} src={property.clip} poster={cover.src} />

  switch (property.template) {
    case 'immersive':
      return <article className={article}>
        <ImmersiveCover photo={cover} src={property.clip} placeholder={property.clipIsPlaceholder} header={<Header overlay contact={link} />}>
          <PropertyTitle property={property} onCover />
        </ImmersiveCover>
        <div className={wrap + ' grid items-center gap-6 py-10 min-[801px]:grid-cols-[1.2fr_auto]'}>
          <div><p className="leading-relaxed text-zinc-600">{property.summary}</p><Attributes property={property} /></div>
          <Terms property={property} link={link} />
        </div>
        <Reveal className="group py-[clamp(30px,6vw,76px)]"><div className={wrap}><h2 className={sectionTitle + ' motion-safe:group-data-[entered=true]:animate-enter'}>Galeria</h2><Gallery photos={[cover, ...photos]} layout="strip">{tour}</Gallery></div></Reveal>
        <div className={body}><Description property={property} /><Features property={property} /><Contact link={link} /></div>
      </article>
    case 'mosaic':
      return <article className={article}>
        <div className="relative bg-paper">
          <Header overlay contact={link} />
          <div className="pointer-events-none absolute inset-x-0 top-0 z-2 h-32 bg-[linear-gradient(180deg,#100e0ca6_0%,transparent_100%)]" aria-hidden="true" />
          <div className="[&_[data-gallery=mosaic]>div:last-child]:mt-0 [&_[data-gallery=mosaic]>div:last-child]:bg-paper [&_[data-gallery=mosaic]>div:last-child]:px-5 [&_[data-gallery=mosaic]>div:last-child]:py-4 sm:[&_[data-gallery=mosaic]>div:last-child]:px-9 lg:[&_[data-gallery=mosaic]>div:last-child]:px-14">
            <Gallery photos={[cover, ...photos]} layout="mosaic">{clip}{tour}</Gallery>
          </div>
        </div>
        <div className={wrap}>
          <header className="flex flex-wrap items-end justify-between gap-5 pt-6 pb-8">
            <div><PropertyTitle property={property} /></div>
            <a href="#ficha" className={textLink + ' shrink-0 border-piramide/40 text-piramide hover:border-piramide'}>Detalhes do imóvel <ArrowUpRight size={17} /></a>
          </header>
          <div className="grid scroll-mt-6 gap-8 border-t border-zinc-200 pt-9 min-[801px]:grid-cols-[minmax(0,1.4fr)_minmax(0,.75fr)] xl:gap-14" id="ficha">
            <div className="space-y-9"><Description property={property} /><Features property={property} /></div>
            <aside className="row-start-1 h-fit space-y-3 border border-zinc-200 p-[clamp(20px,3.5vw,48px)] min-[801px]:col-start-2">
              <p className="text-zinc-600">{locationOf(property)}</p><p className="leading-relaxed text-zinc-600">{property.summary}</p><Attributes property={property} />
              <div className="mt-5 border-t border-zinc-200 pt-5"><Terms property={property} link={link} /></div>
            </aside>
          </div>
        </div>
      </article>
    default:
      return <article className={article}>
        <div className="relative">
          <Header overlay splitOverlay contact={link} />
          <div className="grid items-center gap-[clamp(22px,5vw,75px)] min-[801px]:grid-cols-[minmax(0,.88fr)_minmax(0,1.25fr)]">
            <div className="px-5 pt-2 pb-4 sm:px-9 min-[801px]:pt-28 min-[801px]:pr-0 min-[801px]:pb-8 lg:pt-32 lg:pl-14">
              <PropertyTitle property={property} />
              <p className="mt-4 leading-relaxed text-zinc-600">{property.summary}</p>
              <Attributes property={property} />
              <div className="mt-5"><Contact link={link} /></div>
            </div>
            <figure className="relative order-first aspect-[1.04] overflow-hidden bg-coal [clip-path:polygon(0_0,100%_0,100%_90%,90%_100%,0_100%)] after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(180deg,#100e0c7a_0%,transparent_28%)] motion-safe:animate-image-in min-[801px]:order-none min-[801px]:aspect-[1.08] min-[801px]:[clip-path:polygon(7%_0,100%_0,100%_100%,0_100%,0_86%)]">
              <Frame className="size-full object-cover" photo={picture(property.cover, 1.12)} priority sizes="(max-width: 800px) 100vw, 58vw" />
            </figure>
          </div>
        </div>
        <div className="py-[clamp(52px,8vw,110px)]"><Reveal className={wrap + ' motion-safe:data-[entered=true]:animate-enter'}><Description property={property} /></Reveal></div>
        <Reveal className={wrap + ' group pt-[clamp(55px,8vw,120px)]'}><h2 className={sectionTitle + ' motion-safe:group-data-[entered=true]:animate-enter'}>Galeria</h2><Gallery photos={[cover, ...photos]} layout="story">{clip}{tour}</Gallery></Reveal>
        <div className={body}><Features property={property} /><Terms property={property} link={link} /></div>
      </article>
  }
}

export default async function PropertyPage({params}: Props) {
  const {slug} = await params
  const preview = await isPreview()
  const data = await getProperty(slug, preview)
  if (!data?.property) notFound()
  
  const contact = whatsappLink(data.whatsapp, data.property.title)
  return <div className="bg-paper text-zinc-900 [color-scheme:light]">
    {preview && <a className={previewBanner} href="/api/draft-mode/disable">Prévia de rascunhos · Sair</a>}
    <main id="conteudo">

      <PropertyLayout property={data.property} link={contact} />
    </main>
    <Footer light contact={whatsappLink(data.whatsapp)} />
    <WhatsAppWidget phone={data.whatsapp} />
  </div>
}

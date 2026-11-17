import type {Metadata} from 'next'
import Link from 'next/link'
import {notFound} from 'next/navigation'
import {ArrowLeft, ArrowUpRight, Check} from 'lucide-react'
import {Header, Footer} from '../../components/chrome'
import {CoverVideo, Frame, Gallery, WatchVideo} from '../../components/media'
import {Reveal} from '../../components/motion'
import {WhatsAppWidget} from '../../components/whatsappWidget'
import {eyebrow, goldButton, heading, previewBanner, textLink, wrap} from '../../lib/classes'
import {picture} from '../../lib/image'
import {locationOf, whatsappLink, type Property} from '../../lib/model'
import {getProperty, isPreview} from '../../lib/sanity'

type Props = {params: Promise<{slug: string}>}
const currency = new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'})
const sectionTitle = heading + ' mb-4 text-[clamp(2.1rem,3.5vw,3.6rem)]'
const article = 'pb-[clamp(70px,10vw,120px)]'
const body = wrap + ' mt-12 grid gap-8 border-t border-gold/30 pt-10'

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

function PropertyTitle({property}: {property: Property}) {
  return <><p className={eyebrow + ' text-gold'}>{locationOf(property)}</p><h1 className={heading + ' mt-2.5 text-[clamp(3.3rem,7vw,7.8rem)] wrap-anywhere'}>{property.title}</h1></>
}

function Attributes({property}: {property: Property}) {
  const attributes = property.attributes || []
  return <ul className="mt-4 flex flex-wrap gap-4">
    {[property.propertyType, ...attributes].filter(Boolean).map((item, index) => <li className="border-b border-gold/40 pb-2 text-xs" key={item + index}>{item}</li>)}
  </ul>
}

function Contact({link}: {link: string | null}) {
  if (!link) return null
  return <a className={goldButton} href={link} target="_blank" rel="noreferrer">Falar pelo WhatsApp <ArrowUpRight size={18} /></a>
}

function Terms({property, link}: {property: Property; link: string | null}) {
  return <div className="grid content-start gap-3"><p className="text-[clamp(1.45rem,2.6vw,2.1rem)] leading-tight">{property.price ? currency.format(property.price) : 'Valor sob consulta'}</p><Contact link={link} /></div>
}

function Description({property}: {property: Property}) {
  return <section><h2 className={sectionTitle}>Sobre o imóvel</h2><p className="max-w-[70ch] leading-relaxed whitespace-pre-line">{property.description}</p></section>
}

function Features({property}: {property: Property}) {
  if (!property.features?.length) return null
  return <section><h2 className={sectionTitle}>Diferenciais</h2><ul className="grid gap-3">
    {property.features.map((feature, index) => <li className="flex items-center gap-2.5" key={feature + index}><Check className="shrink-0 text-gold" size={17} />{feature}</li>)}
  </ul></section>
}

function PropertyLayout({property, link}: {property: Property; link: string | null}) {
  const cover = picture(property.cover, 16 / 9, 2400)
  const photos = (property.gallery || []).map((photo) => picture(photo, 1.5))
  const tour = property.tour && <WatchVideo label="Assistir ao tour" src={property.tour} poster={cover.src} />
  const clip = property.clip && <WatchVideo label="Ver clipe" src={property.clip} poster={cover.src} />

  switch (property.template) {
    case 'immersive':
      return <article className={article}>
        <div className="relative isolate grid aspect-[5/6] items-end overflow-hidden min-[801px]:aspect-[2/1]">
          <Frame className="absolute inset-0 size-full object-cover motion-safe:animate-image-in" photo={cover} priority />
          {property.clip && <CoverVideo src={property.clip} poster={cover.src} />}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,#100e0cef,transparent_65%)]" />
          <div className={wrap + ' pointer-events-none relative pb-[clamp(48px,7vw,110px)] text-center motion-safe:animate-enter'}><PropertyTitle property={property} /></div>
        </div>
        <div className={wrap + ' grid items-center gap-6 py-10 min-[801px]:grid-cols-[1.2fr_auto]'}>
          <div><p className="leading-relaxed text-muted">{property.summary}</p><Attributes property={property} /></div>
          <Terms property={property} link={link} />
        </div>
        <Reveal className="group bg-charcoal py-[clamp(30px,6vw,76px)]"><div className={wrap}><h2 className={sectionTitle + ' motion-safe:group-data-[entered=true]:animate-enter'}>Galeria</h2><Gallery photos={[cover, ...photos]} layout="strip">{tour}</Gallery></div></Reveal>
        <div className={body}><Description property={property} /><Features property={property} /><Contact link={link} /></div>
      </article>
    case 'mosaic':
      return <article className={article + ' ' + wrap}>
        <header className="flex flex-wrap items-end justify-between gap-5 pt-5 pb-8"><div><PropertyTitle property={property} /></div><a href="#ficha" className={textLink + ' shrink-0 border-gold text-gold'}>Detalhes do imóvel <ArrowUpRight size={17} /></a></header>
        <Gallery photos={[cover, ...photos]} layout="mosaic">{clip}{tour}</Gallery>
        <div className="mt-10 grid scroll-mt-6 gap-8 border-t border-gold/30 pt-9 min-[801px]:grid-cols-[minmax(0,1.4fr)_minmax(0,.75fr)] xl:gap-14" id="ficha">
          <div className="space-y-9"><Description property={property} /><Features property={property} /></div>
          <aside className="row-start-1 h-fit space-y-3 border border-gold/30 bg-charcoal p-[clamp(20px,3.5vw,48px)] min-[801px]:col-start-2">
            <p className="text-muted">{locationOf(property)}</p><p className="leading-relaxed text-muted">{property.summary}</p><Attributes property={property} />
            <div className="mt-5 border-t border-gold/30 pt-5"><Terms property={property} link={link} /></div>
          </aside>
        </div>
      </article>
    default:
      return <article className={article}>
        <div className={wrap + ' grid items-center gap-[clamp(22px,5vw,75px)] pt-5 min-[801px]:grid-cols-[minmax(0,.83fr)_minmax(0,1.3fr)]'}>
          <div className="min-[801px]:pb-8"><PropertyTitle property={property} /><p className="mt-4 leading-relaxed text-muted">{property.summary}</p><Attributes property={property} /><div className="mt-5"><Contact link={link} /></div></div>
          <figure className="aspect-[1.04] overflow-hidden motion-safe:animate-image-in"><Frame className="size-full object-cover" photo={picture(property.cover, 1.12)} priority sizes="(max-width: 800px) 100vw, 58vw" /></figure>
        </div>
        <div className="bg-sand py-[clamp(52px,8vw,110px)] text-espresso"><Reveal className={wrap + ' motion-safe:data-[entered=true]:animate-enter'}><Description property={property} /></Reveal></div>
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
  return <>
    {preview && <a className={previewBanner} href="/api/draft-mode/disable">Prévia de rascunhos · Sair</a>}
    <Header contact={whatsappLink(data.whatsapp, data.property.title)} />
    <main id="conteudo">
      <div className={wrap + ' py-5'}><Link className="inline-flex items-center gap-2.5 text-sm text-muted hover:text-gold" href="/#empreendimentos"><ArrowLeft size={16} /> Empreendimentos</Link></div>
      <PropertyLayout property={data.property} link={whatsappLink(data.whatsapp, data.property.title)} />
    </main>
    <Footer contact={whatsappLink(data.whatsapp)} />
    <WhatsAppWidget phone={data.whatsapp} />
  </>
}

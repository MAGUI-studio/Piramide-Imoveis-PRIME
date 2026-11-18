import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Catalog } from '../components/catalog'
import { Footer, Header } from '../components/chrome'
import { Hero } from '../components/hero'
import { Frame } from '../components/media'
import { Reveal } from '../components/motion'
import { ScrollSpy } from '../components/scrollSpy'
import { FinalCta, Lifestyle, ValueProposition, type LifestyleItem } from '../components/sections'
import { WhatsAppWidget } from '../components/whatsappWidget'
import { eyebrow, heading, previewBanner, textLink, wrap } from '../lib/classes'
import { catalogPictures, picture } from '../lib/image'
import { locationOf, whatsappLink } from '../lib/model'
import { getHome, getOpeningProperties, isPreview } from '../lib/sanity'

export async function generateMetadata(): Promise<Metadata> {
  const data = await getHome(false)
  const [hero] = getOpeningProperties(data)
  return {
    alternates: { canonical: '/' },
    openGraph: { url: '/', images: hero ? [picture(hero.cover, 1200 / 630, 1200).src] : undefined },
  }
}

export default async function Home() {
  const preview = await isPreview()
  const data = await getHome(preview)
  const [hero, ...otherSlides] = getOpeningProperties(data).map((item) => ({
    slug: item.slug,
    title: item.title,
    summary: item.summary,
    specifications: item.specifications,
    location: locationOf(item),
    photo: picture(item.cover, 16 / 9, 2400),
  }))
  const featured = (data.featured || []).filter((item) => item?.slug && item.cover && item.slug !== hero?.slug)
  const contact = whatsappLink(data.whatsapp)

  const lifestyleMap = new Map<string, LifestyleItem>()
  for (const item of data.catalog) {
    if (item.propertyType) {
      const entry = lifestyleMap.get(item.propertyType)
      if (entry) entry.count++
      else lifestyleMap.set(item.propertyType, { type: item.propertyType, count: 1, image: picture(item.cover, 3 / 4, 900) })
    }
  }
  const lifestyle = [...lifestyleMap.values()].sort((a, b) => b.count - a.count)
  const ctaImage = data.catalog[0] ? picture(data.catalog[0].cover, 16 / 9, 2000) : undefined
  return <>
    {preview && <a className={previewBanner} href="/api/draft-mode/disable">Prévia de rascunhos · Sair</a>}
    {!hero && <Header home light contact={contact} />}
    <main id="conteudo" className="bg-paper text-espresso [color-scheme:light]">
      {hero ? <div id="inicio" className="relative"><Header home overlay contact={contact} /><Hero items={[hero, ...otherSlides]} /></div> :
        <section id={data.catalog.length ? 'inicio' : 'empreendimentos'} className={wrap + ' py-[clamp(85px,12vw,170px)]'}>
          <h1 className={heading + ' text-[clamp(3.5rem,7vw,8rem)]'}>Empreendimentos de alto padrão</h1>
          <p className="mt-6 text-earth">Nenhum empreendimento disponível no momento.</p>
        </section>}
      <Lifestyle items={lifestyle} />
      {hero && <ValueProposition />}
      {!!featured.length && <section id="destaques" className={wrap + ' pt-[clamp(44px,6vw,88px)] pb-[clamp(48px,8vw,124px)]'} aria-labelledby="titulo-destaques">
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4 border-t border-rule pt-6 md:mb-12">
          <div>
            <p className={eyebrow + ' mb-2 text-[.68rem] text-piramide'}>Seleção exclusiva</p>
            <h2 className={heading + ' text-[clamp(2.8rem,5vw,5.6rem)]'} id="titulo-destaques">Em destaque</h2>
          </div>
          <a className={textLink + ' border-piramide text-piramide hover:opacity-80'} href="#empreendimentos">Ver o catálogo <ArrowUpRight size={16} /></a>
        </div>
        <div className="space-y-[clamp(38px,7vw,105px)]">
          {featured.map((item, index) => <Reveal className={'group grid items-center gap-[clamp(24px,6vw,104px)] ' + (index % 2 ? 'min-[801px]:grid-cols-[.8fr_1.65fr]' : 'min-[801px]:grid-cols-[1.65fr_.8fr]')} key={item.id}>
            <Link className={'group/photo block aspect-[1.45] overflow-hidden ' + (index % 2 ? 'min-[801px]:col-start-2 min-[801px]:row-start-1' : '')} href={'/' + item.slug} aria-label={'Ver ' + item.title}>
              <Frame className="size-full object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover/photo:scale-105" photo={picture(item.cover, 1.45, 1600)} sizes="(max-width: 800px) 100vw, 65vw" />
            </Link>
            <div className={'motion-safe:group-data-[entered=true]:animate-enter ' + (index % 2 ? 'min-[801px]:col-start-1 min-[801px]:row-start-1' : '')}>
              <p className={eyebrow + ' text-piramide'}>{locationOf(item)}</p>
              <h3 className={heading + ' my-3 text-[clamp(2.75rem,5vw,6rem)]'}>{item.title}</h3>
              <p className="max-w-[42ch] leading-relaxed text-earth">{item.summary}</p>
              <Link className={textLink + ' mt-6 border-piramide text-piramide hover:opacity-80'} href={'/' + item.slug}>Ver empreendimento <ArrowUpRight size={17} /></Link>
            </div>
          </Reveal>)}
        </div>
      </section>}
      {!!data.catalog.length && <Catalog items={data.catalog.map(catalogPictures)} />}
    </main>
    <ScrollSpy containerId="conteudo" finalSectionId="contato" />
    <Footer contact={contact}>
      {hero && <FinalCta image={ctaImage} contact={contact} marquee={data.marquee} />}
    </Footer>
    <WhatsAppWidget phone={data.whatsapp} />
  </>
}

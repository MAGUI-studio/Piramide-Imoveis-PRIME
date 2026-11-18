import type {ReactNode} from 'react'
import {CinemaIcon} from './cinemaIcon'
import {FaqAccordion, Frame, InlineVideoTour, WatchVideo, type StoryVideo} from './media'
import {eyebrow, heading, wrap} from '../lib/classes'
import {picture, type Picture} from '../lib/image'
import type {Property} from '../lib/model'

const title = heading + ' text-[clamp(1.75rem,3.2vw,3rem)]'

export type {StoryVideo} from './media'

export function propertyVideos(property: Property, cover: Picture) {
  const gallery = property.videoGallery ?? []
  const opening = gallery.find((video) => video.opening) ?? gallery[0]
  const resolve = (video: (typeof gallery)[number]): StoryVideo => ({
    url: video.url,
    title: video.title,
    poster: video.poster?.asset ? picture(video.poster, 16 / 9, 1600) : cover,
  })
  const videos = new Map<string, StoryVideo>()
  const add = (url: string | null | undefined, label: string, external?: boolean) => {
    if (url && !videos.has(url)) videos.set(url, {url, title: label, poster: cover, external})
  }
  if (property.template === 'immersive') {
    if (opening) videos.set(opening.url, resolve(opening))
    add(property.clip, 'Clipe de abertura')
  }
  add(property.tour, 'Tour do imóvel')
  for (const video of gallery) {
    if (!videos.has(video.url)) videos.set(video.url, resolve(video))
  }
  add(property.externalVideoUrl, 'Vídeo completo', true)
  add(property.clip, 'Clipe de abertura')
  return {openingUrl: opening?.url ?? property.clip ?? property.tour, videos: [...videos.values()]}
}

export function VideoFrame({video}: {video: StoryVideo}) {
  return (
    <div className="relative isolate flex aspect-video min-w-0 items-end overflow-hidden bg-zinc-200 p-3 sm:p-5">
      <Frame className="absolute inset-0 -z-20 size-full object-cover" photo={video.poster} sizes="(max-width: 767px) 100vw, 55vw" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-linear-to-t from-black/45 to-transparent" />
      <WatchVideo src={video.url} label={video.title} poster={video.poster.src} external={video.external} glassActions />
    </div>
  )
}

export function VideoTour({videos, virtualTour, leadPhoto}: {videos: StoryVideo[]; virtualTour?: ReactNode; leadPhoto?: Picture}) {
  const [lead, ...chapters] = videos
  if (!lead && !virtualTour) return null
  return (
    <section className={wrap} aria-label="Vídeos do imóvel">
      {lead ? (
        <InlineVideoTour videos={leadPhoto ? [{...lead, poster: leadPhoto}, ...chapters] : videos} virtualTour={virtualTour} />
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-4">
          {virtualTour}
        </div>
      )}
    </section>
  )
}

export function PropertyFAQ({property, layout}: {property: Property; layout: 'film' | 'essay' | 'standard'}) {
  const entries = property.faq?.filter(({question, answer}) => question.trim() && answer.trim()) ?? []
  if (!entries.length) return null

  const standard = layout === 'standard'
  return (
    <section
      id="duvidas"
      aria-labelledby="property-faq"
      className={'grid scroll-mt-6 gap-6 lg:grid-cols-[minmax(0,.42fr)_minmax(0,1fr)] lg:items-start lg:gap-14 ' + (standard ? 'bg-white/65 p-[clamp(1.25rem,4vw,3rem)]' : '')}
    >
      <div>
        <p className={eyebrow + ' text-[.68rem] text-piramide'}>Tire suas dúvidas</p>
        <h2 id="property-faq" className={heading + ' mt-2 text-[clamp(1.75rem,3vw,2.75rem)]'}>Perguntas frequentes</h2>
      </div>
      <FaqAccordion entries={entries} />
    </section>
  )
}

export function StoryBackdrop({photo, property}: {photo: Picture; property: Property}) {
  return (
    <section aria-labelledby="property-story-title">
      <figure className="relative min-h-[clamp(22rem,51vw,48rem)] bg-zinc-200">
        <Frame className="absolute inset-0 size-full object-cover" photo={photo} />
        {photo.caption && <figcaption className="absolute bottom-4 start-4 max-w-[calc(100%-2rem)] bg-paper/90 px-3 py-2 text-xs text-zinc-800 backdrop-blur-md sm:bottom-6 sm:start-6">{photo.caption}</figcaption>}
      </figure>
      <div className={wrap + ' grid gap-4 pt-7 sm:pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-12'}>
        <h2 id="property-story-title" className={title}>Sobre o imóvel</h2>
        <p className="max-w-[65ch] text-base leading-[1.85] whitespace-pre-line text-zinc-700">{property.description}</p>
      </div>
    </section>
  )
}

export function PropertyContact({link, listing, layout}: {link: string | null; listing?: string | null; layout: 'film' | 'essay' | 'standard'}) {
  if (!link && !listing) return null
  const contactStyle = {
    film: 'flex flex-wrap items-center justify-between gap-5 bg-zinc-100 p-5 sm:p-7',
    essay: 'grid justify-items-start gap-4 border-t border-zinc-300/70 pt-7',
    standard: 'flex flex-wrap items-center justify-between gap-5 bg-white/70 p-[clamp(1.25rem,4vw,3rem)]',
  }
  return (
    <section className={contactStyle[layout]} aria-labelledby="property-contact">
      <h2 id="property-contact" className={heading + ' text-2xl'}>{layout === 'film' ? 'Conheça pessoalmente' : layout === 'essay' ? 'Converse sobre o imóvel' : 'Fale com a Pirâmide'}</h2>
      <div className="flex flex-wrap items-center gap-3">
        {link && <a className="inline-flex min-h-11 items-center gap-2.5 bg-piramide px-4 py-2 text-sm font-semibold text-white hover:bg-piramide/90" href={link} target="_blank" rel="noopener noreferrer">Falar com especialista <CinemaIcon name="external" /></a>}
        {listing && <a className="inline-flex min-h-11 items-center gap-2.5 border border-zinc-300 px-4 py-2 text-sm font-semibold hover:border-piramide" href={listing} target="_blank" rel="noopener noreferrer">Ver anúncio <CinemaIcon name="external" /></a>}
      </div>
    </section>
  )
}

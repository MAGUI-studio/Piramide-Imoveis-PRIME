import type {ReactNode} from 'react'
import {ArrowUpRight} from 'lucide-react'
import {CinemaIcon} from './cinemaIcon'
import {FaqAccordion, Frame, InlineVideoTour, WatchVideo, type StoryVideo} from './media'
import {eyebrow, heading, sweepButton, sweepFill, wrap} from '../lib/classes'
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
    <div className="group relative isolate flex aspect-video min-w-0 items-end overflow-hidden bg-zinc-200 p-4 sm:p-6">
      <Frame className="absolute inset-0 -z-20 size-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105" photo={video.poster} sizes="(max-width: 767px) 100vw, 55vw" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
      <div className="flex w-full flex-wrap items-end justify-between gap-3">
        <div>
          <p className={eyebrow + ' text-[.65rem] text-white/75'}>Vídeo em destaque</p>
          <p className={heading + ' mt-1 text-lg text-white sm:text-xl'}>{video.title}</p>
        </div>
        <WatchVideo src={video.url} label="Assistir vídeo" poster={video.poster.src} external={video.external} glassActions />
      </div>
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

export function PropertyFAQ({property}: {property: Property; layout: 'film' | 'essay' | 'standard'}) {
  const entries = property.faq?.filter(({question, answer}) => question.trim() && answer.trim()) ?? []
  if (!entries.length) return null

  return (
    <section
      id="duvidas"
      aria-labelledby="property-faq"
      className="grid scroll-mt-6 gap-6 lg:grid-cols-[minmax(0,.42fr)_minmax(0,1fr)] lg:items-start lg:gap-14"
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
      <div className={wrap + ' grid gap-6 border-b border-zinc-300/75 py-10 sm:py-14 lg:grid-cols-[minmax(0,.42fr)_minmax(0,1fr)] lg:items-start lg:gap-14'}>
        <div>
          <p className={eyebrow + ' text-[.68rem] text-piramide'}>Apresentação</p>
          <h2 id="property-story-title" className={title + ' mt-2'}>Sobre o imóvel</h2>
        </div>
        <p className="max-w-[65ch] text-base leading-[1.85] whitespace-pre-line text-zinc-700 sm:text-[1.0625rem]">{property.description}</p>
      </div>
    </section>
  )
}

export function PropertyContact({link, listing}: {link: string | null; listing?: string | null; layout: 'film' | 'essay' | 'standard'}) {
  if (!link && !listing) return null
  return (
    <section
      className="grid gap-6 border-t border-zinc-300/75 pt-10 sm:pt-12 lg:grid-cols-[minmax(0,.42fr)_minmax(0,1fr)] lg:items-start lg:gap-14"
      aria-labelledby="property-contact"
    >
      <div>
        <p className={eyebrow + ' text-[.68rem] text-piramide'}>Atendimento exclusivo</p>
        <h2 id="property-contact" className={heading + ' mt-2 text-[clamp(1.75rem,3vw,2.75rem)]'}>
          Fale com um especialista
        </h2>
      </div>
      <div className="max-w-[58ch]">
        <p className="text-base leading-[1.8] text-zinc-600 sm:text-[1.0625rem]">
          Entre em contato com a equipe da Pirâmide PRIME para tirar dúvidas, solicitar mais informações ou conversar sobre as condições deste imóvel.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3.5">
          {link && (
            <a
              className={sweepButton + ' border-zinc-900/30 bg-white/80 px-5 py-3 text-sm font-medium text-zinc-900'}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span aria-hidden="true" className={sweepFill} />
              <span className="pointer-events-none relative z-10 inline-flex items-center gap-2.5 transition-colors duration-300 group-hover/cta:text-white group-focus-visible/cta:text-white motion-reduce:transition-none">
                Falar pelo WhatsApp <ArrowUpRight size={17} className="transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5 motion-reduce:transition-none" />
              </span>
            </a>
          )}
          {listing && (
            <a
              className={sweepButton + ' border-zinc-900/30 bg-transparent px-5 py-3 text-sm font-medium text-zinc-900'}
              href={listing}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span aria-hidden="true" className={sweepFill} />
              <span className="pointer-events-none relative z-10 inline-flex items-center gap-2.5 transition-colors duration-300 group-hover/cta:text-white group-focus-visible/cta:text-white motion-reduce:transition-none">
                Ver no site da Pirâmide <ArrowUpRight size={17} className="transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5 motion-reduce:transition-none" />
              </span>
            </a>
          )}
        </div>
      </div>
    </section>
  )
}

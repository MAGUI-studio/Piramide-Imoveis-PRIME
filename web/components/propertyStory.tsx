import {getSiteSettings, isPreview} from '../lib/sanity'
import type {ReactNode} from 'react'
import {ArrowUpRight} from 'lucide-react'
import {CinemaIcon} from './cinemaIcon'
import {FaqAccordion, Frame, InlineVideoTour, WatchVideo, type StoryVideo} from './media'
import {sweepRegular, sweepSolid, sweepContent, eyebrow, heading, sweepButton, sweepFill, sweepOnCover, wrap} from '../lib/classes'
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

export function PropertyFAQ({property}: {property: Property}) {
  const entries = property.faq?.filter(({question, answer}) => question.trim() && answer.trim()) ?? []
  if (!entries.length) return null

  return (
    <section
      id="duvidas"
      aria-labelledby="property-faq"
      className="w-full scroll-mt-6"
    >
      <h2 id="property-faq" className={heading + ' mb-6 text-center text-[clamp(1.85rem,4vw,3.25rem)] text-espresso sm:mb-9'}>Perguntas frequentes</h2>
      <FaqAccordion entries={entries} />
    </section>
  )
}

export function StoryBackdrop({photo, property}: {photo: Picture; property: Property}) {
  return (
    <section className="bg-coal text-ivory" aria-labelledby="property-story-title">
      <figure className="relative min-h-[clamp(22rem,51vw,48rem)] bg-zinc-900">
        <Frame className="absolute inset-0 size-full object-cover" photo={photo} />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-coal via-coal/65 to-transparent" />
        {photo.caption && <figcaption className="absolute bottom-4 start-4 z-1 max-w-[calc(100%-2rem)] border border-white/15 bg-coal/85 px-3 py-2 text-xs text-ivory backdrop-blur-md sm:bottom-6 sm:start-6">{photo.caption}</figcaption>}
      </figure>
      <div className={wrap + ' grid gap-6 py-12 sm:py-16 lg:grid-cols-[minmax(0,.42fr)_minmax(0,1fr)] lg:items-start lg:gap-14'}>
        <div>
          <p className={eyebrow + ' text-[.68rem] text-piramide'}>Apresentação</p>
          <h2 id="property-story-title" className={title + ' mt-2 text-ivory'}>Sobre o imóvel</h2>
        </div>
        <p className="max-w-[65ch] text-base leading-[1.85] whitespace-pre-line text-ivory/80 sm:text-[1.0625rem]">{property.description}</p>
      </div>
    </section>
  )
}

export async function PropertyContact({link, listing}: {link: string | null; listing?: string | null}) {
  const content = (await getSiteSettings(await isPreview())).propertyCta
  if (!content?.title || (!link && !listing)) return null
  return (
    <section
      className="relative isolate overflow-hidden bg-coal text-ivory"
      aria-labelledby="property-contact"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {content.image?.asset && <Frame photo={picture(content.image, 16 / 9)} className="size-full object-cover object-[65%_center] opacity-30 md:opacity-65" />}
        <div className="absolute inset-0 bg-linear-to-b from-coal via-transparent to-coal" />
        <div className="absolute inset-0 hidden bg-linear-to-r from-coal via-coal/65 to-transparent md:block" />
      </div>
      <div className={wrap + ' flex min-h-[24rem] flex-col items-start justify-center py-16 md:min-h-[29rem]'}>
        <p className={eyebrow + ' text-ivory/75'}>{content.eyebrow}</p>
        <h2 id="property-contact" className={heading + ' mt-4 max-w-[16ch] text-[clamp(2.4rem,5.6vw,5.5rem)]'}>
          {content.title}
        </h2>
        <p className="mt-5 max-w-[48ch] text-base leading-relaxed text-ivory/90 sm:text-lg">
          {content.description}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3.5">
          {link && content.buttonLabel && (
            <a
              className={sweepButton + sweepRegular + ' ' + sweepSolid}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span aria-hidden="true" className={sweepFill} />
              <span className={sweepContent}>
                {content.buttonLabel} <ArrowUpRight size={17} className="transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5 motion-reduce:transition-none" />
              </span>
            </a>
          )}
          {listing && content.secondaryLabel && (
            <a
              className={sweepButton + sweepRegular + ' ' + sweepOnCover}
              href={listing}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span aria-hidden="true" className={sweepFill} />
              <span className={sweepContent}>
                {content.secondaryLabel} <ArrowUpRight size={17} className="transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5 motion-reduce:transition-none" />
              </span>
            </a>
          )}
        </div>
      </div>
    </section>
  )
}

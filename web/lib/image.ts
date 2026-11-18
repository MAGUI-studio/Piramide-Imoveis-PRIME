import imageUrlBuilder from '@sanity/image-url'
import type {Photo, PropertyCard} from './model'

export function photoUrl(photo: Photo, width: number, aspect: number, projectId?: string, dataset = 'production') {
  if (!projectId || !photo.asset) return ''
  return imageUrlBuilder({projectId, dataset}).image(photo).width(width).height(Math.round(width / aspect)).auto('format').quality(82).url()
}

export type Picture = {alt: string; caption?: string; src: string; srcSet?: string}

export function picture(photo: Photo, aspect: number, width = 1920): Picture {
  const variants = [480, 800, 1200, 1600, 1920, 2400].filter((size) => size < width).concat(width)
  const url = (size: number) => photoUrl(photo, size, aspect, process.env.SANITY_PROJECT_ID, process.env.SANITY_DATASET)
  return {
    alt: photo.alt || '',
    caption: photo.caption?.trim(),
    src: url(width),
    srcSet: variants.map((size) => url(size) + ' ' + size + 'w').join(', '),
  }
}

export function catalogPictures({cover, alternate, ...item}: PropertyCard & {alternate?: Photo | null}) {
  return {
    ...item,
    image: picture(cover, 1.38, 1600),
    alternate: alternate ? picture(alternate, 1.38, 1200) : undefined,
  }
}

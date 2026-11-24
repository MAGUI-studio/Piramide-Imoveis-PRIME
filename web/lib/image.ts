import imageUrlBuilder from '@sanity/image-url'
import type {Photo, PropertyCard, Reel, ReelItem} from './model'
import {safeExternalUrl} from './siteSettings'

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

export function reelPictures({thumbnail, relatedListing, ...reel}: Reel): ReelItem {
  const thumb = thumbnail?.asset
    ? photoUrl(thumbnail, 600, 9 / 16, process.env.SANITY_PROJECT_ID, process.env.SANITY_DATASET) || null
    : null
  const poster = thumbnail?.asset
    ? photoUrl(thumbnail, 720, 9 / 16, process.env.SANITY_PROJECT_ID, process.env.SANITY_DATASET) || null
    : null

  let listingHref: string | null = null
  let listingLabel: string | null = null
  let listingIsInternal = false

  if (relatedListing?.slug) {
    if (relatedListing._type === 'property') {
      listingHref = '/imoveis/' + encodeURIComponent(relatedListing.slug)
      listingLabel = 'Ver Imóvel'
      listingIsInternal = true
    } else if (relatedListing._type === 'condominium') {
      listingHref = '/condominios/' + encodeURIComponent(relatedListing.slug)
      listingLabel = 'Ver Condomínio'
      listingIsInternal = true
    }
  } else {
    const externalHref = safeExternalUrl(reel.propertyUrl)
    if (externalHref) {
      listingHref = externalHref
      listingLabel = 'Ver Imóvel no Site'
      listingIsInternal = false
    }
  }

  return {
    ...reel,
    propertyTitle: reel.propertyTitle?.trim() || relatedListing?.title?.trim() || null,
    thumbnailUrl: thumb,
    posterUrl: poster,
    listingHref,
    listingLabel,
    listingIsInternal,
  }
}

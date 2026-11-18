import {createClient, type QueryParams} from '@sanity/client'
import {draftMode} from 'next/headers'
import {cache} from 'react'
import type {HomeStat, MarqueeItem, Photo, Property, PropertyCard} from './model'

const projectId = process.env.SANITY_PROJECT_ID
export const dataset = process.env.SANITY_DATASET || 'production'
export const client = projectId ? createClient({
  projectId, dataset, apiVersion: '2026-02-01',
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
}) : null

async function read<T>(query: string, params: QueryParams = {}, preview = false) {
  if (!client) return null
  return client.fetch<T>(query, params, {
    perspective: preview ? 'drafts' : 'published',
    cache: 'no-store',
  })
}

const cardFields = `
  "id": _id, title, refCode, "slug": slug.current, propertyType, condominiumName,
  availability, price, conditions, summary, attributes, cover, specifications,
  "createdAt": _createdAt,
  "city": neighborhood->city->{"id": _id, name},
  "neighborhood": neighborhood->{"id": _id, name}
`
const mediaFields = 'gallery, "clip": clip.asset->url'
const listing = '_type == "property" && defined(slug.current) && defined(cover.asset)'
type CatalogProperty = PropertyCard & {alternate?: Photo | null}
type Home = {hero: PropertyCard | null; featured: PropertyCard[]; catalog: CatalogProperty[]; whatsapp: string | null; marquee: MarqueeItem[]; stats: HomeStat[]}
const homeQuery = `{
  "hero": *[_id == "primeHome"][0].hero->{
    ${cardFields}
  },
  "featured": *[_id == "primeHome"][0].featured[]->{${cardFields}},
  "catalog": *[${listing}] | order(select(availability == "sold" => 1, 0) asc, coalesce(firstPublishedAt, _createdAt) desc, title asc, _id asc) {
    ${cardFields}, "alternate": gallery[defined(asset) && asset._ref != ^.cover.asset._ref][0]
  },
  "whatsapp": *[_id == "primeHome"][0].whatsapp,
  "stats": coalesce(*[_id == "primeHome"][0].stats[defined(label) && defined(value)]{_key, label, value, prefix, suffix}, []),
  "marquee": coalesce(*[_id == "primeMarquee"][0].items[defined(title) && defined(description)]{_key, title, description}, [])
}`
const propertyQuery = `{
  "property": *[${listing} && slug.current == $slug][0]{
    ${cardFields}, ${mediaFields}, architect, description, features, condoFeatures,
    sectionPhoto, detailsPhoto,
    "detailsPhotos": select(defined(detailsPhoto[0]) => detailsPhoto, defined(detailsPhoto.asset) => [detailsPhoto], []),
    mediaPhoto, mediaVideoPhoto, videoTourPhoto,
    faq[defined(question) && defined(answer)]{_key, question, answer},
    videoGallery[defined(file.asset->url)]{_key, title, opening, poster, "url": file.asset->url},
    condoFee, iptu, externalListingUrl, externalVideoUrl, virtualTourUrl, template,
    address{street, number, complement, state, postalCode, point{lat, lng}, approximate},
    "tour": tour.asset->url
  },
  "whatsapp": *[_id == "primeHome"][0].whatsapp
}`

export const getHome = cache(async (preview: boolean): Promise<Home> => {
  return await read<Home>(homeQuery, {}, preview) || {hero: null, featured: [], catalog: [], whatsapp: null, marquee: [], stats: []}
})

export const getProperty = cache(async (slug: string, preview: boolean) => {
  return await read<{property: Property | null; whatsapp: string | null}>(propertyQuery, {slug}, preview)
})

export function getOpeningProperties(data: Home) {
  const unique = new Map<string, PropertyCard>()
  const pool = [data.hero, ...(data.featured || []), ...data.catalog]
  for (const entry of pool) {
    if (entry?.slug && entry.cover && entry.availability !== 'sold' && !unique.has(entry.slug)) unique.set(entry.slug, entry)
    if (unique.size === 3) break
  }
  if (unique.size < 3) {
    for (const entry of pool) {
      if (entry?.slug && entry.cover && !unique.has(entry.slug)) unique.set(entry.slug, entry)
      if (unique.size === 3) break
    }
  }
  return [...unique.values()]
}

export async function getPublishedSlugs() {
  return await read<{slug: string; updated: string}[]>(
    `*[${listing}]{"slug": slug.current, "updated": _updatedAt}`,
  ) || []
}

export async function isPreview() {
  return !!process.env.SANITY_API_READ_TOKEN && (await draftMode()).isEnabled
}

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://prime.piramideimoveissjc.com.br'

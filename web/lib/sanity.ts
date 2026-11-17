import {createClient, type QueryParams} from '@sanity/client'
import {draftMode} from 'next/headers'
import {cache} from 'react'
import type {Photo, Property, PropertyCard} from './model'

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
  "id": _id, title, "slug": slug.current, propertyType, summary, attributes, cover, specifications,
  "createdAt": _createdAt,
  "city": neighborhood->city->{"id": _id, name},
  "neighborhood": neighborhood->{"id": _id, name}
`
const mediaFields = 'gallery, "clip": clip.asset->url'
const listing = '_type == "property" && defined(slug.current) && defined(cover.asset)'
type CatalogProperty = PropertyCard & {alternate?: Photo | null}
type Home = {hero: PropertyCard | null; featured: PropertyCard[]; catalog: CatalogProperty[]; whatsapp: string | null}
const homeQuery = `{
  "hero": *[_id == "primeHome"][0].hero->{
    ${cardFields}
  },
  "featured": *[_id == "primeHome"][0].featured[]->{${cardFields}},
  "catalog": *[${listing}] | order(coalesce(firstPublishedAt, _createdAt) desc, title asc, _id asc) {
    ${cardFields}, "alternate": gallery[defined(asset) && asset._ref != ^.cover.asset._ref][0]
  },
  "whatsapp": *[_id == "primeHome"][0].whatsapp
}`
const propertyQuery = `{
  "property": *[${listing} && slug.current == $slug][0]{
    ${cardFields}, ${mediaFields}, description, features, price, template, "tour": tour.asset->url
  },
  "whatsapp": *[_id == "primeHome"][0].whatsapp
}`

export const getHome = cache(async (preview: boolean): Promise<Home> => {
  return await read<Home>(homeQuery, {}, preview) || {hero: null, featured: [], catalog: [], whatsapp: null}
})

export const getProperty = cache(async (slug: string, preview: boolean) => {
  return await read<{property: Property | null; whatsapp: string | null}>(propertyQuery, {slug}, preview)
})

export function getOpeningProperties(data: Home) {
  const unique = new Map<string, PropertyCard>()
  for (const entry of [data.hero, ...(data.featured || []), ...data.catalog]) {
    if (entry?.slug && entry.cover && !unique.has(entry.slug)) unique.set(entry.slug, entry)
    if (unique.size === 3) break
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

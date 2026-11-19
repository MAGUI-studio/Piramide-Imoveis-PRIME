import {selectHomeProperties} from './homeSelections'
import type {SiteSettings} from './siteSettings'
import {createClient, type QueryParams} from '@sanity/client'
import {draftMode} from 'next/headers'
import {cache} from 'react'
import type {Condominium, HomeBanner, HomeStat, MarqueeItem, Photo, Property, PropertyCard, PropertyTypeOption, Seo} from './model'

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
  "id": _id, title, refCode, "slug": slug.current, propertyType, "condominiumName": coalesce(condominium->name, condominiumName),
  "condominium": condominium->{"id": _id, name, "slug": slug.current},
  availability, price, rentPrice, conditions, summary, attributes, cover, specifications,
  "createdAt": _createdAt,
  "city": neighborhood->city->{"id": _id, name},
  "neighborhood": neighborhood->{"id": _id, name}
`
const mediaFields = 'gallery, "clip": clip.asset->url'
const listing = '_type == "property" && defined(slug.current) && defined(cover.asset)'
type CatalogProperty = PropertyCard & {alternate?: Photo | null; coverOriginalFilename?: string | null}
type Home = {propertyTypeOrder?: (string | null)[]; banners: HomeBanner[]; heroSlides?: (PropertyCard | null)[] | null; homeSelection?: (CatalogProperty | null)[] | null; hero: PropertyCard | null; featured: CatalogProperty[]; catalog: CatalogProperty[]; propertyTypes: PropertyTypeOption[]; whatsapp: string | null; marquee: MarqueeItem[]; stats: HomeStat[]; homeSeo?: Seo | null; catalogSeo?: Seo | null}
const homeQuery = `{
  "propertyTypeOrder": coalesce(*[_id == "primeHome"][0].propertyTypeOrder[]->name, []),
  "banners": coalesce(*[_id == "primeHome"][0].banners[defined(image.asset) && defined(href)]{_key,title,image,href,newTab}, []),
  "heroSlides": *[_id == "primeHome"][0].heroSlides[]->{${cardFields}},
  "homeSelection": *[_id == "primeHome"][0].homeSelection[]->{
    ${cardFields},
    "alternate": gallery[defined(asset) && asset._ref != ^.cover.asset._ref][0]
  },
  "hero": *[_id == "primeHome"][0].hero->{
    ${cardFields}
  },
  "featured": *[_id == "primeHome"][0].featured[]->{
    ${cardFields},
    "alternate": gallery[defined(asset) && asset._ref != ^.cover.asset._ref][0]
  },
  "catalog": *[${listing}] | order(select(availability == "sold" => 1, 0) asc, coalesce(firstPublishedAt, _createdAt) desc, title asc, _id asc) {
    ${cardFields},
    "coverOriginalFilename": cover.asset->originalFilename,
    "alternate": gallery[defined(asset) && asset._ref != ^.cover.asset._ref][0]
  },
  "propertyTypes": coalesce(*[_type == "propertyTypeOption" && defined(name)] | order(name asc) {"id": _id, name, image}, []),
  "whatsapp": *[_id == "primeSiteSettings"][0].organization.commercialPhone,
  "homeSeo": *[_id == "primeHome"][0].homeSeo,
  "catalogSeo": *[_id == "primeHome"][0].catalogSeo,
  "stats": coalesce(*[_id == "primeHome"][0].stats[defined(label) && defined(value)]{_key, label, value, prefix, suffix}, []),
  "marquee": coalesce(*[_id == "primeHome"][0].marquee, *[_id == "primeMarquee"][0].items, [])[defined(title) && defined(description)]{_key, title, description}
}`
const propertyQuery = `{
  "property": *[${listing} && slug.current == $slug][0]{
    ${cardFields}, ${mediaFields}, architect, description, features, condoFeatures, seo, noIndex,
    customFacts[]{_key,label,value},
    sectionPhoto, detailsPhoto,
    "detailsPhotos": select(defined(detailsPhoto[0]) => detailsPhoto, defined(detailsPhoto.asset) => [detailsPhoto], []),
    mediaPhoto, mediaVideoPhoto, videoTourPhoto,
    faq[defined(question) && defined(answer)]{_key, question, answer},
    videoGallery[defined(file.asset->url)]{_key, title, opening, poster, "url": file.asset->url},
    condoFee, iptu, externalListingUrl, externalVideoUrl, virtualTourUrl, template,
    address{street, number, complement, state, postalCode, point{lat, lng}, approximate},
    "tour": tour.asset->url
  },
  "whatsapp": *[_id == "primeSiteSettings"][0].organization.commercialPhone
}`

export const getHome = cache(async (preview: boolean): Promise<Home> => {
  return await read<Home>(homeQuery, {}, preview) || {banners: [], hero: null, featured: [], catalog: [], propertyTypes: [], whatsapp: null, marquee: [], stats: []}
})

export const getProperty = cache(async (slug: string, preview: boolean) => {
  return await read<{property: Property | null; whatsapp: string | null}>(propertyQuery, {slug}, preview)
})

export function getExploreProperties(data: Home) {
  return selectHomeProperties(data.homeSelection ?? data.catalog, 5)
}

export function getOpeningProperties(data: Home) {
  if (data.heroSlides != null) return selectHomeProperties(data.heroSlides, 3)
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
    `*[${listing} && !coalesce(noIndex, false)]{"slug": slug.current, "updated": _updatedAt}`,
  ) || []
}

export async function isPreview() {
  return !!process.env.SANITY_API_READ_TOKEN && (await draftMode()).isEnabled
}

export const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://prime.piramideimoveissjc.com.br').origin

export const getSiteSettings = cache(async (preview: boolean): Promise<SiteSettings> => {
  return await read<SiteSettings>(`*[_id == "primeSiteSettings"][0]{
    organization{
      name, legalName, description, creci, commercialPhone, portalUrl, officeTitle, streetAddress, city, state, postalCode, country, openingHours, copyright,
      "socialLinks": coalesce(socialLinks[defined(label) && defined(href)]{_key, label, href, icon}, []),
      "branches": coalesce(branches[defined(label) && defined(href)]{_key, label, href}, [])
    },
    privacy{title, subtitle, controllerIntroduction, contactPhone, contactMessage, contactLabel, cookieNotice,
      "sections": coalesce(sections[defined(title) && defined(body)]{_key, title, body}, [])},
    differentiators{eyebrow, title, description, "items": coalesce(items[defined(title) && defined(text)]{_key, title, text}, [])},
    statsIntro{eyebrow, title, description},
    homeCta{eyebrow, title, description, buttonLabel, secondaryLabel, image},
    catalogCta{eyebrow, title, description, buttonLabel, secondaryLabel, image},
    propertyCta{eyebrow, title, description, buttonLabel, secondaryLabel, image}
  }`, {}, preview) || {}
})

export const getCondominiums = cache(async (preview: boolean): Promise<Condominium[]> => {
  return await read<Condominium[]>(`*[_type == "condominium" && defined(slug.current) && defined(cover.asset)] | order(name asc){
    "id": _id, name, "slug": slug.current, cover, description, address, features, seo,
    "city": neighborhood->city->{"id": _id, name},
    "neighborhood": neighborhood->{"id": _id, name}
  }`, {}, preview) || []
})

export const getCondominiumDirectory = cache(async (preview: boolean) => {
  return await read<{title?: string; description?: string; featuredIds: string[]}>(`*[_id == "primeCondominiumDirectory"][0]{title,description,"featuredIds": coalesce(featured[]->_id, [])}`, {}, preview) || {featuredIds: []}
})

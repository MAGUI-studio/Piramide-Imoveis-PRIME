import type {MetadataRoute} from 'next'
import {getPublishedCondominiumSlugs, getPublishedSlugs, siteUrl} from '../lib/sanity'

export const revalidate = 60

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [properties, condominiums] = await Promise.all([getPublishedSlugs(), getPublishedCondominiumSlugs()])
  return [
    {url: siteUrl + '/'},
    {url: siteUrl + '/imoveis'},
    {url: siteUrl + '/condominios'},
    ...condominiums.map(({slug}) => ({url: siteUrl + '/condominios/' + encodeURIComponent(slug)})),
    ...properties.map(({slug, updated}) => ({url: siteUrl + '/imoveis/' + encodeURIComponent(slug), lastModified: updated})),
  ]
}

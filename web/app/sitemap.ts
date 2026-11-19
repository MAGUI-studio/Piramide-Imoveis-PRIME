import type {MetadataRoute} from 'next'
import {getCondominiums, getPublishedSlugs, siteUrl} from '../lib/sanity'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const properties = await getPublishedSlugs()
  const condominiums = await getCondominiums(false)
  return [
    {url: siteUrl + '/'},
    {url: siteUrl + '/imoveis'},
    {url: siteUrl + '/condominios'},
    ...condominiums.map(({slug}) => ({url: siteUrl + '/condominios/' + encodeURIComponent(slug)})),
    ...properties.map(({slug, updated}) => ({url: siteUrl + '/' + encodeURIComponent(slug), lastModified: updated})),
  ]
}

import type {MetadataRoute} from 'next'
import {getPublishedSlugs, siteUrl} from '../lib/sanity'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const properties = await getPublishedSlugs()
  return [
    {url: siteUrl + '/'},
    ...properties.map(({slug, updated}) => ({url: siteUrl + '/' + slug, lastModified: updated})),
  ]
}

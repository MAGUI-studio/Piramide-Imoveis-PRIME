import {getCliClient} from 'sanity/cli'

type Ref = {_type: 'reference'; _key: string; _ref: string}
type Property = {_id: string; availability?: string}
type Home = {_id: string; hero?: Property | null; featured?: (Property | null)[]; heroSlides?: Ref[]; homeSelection?: Ref[]; marquee?: unknown[]}

async function main() {
  const client = getCliClient({apiVersion: '2026-02-01'}).withConfig({useCdn: false})
  const data = await client.fetch<{homes: Home[]; catalog: Property[]; marquee: unknown[]; draftMarquee: unknown[] | null}>(`{
    "homes": *[_id in ["primeHome", "drafts.primeHome"]]{_id,heroSlides,homeSelection,marquee,"hero":hero->{_id,availability},"featured":featured[]->{_id,availability}},
    "catalog": *[_type == "property" && !(_id in path("drafts.**")) && defined(slug.current) && defined(cover.asset)] | order(select(availability == "sold" => 1, 0) asc, coalesce(firstPublishedAt, _createdAt) desc, title asc, _id asc){_id,availability},
    "marquee": coalesce(*[_id == "primeMarquee"][0].items, []),
    "draftMarquee": *[_id == "drafts.primeMarquee"][0].items
  }`, {}, {perspective: 'raw'})
  if (!data.homes.length) throw new Error('HOME_NOT_FOUND')
  let transaction = client.transaction()
  for (const home of data.homes) {
    const pool = [home.hero, ...(home.featured || []), ...data.catalog].filter((item): item is Property => !!item?._id)
    const unique = new Map<string, Property>()
    for (const item of [...pool.filter((item) => item.availability !== 'sold'), ...pool]) {
      if (!unique.has(item._id)) unique.set(item._id, item)
      if (unique.size === 3) break
    }
    const refs = (items: Property[]): Ref[] => items.map((item, index) => ({_type: 'reference', _key: 'selected-' + index, _ref: item._id}))
    transaction = transaction.patch(home._id, (patch) => patch.setIfMissing({
      heroSlides: refs([...unique.values()]),
      homeSelection: refs(data.catalog.slice(0, 5)),
      marquee: home._id.startsWith('drafts.') ? data.draftMarquee ?? data.marquee : data.marquee,
    }))
  }
  await transaction.commit()
  const result = await client.fetch<{_id: string; hero: number; explore: number; footer: number}[]>('*[_id in ["primeHome", "drafts.primeHome"]]{_id,"hero":count(heroSlides),"explore":count(homeSelection),"footer":count(marquee)}', {}, {perspective: 'raw'})
  if (result.some((item) => item.hero > 3 || item.explore > 5)) throw new Error('LIMIT_EXCEEDED')
  console.log(JSON.stringify(result, null, 2))
}

main().catch((error: unknown) => {
  const reason = error as {code?: string; statusCode?: number; message?: string}
  console.error('Falha ao organizar página inicial: ' + (reason.code || reason.statusCode || (reason.message?.match(/^[A-Z_]+$/) ? reason.message : 'erro de conexão')))
  process.exitCode = 1
})

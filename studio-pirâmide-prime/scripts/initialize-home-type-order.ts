import {getCliClient} from 'sanity/cli'

async function main() {
  const client = getCliClient({apiVersion: '2026-02-01'}).withConfig({useCdn: false})
  const data = await client.fetch<{homes: {_id: string; propertyTypeOrder?: unknown[] | null}[]; types: {_id: string; name: string; count: number}[]}>(`{
    "homes": *[_id in ["primeHome", "drafts.primeHome"]]{_id,propertyTypeOrder},
    "types": *[_type == "propertyTypeOption" && !(_id in path("drafts.**")) && defined(name) && lower(name) != "condomínio"]{
      _id,name,"count":count(*[_type == "property" && !(_id in path("drafts.**")) && defined(slug.current) && defined(cover.asset) && propertyType == ^.name])
    } | order(count desc, name asc)
  }`, {}, {perspective: 'raw'})
  const missing = data.homes.filter((home) => home.propertyTypeOrder == null)
  if (!missing.length) {
    console.log('Ordem já configurada; nenhum conteúdo alterado.')
    return
  }
  const refs = data.types.map((type, index) => ({_type: 'reference', _key: 'type-' + index, _ref: type._id}))
  let transaction = client.transaction()
  for (const home of missing) transaction = transaction.patch(home._id, (patch) => patch.setIfMissing({propertyTypeOrder: refs}))
  await transaction.commit()
  console.log(JSON.stringify({documents: missing.map((home) => home._id), orderAfterCondominium: data.types.map((type) => type.name)}, null, 2))
}

main().catch((error: unknown) => {
  const reason = error as {code?: string; statusCode?: number}
  console.error('Falha ao configurar ordem dos tipos: ' + (reason.code || reason.statusCode || 'erro de conexão'))
  process.exitCode = 1
})

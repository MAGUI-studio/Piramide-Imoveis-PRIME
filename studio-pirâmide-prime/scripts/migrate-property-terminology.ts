import {getCliClient} from 'sanity/cli'

function rewrite(value: unknown, name = ''): unknown {
  if (name.startsWith('_') || name === 'slug' || name === 'legalName' || name === 'firstPublishedSlug') return value
  if (Array.isArray(value)) return value.map((entry) => rewrite(entry))
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, rewrite(entry, key)]))
  if (typeof value !== 'string') return value
  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value)
      if (!['localhost', '127.0.0.1', 'prime.piramideimoveissjc.com.br'].includes(url.hostname)) return value
      url.pathname = url.pathname.replace(/^\/empreendimentos(?=\/|$)/, '/imoveis')
      url.hash = url.hash.replace(/^#empreendimentos$/, '#imoveis')
      return url.href
    } catch { return value }
  }
  return value.replace(/\/empreendimentos(?=[/?#]|$)/g, '/imoveis').replace(/#empreendimentos\b/g, '#imoveis')
    .replace(/EMPREENDIMENTOS/g, 'IMÓVEIS').replace(/Empreendimentos/g, 'Imóveis').replace(/empreendimentos/g, 'imóveis')
    .replace(/EMPREENDIMENTO/g, 'IMÓVEL').replace(/Empreendimento/g, 'Imóvel').replace(/empreendimento/g, 'imóvel')
}

async function main() {
  const client = getCliClient({apiVersion: '2026-02-01'}).withConfig({useCdn: false})
  const docs = await client.fetch<{_id: string; _rev: string; [key: string]: unknown}[]>('*[_type in $types]', {types: ['property', 'condominium', 'propertyTypeOption', 'primeHome', 'primeSiteSettings', 'primeMarquee', 'primeCondominiumDirectory']}, {perspective: 'raw'})
  let transaction = client.transaction()
  let count = 0
  for (const doc of docs) {
    const set: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(doc)) {
      const next = rewrite(value, key)
      if (JSON.stringify(value) !== JSON.stringify(next)) set[key] = next
    }
    if (!Object.keys(set).length) continue
    transaction = transaction.patch(doc._id, (patch) => patch.ifRevisionId(doc._rev).set(set))
    count++
  }
  if (count) await transaction.commit()
  console.log(JSON.stringify({updatedDocuments: count, preserved: 'Razão social, identificadores, endereços de fichas e links externos.'}))
}

main().catch((error: unknown) => {
  const reason = error as {code?: string; statusCode?: number}
  console.error('Falha ao atualizar nomenclatura: ' + (reason.code || reason.statusCode || 'erro de conexão'))
  process.exitCode = 1
})

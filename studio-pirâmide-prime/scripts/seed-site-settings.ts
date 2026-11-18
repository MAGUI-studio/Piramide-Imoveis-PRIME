import {readFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import {getCliClient} from 'sanity/cli'

// Run from the Studio: pnpm --filter studio seed:settings
// Only initializes a missing singleton. Existing content and deliberately empty
// fields are preserved; rerunning this script never overwrites editorial changes.
async function main() {
  const client = getCliClient({apiVersion: '2026-02-01'}).withConfig({useCdn: false})
  const id = 'primeSiteSettings'
  const existing = await client.fetch('*[_id in $ids][0]._id', {ids: [id, 'drafts.' + id]}, {perspective: 'raw'})
  if (existing) {
    console.log('Configurações já existem; nenhum conteúdo foi alterado.')
  } else {
    const content = JSON.parse(await readFile(resolve('siteSettings.defaults.json'), 'utf8'))
    const legacyPhone = await client.fetch(
      'coalesce(*[_id == \"primeHome\"][0].whatsapp, *[_id == \"drafts.primeHome\"][0].whatsapp)', {}, {perspective: 'raw'},
    )
    if (typeof legacyPhone === 'string' && /^[1-9]\d{9,14}$/.test(legacyPhone)) content.organization.commercialPhone = legacyPhone
    const image = await client.assets.upload('image', await readFile(resolve('../web/public/brand/footer-piramide-prime.webp')), {
      filename: 'footer-piramide-prime.webp',
    })
    for (const key of ['homeCta', 'catalogCta', 'propertyCta']) {
      content[key].image = {_type: 'primePhoto', alt: 'Residência de alto padrão', asset: {_type: 'reference', _ref: image._id}}
    }
    await client.createIfNotExists({_id: id, _type: 'primeSiteSettings', ...content})
    console.log('Configurações do site criadas com o conteúdo atual e a imagem dos CTAs.')
  }
}

main().catch((error: unknown) => {
  // Sanity transport errors may include authorization headers. Never dump the request.
  const reason = error as {code?: string; statusCode?: number}
  console.error(`Falha ao inicializar configurações: ${reason.code || reason.statusCode || "erro de conexão"}.`)
  process.exitCode = 1
})

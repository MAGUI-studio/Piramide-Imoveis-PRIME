import {readFile} from 'node:fs/promises'
import {getCliClient} from 'sanity/cli'
import sharp from 'sharp'

async function main() {
  const client = getCliClient({apiVersion: '2026-02-01'}).withConfig({useCdn: false})
  const homes = await client.fetch<{_id: string; banners?: unknown[] | null}[]>('*[_id in ["primeHome", "drafts.primeHome"]]{_id,banners}', {}, {perspective: 'raw'})
  const missing = homes.filter((home) => home.banners == null)
  if (!homes.length) throw new Error('HOME_NOT_FOUND')
  if (!missing.length) {
    console.log('Banners já configurados; nenhum conteúdo alterado.')
    return
  }
  const filename = 'parque-una-banner.jpg'
  let asset = await client.fetch<{_id: string} | null>('*[_type == "sanity.imageAsset" && originalFilename == $filename][0]{_id}', {filename})
  if (!asset) {
    const image = await sharp(await readFile(new URL('../../web/public/parque%20una.png', import.meta.url))).jpeg({quality: 92}).toBuffer()
    if (image.length > 2 * 1024 * 1024) throw new Error('IMAGE_TOO_LARGE')
    asset = await client.assets.upload('image', image, {filename})
  }
  const banners = [{_type: 'homeBanner', _key: 'parque-una', title: 'Conheça o bairro planejado Parque Una', image: {_type: 'primePhoto', alt: 'Conheça mais sobre o bairro planejado Parque Una — clique aqui e fique por dentro', asset: {_type: 'reference', _ref: asset._id}}, href: 'https://parqueuna.piramideimoveissjc.com.br/pt', newTab: true}]
  let transaction = client.transaction()
  for (const home of missing) transaction = transaction.patch(home._id, (patch) => patch.setIfMissing({banners}))
  await transaction.commit()
  const result = await client.fetch('*[_id in ["primeHome", "drafts.primeHome"]]{_id,"banners":count(banners),"campaigns":banners[].title}', {}, {perspective: 'raw'})
  console.log(JSON.stringify(result, null, 2))
}

main().catch((error: unknown) => {
  const reason = error as {code?: string; statusCode?: number; message?: string}
  console.error('Falha ao configurar banners: ' + (reason.code || reason.statusCode || (reason.message?.match(/^[A-Z_]+$/) ? reason.message : 'erro de conexão')))
  process.exitCode = 1
})

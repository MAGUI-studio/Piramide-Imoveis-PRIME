import {getCliClient} from 'sanity/cli'
import {readFile} from 'node:fs/promises'
import sharp from 'sharp'

const watermarkVersion = (await readFile(new URL('../watermark.ts', import.meta.url), 'utf8')).match(/watermarkVersion = '([^']+)'/)?.[1]
if (!watermarkVersion) throw new Error('WATERMARK_VERSION_MISSING')

type Photo = {_type: string; alt?: string; asset: {_type: string; _ref: string}}
type Source = {_id: string; propertyType: string; cover: Photo; neighborhood: {_ref: string}; gallery?: (Photo & {_key: string})[]}

// Explicit demo IDs and createIfNotExists make this safe to rerun without
// replacing editorial changes or touching existing listings.
async function main() {
  const client = getCliClient({apiVersion: '2026-02-01'}).withConfig({useCdn: false})
  const sources = await client.fetch<Source[]>(`*[_type == "property" && defined(neighborhood->city->_id) && defined(cover.asset->url)] | order(_createdAt asc){
    _id, propertyType, cover, neighborhood,
    "gallery": gallery[defined(asset->url)]
  }`, {watermark: watermarkVersion}, {perspective: 'published'})
  if (!sources.length) throw new Error('NO_PHOTO_SOURCES')

  const logoSvg = await readFile(new URL('../static/watermark-logo.svg', import.meta.url), 'utf8')
  const photoCache = new Map<string, Photo>()
  async function markedPhoto(photo: Photo): Promise<Photo> {
    const cached = photoCache.get(photo.asset._ref)
    if (cached) return {...cached}
    const asset = await client.fetch<{url: string; description?: string}>('*[_id == $id][0]{url,description}', {id: photo.asset._ref})
    if (asset.description === watermarkVersion) {
      photoCache.set(photo.asset._ref, photo)
      return {...photo}
    }
    const filename = photo.asset._ref + '-' + watermarkVersion + '.jpg'
    let marked = await client.fetch<{_id: string} | null>('*[_type == "sanity.imageAsset" && originalFilename == $filename && description == $version][0]{_id}', {filename, version: watermarkVersion})
    if (!marked) {
      const response = await fetch(asset.url)
      if (!response.ok) throw new Error('PHOTO_DOWNLOAD_FAILED')
      const input = Buffer.from(await response.arrayBuffer())
      const resized = await sharp(input).rotate().resize({width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true}).flatten({background: '#fff'}).toBuffer({resolveWithObject: true})
      const width = Math.round(Math.min(resized.info.width * 0.3, resized.info.height * 0.4 * 1000 / 512))
      const overlay = await sharp(Buffer.from(logoSvg.replace('<svg ', '<svg opacity="0.42" '))).resize({width}).png().toBuffer()
      let output: Buffer | undefined
      for (const quality of [94, 86, 76, 65]) {
        output = await sharp(resized.data).composite([{input: overlay, gravity: 'centre'}]).jpeg({quality}).toBuffer()
        if (output.length <= 2 * 1024 * 1024) break
      }
      if (!output || output.length > 2 * 1024 * 1024) throw new Error('PHOTO_TOO_LARGE')
      marked = await client.assets.upload('image', output, {filename, description: watermarkVersion})
    }
    const result = {...photo, asset: {_type: 'reference', _ref: marked._id}}
    photoCache.set(photo.asset._ref, result)
    return {...result}
  }

  const condos = [
    {slug: 'jardins-do-horizonte', name: 'Jardins do Horizonte', description: 'Alamedas arborizadas e espaços de convivência dão o tom do Jardins do Horizonte. Um endereço pensado para quem valoriza privacidade, lazer e uma rotina ao ar livre, com clube, quadras esportivas e percursos de caminhada. Casas, apartamentos e terrenos oferecem diferentes formas de viver o condomínio.', features: ['Portaria e controle de acesso', 'Clube com piscina', 'Quadras esportivas', 'Trilhas para caminhada', 'Playground']},
    {slug: 'reserva-das-oliveiras', name: 'Reserva das Oliveiras', description: 'Na Reserva das Oliveiras, jardins e áreas de lazer aproximam o conforto de casa dos bons momentos em família. A infraestrutura reúne espaços para receber, praticar atividades físicas e aproveitar o tempo livre com tranquilidade. Conheça as opções de casas, apartamentos e terrenos neste endereço.', features: ['Portaria 24 horas', 'Salão de festas', 'Espaço fitness', 'Jardim de convivência', 'Espaço pet']},
    {slug: 'vista-da-serra', name: 'Vista da Serra', description: 'O Vista da Serra combina o sossego de uma rotina próxima à natureza com espaços dedicados ao esporte e à convivência. Mirante, quadra de tênis e área gourmet compõem uma proposta de moradia que convida a aproveitar cada dia. Explore as casas, apartamentos e terrenos disponíveis no condomínio.', features: ['Controle de acesso', 'Mirante de convivência', 'Quadra de tênis', 'Espaço gourmet', 'Pista de caminhada']},
    {"slug": "bosque-dos-manacas", "name": "Bosque dos Manacás", "description": "Alamedas arborizadas e espaços ao ar livre aproximam a natureza da rotina. O Bosque dos Manacás reúne áreas de convivência, lazer e diferentes possibilidades de moradia em um ambiente acolhedor.", "features": ["Portaria 24 horas", "Bosque de caminhada", "Playground", "Salão de festas", "Espaço pet"]},
    {"slug": "alto-das-palmeiras", "name": "Alto das Palmeiras", "description": "Com jardins e espaços pensados para receber, o Alto das Palmeiras combina privacidade e convivência. Piscina, área gourmet e academia completam a infraestrutura para aproveitar o dia a dia com conforto.", "features": ["Controle de acesso", "Piscina", "Academia", "Espaço gourmet", "Jardins"]},
    {"slug": "reserva-do-lago", "name": "Reserva do Lago", "description": "A Reserva do Lago valoriza o tempo ao ar livre e os encontros em família. As áreas de lazer se integram aos jardins, com percursos para caminhada e espaços para esporte e descanso.", "features": ["Portaria 24 horas", "Pista de caminhada", "Quadras esportivas", "Clube com piscina", "Área de convivência"]},
    {"slug": "jardins-de-toscana", "name": "Jardins de Toscana", "description": "Paisagismo e arquitetura encontram equilíbrio nos Jardins de Toscana. Um endereço com áreas de lazer e espaços de convivência que convidam a desacelerar, receber amigos e aproveitar a vida em família.", "features": ["Portaria e controle de acesso", "Salão de festas", "Praça de convivência", "Academia", "Playground"]},
    {"slug": "villa-dos-ipes", "name": "Villa dos Ipês", "description": "A Villa dos Ipês oferece uma rotina acolhedora entre jardins e espaços de lazer. A infraestrutura privilegia o convívio, com ambientes para receber, praticar atividades e descansar.", "features": ["Controle de acesso", "Espaço gourmet", "Piscina", "Espaço pet", "Playground"]},
    {"slug": "parque-das-araucarias", "name": "Parque das Araucárias", "description": "O Parque das Araucárias reúne tranquilidade e opções de lazer para diferentes momentos do dia. Caminhadas, esportes e encontros ganham espaço em uma proposta de moradia próxima ao verde.", "features": ["Portaria 24 horas", "Trilhas para caminhada", "Quadra de tênis", "Salão de festas", "Academia"]},
    {"slug": "terras-do-sol", "name": "Terras do Sol", "description": "Espaços abertos e áreas de convivência marcam a identidade do Terras do Sol. A estrutura do condomínio permite aproveitar o lazer em família e criar uma rotina com mais conforto e praticidade.", "features": ["Controle de acesso", "Clube com piscina", "Quadra poliesportiva", "Playground", "Espaço gourmet"]},
    {"slug": "morada-dos-cedros", "name": "Morada dos Cedros", "description": "Na Morada dos Cedros, privacidade e bem-estar orientam os espaços. Jardins, infraestrutura de lazer e áreas para receber amigos compõem um endereço pensado para viver com tranquilidade.", "features": ["Portaria 24 horas", "Jardim de convivência", "Salão de festas", "Academia", "Espaço pet"]},
    {"slug": "village-bela-vista", "name": "Village Bela Vista", "description": "O Village Bela Vista combina ambientes de convivência com uma infraestrutura de lazer para toda a família. Conheça as opções de moradia e descubra um endereço que acompanha diferentes estilos de vida.", "features": ["Controle de acesso", "Piscina", "Espaço gourmet", "Playground", "Pista de caminhada"]},
    {"slug": "quinta-das-acacias", "name": "Quinta das Acácias", "description": "A Quinta das Acácias convida a viver entre jardins, momentos de descanso e encontros em família. Os espaços de lazer e convivência complementam uma proposta de moradia com conforto e privacidade.", "features": ["Portaria 24 horas", "Quadras esportivas", "Academia", "Salão de festas", "Jardins"]},
  ]
  const types = [
    {type: 'Casa/Mansão', label: 'Casa', area: 360, landArea: 600, bedrooms: 4, suites: 4, bathrooms: 5, parking: 4, price: 4200000},
    {type: 'Apartamento/Cobertura', label: 'Apartamento', area: 185, bedrooms: 3, suites: 3, bathrooms: 4, parking: 3, price: 1850000},
    {type: 'Terreno', label: 'Terreno', landArea: 720, price: 980000},
  ]
  const ids: string[] = []
  const documents: Record<string, unknown>[] = []
  const publishedAt = new Date().toISOString()
  for (const [index, condo] of condos.entries()) {
    const source = sources[index % sources.length]
    const condoId = 'seed-condominium-' + condo.slug
    ids.push(condoId)
    documents.push({_id: condoId, _type: 'condominium', name: condo.name, slug: {_type: 'slug', current: condo.slug}, description: condo.description,
      cover: {...await markedPhoto(source.cover), alt: 'Vista do condomínio ' + condo.name},
      neighborhood: {_type: 'reference', _ref: source.neighborhood._ref}, features: condo.features,
      seo: {_type: 'primeSeo', title: condo.name, description: 'Conheça a infraestrutura do ' + condo.name + ' e explore as casas, apartamentos e terrenos disponíveis.'},
    })
    for (const [unitIndex, unit] of types.entries()) {
      const photoSource = sources.filter((item) => item.propertyType === unit.type)[index % Math.max(1, sources.filter((item) => item.propertyType === unit.type).length)] || source
      const slug = condo.slug + '-' + ['casa', 'apartamento', 'terreno'][unitIndex]
      const title = [
        'Casa com área gourmet no ' + condo.name,
        'Apartamento com varanda no ' + condo.name,
        'Terreno de 720 m² no ' + condo.name,
      ][unitIndex]
      const {type, label, price, ...specifications} = unit
      const propertyId = 'seed-property-' + slug
      ids.push(propertyId)
      documents.push({_id: propertyId, _type: 'property', title, slug: {_type: 'slug', current: slug},
        firstPublishedSlug: slug, firstPublishedAt: publishedAt,
        refCode: `PR-C${index + 1}0${unitIndex + 1}`, propertyType: type,
        condominium: {_type: 'reference', _ref: condoId}, neighborhood: {_type: 'reference', _ref: source.neighborhood._ref},
        summary: [
          'Ambientes integrados, quatro suítes e espaço gourmet para viver e receber com conforto.',
          'Três suítes, varanda generosa e espaços que combinam praticidade e privacidade.',
          '720 m² para desenvolver um projeto sob medida, com acesso à infraestrutura do condomínio.',
        ][unitIndex],
        description: [
          `Uma casa para aproveitar cada momento no ${condo.name}. São 360 m² de área construída em um terreno de 600 m², com quatro suítes, living integrado e espaço gourmet. Os ambientes favorecem a convivência, enquanto a distribuição da área íntima preserva a privacidade. Quatro vagas completam a proposta, com acesso à infraestrutura de lazer e segurança do condomínio.`,
          `Conforto e praticidade se encontram neste apartamento no ${condo.name}. A planta de 185 m² reúne três suítes, living integrado e uma varanda generosa para momentos de descanso ou encontros com amigos. São três vagas de garagem e acesso às áreas de lazer e convivência do condomínio.`,
          `Um terreno de 720 m² no ${condo.name}, com espaço para criar uma residência que acompanhe seu estilo de vida. A metragem permite explorar soluções de arquitetura, paisagismo e lazer privativo, somadas à infraestrutura e aos espaços de convivência do condomínio.`,
        ][unitIndex],
        availability: 'available', price: price + index * 150000, specifications: {_type: 'specifications', ...specifications},
        cover: {...await markedPhoto(photoSource.cover), alt: `${title}`},
        gallery: await Promise.all((photoSource.gallery?.length ? photoSource.gallery.slice(0, 3) : [photoSource.cover]).map(async (photo, i) => ({...await markedPhoto(photo), _key: 'photo-' + i, alt: `${title} — vista ${i + 1}`}))),
        template: 'mosaic', features: unitIndex === 2 ? ['720 m² de terreno', 'Infraestrutura do condomínio', 'Espaço para projeto personalizado'] : ['Ambientes integrados', 'Área de convivência', 'Infraestrutura do condomínio'],
        condoFeatures: condo.features, noIndex: true,
      })
    }
  }
  const collisions = await client.fetch<{_id: string}[]>('*[_id in $ids || slug.current in $slugs]{_id}', {ids: ids.flatMap((id) => [id, 'drafts.' + id]), slugs: documents.map((doc) => (doc.slug as {current: string}).current)}, {perspective: 'raw'})
  const known = new Set(ids)
  if (collisions.some((doc) => !known.has(doc._id) && !known.has(doc._id.replace(/^drafts\./, '')))) throw new Error('SLUG_COLLISION')
  let transaction = client.transaction()
  for (const doc of documents) {
    if (collisions.some((existing) => existing._id === 'drafts.' + doc._id)) throw new Error('DEMO_HAS_DRAFT')
    transaction = transaction.createIfNotExists(doc as {_id: string; _type: string})
  }
  transaction = transaction.createIfNotExists({_id: 'primeCondominiumDirectory', _type: 'primeCondominiumDirectory', title: 'Conheça nossos condomínios', description: 'Explore nossa seleção e encontre casas, apartamentos e terrenos no condomínio ideal para você.', featured: condos.slice(0, 3).map((condo, index) => ({_type: 'reference', _key: 'featured-' + index, _ref: 'seed-condominium-' + condo.slug}))})
  await transaction.commit()
  const result = await client.fetch<{_id: string; _type: string; title?: string; name?: string; linked?: string}[]>(
    '*[_id in $ids]{_id,_type,title,name,"linked":condominium->_id}', {ids}, {perspective: 'published'},
  )
  if (result.length !== condos.length * 4 || result.filter((doc) => doc._type === 'property' && !!doc.linked).length !== condos.length * 3) throw new Error('VERIFICATION_FAILED')
  console.log(JSON.stringify({condominiums: result.filter((doc) => doc._type === 'condominium').map((doc) => doc.name), properties: condos.length * 3, verifiedLinks: condos.length * 3}, null, 2))
}

main().catch((error: unknown) => {
  const reason = error as {code?: string; statusCode?: number; message?: string}
  console.error('Falha ao cadastrar demonstração: ' + (reason.code || reason.statusCode || (reason.message?.match(/^[A-Z_]+$/) ? reason.message : 'erro de conexão')))
  process.exitCode = 1
})


import {readFile, writeFile, mkdir} from 'node:fs/promises'
import {dirname, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {watermarkImage} from './watermark-image.mjs'
import {watermarkVersion} from '../watermark.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const backupDir = resolve(root, '.watermark-originals', watermarkVersion)
const envFile = await readFile(resolve(root, 'web/.env.local'), 'utf8')
const env = Object.fromEntries(envFile.split(/\r?\n/)
  .filter((line) => /^(SANITY_PROJECT_ID|SANITY_DATASET)=/.test(line))
  .map((line) => { const index = line.indexOf('='); return [line.slice(0, index), line.slice(index + 1).trim().replace(/^["']|["']$/g, '')] }))
const project = env.SANITY_PROJECT_ID
const dataset = env.SANITY_DATASET || 'production'
if (!project || !process.env.SANITY_AUTH_TOKEN) throw new Error('Configure o projeto e SANITY_AUTH_TOKEN para executar a migração.')
const base = 'https://' + project + '.api.sanity.io/v2026-02-01/'
const headers = {Authorization: 'Bearer ' + process.env.SANITY_AUTH_TOKEN}
const logo = await readFile(resolve(root, 'web/public/logos/piramide/logo_white.svg'))
const apply = process.argv.includes('--apply')

async function request(path, options = {}) {
  const response = await fetch(base + path, {...options, headers: {...headers, ...options.headers}})
  if (!response.ok) throw new Error('Sanity HTTP ' + response.status + ' em ' + path.split('?')[0])
  return response.json()
}

async function query(groq) {
  return (await request('data/query/' + dataset + '?perspective=raw&query=' + encodeURIComponent(groq))).result
}


function replaceReferences(value, replacements, path = '') {
  const patches = {}
  if (!value || typeof value !== 'object') return patches
  if (!Array.isArray(value) && value._type === 'reference' && replacements.has(value._ref)) {
    patches[path + '._ref'] = replacements.get(value._ref)
    return patches
  }
  for (const [key, child] of Object.entries(value)) {
    if (key.startsWith('_') && key !== '_key') continue
    const next = Array.isArray(value) ? path + '[' + key + ']' : (path ? path + '.' : '') + key
    Object.assign(patches, replaceReferences(child, replacements, next))
  }
  return patches
}

const assets = await query('*[_type == "sanity.imageAsset" && description != "' + watermarkVersion + '" && count(*[_type == "property" && references(^._id)]) > 0]{_id,url,originalFilename}')
console.log('Imagens sem marca: ' + assets.length + '. Modo: ' + (apply ? 'aplicar' : 'conferir') + '.')
if (!apply) process.exit(0)
await mkdir(backupDir, {recursive: true})
const manifestPath = resolve(backupDir, 'manifest.json')
let manifest
try {
  manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
} catch (error) {
  if (error.code !== 'ENOENT') throw error
  manifest = {project, dataset, assets: {}, documents: {}}
}
if (manifest.project !== project || manifest.dataset !== dataset) throw new Error('Backup pertence a outro dataset.')
const replacements = new Map()
for (const asset of assets) {
  const cached = manifest.assets[asset._id]
  if (cached) {
    replacements.set(asset._id, cached.watermarkedId)
    continue
  }
  const response = await fetch(asset.url)
  if (!response.ok) throw new Error('Falha ao baixar ' + asset._id)
  const original = Buffer.from(await response.arrayBuffer())
  const backup = resolve(backupDir, asset._id)
  await writeFile(backup, original)
  const marked = await watermarkImage(original, logo)
  const uploaded = await request('assets/images/' + dataset + '?' + new URLSearchParams({
    filename: asset._id + '-' + watermarkVersion + '.jpg', description: watermarkVersion,
  }), {method: 'POST', headers: {'Content-Type': 'image/jpeg'}, body: marked})
  const watermarkedId = uploaded.document._id
  manifest.assets[asset._id] = {watermarkedId, originalFilename: asset.originalFilename, backup}
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2))
  replacements.set(asset._id, watermarkedId)
  console.log('Marca aplicada: ' + asset._id)
}

const documents = await query('*[_type == "property"]')
const mutations = []
for (const document of documents) {
  const set = replaceReferences(document, replacements)
  if (!Object.keys(set).length) continue
  if (!manifest.documents[document._id]) manifest.documents[document._id] = document
  mutations.push({patch: {id: document._id, ifRevisionID: document._rev, set}})
}
await writeFile(manifestPath, JSON.stringify(manifest, null, 2))
if (mutations.length) await request('data/mutate/' + dataset + '?visibility=sync', {
  method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({mutations}),
})
const remaining = replacements.size
  ? await query('*[_type == "property" && references([' + [...replacements.keys()].map((id) => JSON.stringify(id)).join(',') + '])]._id')
  : []
if (remaining.length) throw new Error('Ainda há documentos apontando para originais: ' + remaining.length)
console.log('Concluído. ' + replacements.size + ' imagens tratadas; ' + mutations.length + ' documentos atualizados. Originais preservados no Sanity e no backup local.')

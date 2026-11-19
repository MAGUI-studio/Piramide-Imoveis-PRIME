import assert from 'node:assert/strict'
import {writeFile, unlink} from 'node:fs/promises'
import {createRequire} from 'node:module'
import {fileURLToPath} from 'node:url'
import {test} from 'node:test'

const require = createRequire(import.meta.url)
const studioRequire = createRequire(new URL('../../studio-pirâmide-prime/package.json', import.meta.url))
const sanityRequire = createRequire(studioRequire.resolve('sanity'))
const {build} = sanityRequire('esbuild')
const {parse, evaluate} = sanityRequire('groq-js')
const React = require('react')
const {renderToStaticMarkup} = require('react-dom/server')
const requests = []
const photo = {asset: {_ref: 'image-test'}, alt: 'Foto'}
const documents = [
  {_id: 'condo-a', _type: 'condominium', name: 'A', slug: {current: 'a'}, cover: photo},
  {_id: 'condo-b', _type: 'condominium', name: 'B', slug: {current: 'b'}, cover: photo},
  {_id: 'one', _type: 'property', title: 'One', slug: {current: 'one'}, cover: photo, condominium: {_ref: 'condo-a'}, _createdAt: '2026-01-01'},
  {_id: 'two', _type: 'property', title: 'Two', slug: {current: 'two'}, cover: photo, condominium: {_ref: 'condo-b'}, _createdAt: '2026-02-01'},
  {_id: 'incomplete', _type: 'property', title: 'Incomplete', condominium: {_ref: 'condo-a'}},
]

globalThis.__deliveryAudit = async (config, query, params, options) => {
  requests.push({config, options})
  return (await evaluate(parse(query), {dataset: documents, params})).get()
}

async function load(entry, plugins = []) {
  const output = new URL('./delivery-audit-' + entry.replaceAll('/', '-') + '-' + process.pid + '.cjs', import.meta.url)
  try {
    const result = await build({entryPoints: [fileURLToPath(new URL('../' + entry, import.meta.url))], bundle: true, platform: 'node', format: 'cjs', packages: 'external', write: false, plugins, define: {'process.env.SANITY_PROJECT_ID': '"audit-project"'}})
    await writeFile(output, result.outputFiles[0].text)
    return require(fileURLToPath(output))
  } finally {
    await unlink(output).catch(() => {})
  }
}

const data = await load('lib/sanity.ts', [{
  name: 'offline-sanity',
  setup(build) {
    build.onResolve({filter: /^(@sanity\/client|next\/headers)$/}, ({path}) => ({path, namespace: 'audit'}))
    build.onLoad({filter: /.*/, namespace: 'audit'}, ({path}) => ({contents: path === 'next/headers'
      ? 'export async function draftMode() { return {isEnabled: false} }'
      : 'export function createClient(config) { return {withConfig(extra) {return createClient({...config, ...extra})}, fetch(query, params, options) {return globalThis.__deliveryAudit(config, query, params, options)}} }'}))
  },
}])
const media = await load('components/media.tsx')

test('public and draft reads use separate delivery and caching policies', async () => {
  await data.getCatalog(false)
  await data.getCatalog(true)
  const [published, draft] = requests.slice(-2)
  assert.equal(published.config.useCdn, true)
  assert.equal(published.options.perspective, 'published')
  assert.equal(published.options.cache, 'force-cache')
  assert.equal(published.options.next.revalidate, 60)
  assert.equal(draft.config.useCdn, false)
  assert.equal(draft.options.perspective, 'drafts')
  assert.equal(draft.options.cache, 'no-store')
  assert.equal(draft.options.next, undefined)
})

test('targeted queries preserve catalog ordering, condominium counts and lookup', async () => {
  assert.deepEqual((await data.getCatalog(false)).map(({id}) => id), ['two', 'one'])
  assert.deepEqual((await data.getCatalog(false, 'condo-a')).map(({id}) => id), ['one'])
  assert.deepEqual((await data.getCondominiums(false)).map(({id, propertyCount}) => [id, propertyCount]), [['condo-a', 1], ['condo-b', 1]])
  assert.equal((await data.getCondominium('a', false)).id, 'condo-a')
  assert.equal(await data.getCondominium('missing', false), null)
})

test('initial video markup has a poster and no video source or external iframe', () => {
  const poster = {src: 'https://cdn.example.com/poster.jpg', alt: 'Capa'}
  for (const video of [
    {url: 'https://cdn.example.com/tour.mp4', title: 'Visita', poster},
    {url: 'https://www.youtube.com/watch?v=abcdefghijk', title: 'Visita', poster, external: true},
  ]) {
    const html = renderToStaticMarkup(React.createElement(media.InlineVideoTour, {videos: [video]}))
    assert.ok(html.includes(poster.src))
    assert.equal(/<video[^>]*\ssrc=/.test(html), false)
    assert.equal(html.includes('<iframe'), false)
  }
  const cover = renderToStaticMarkup(React.createElement(media.ImmersiveCover, {photo: poster, src: 'https://cdn.example.com/clip.mp4'}))
  assert.equal(/<video[^>]*\ssrc=/.test(cover), false)
})

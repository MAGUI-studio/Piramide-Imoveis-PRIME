import assert from 'node:assert/strict'
import {writeFile, unlink} from 'node:fs/promises'
import {createRequire} from 'node:module'
import {fileURLToPath} from 'node:url'
import {test} from 'node:test'

// Load the real schema, including local TSX inputs, without contacting Sanity.
const require = createRequire(import.meta.url)
const {build} = createRequire(require.resolve('sanity'))('esbuild')
const temporaryModule = new URL('./schema-audit-' + process.pid + '.mjs', import.meta.url)
let schemaTypes
try {
  const result = await build({entryPoints: [fileURLToPath(new URL('../schema.ts', import.meta.url))], bundle: true, platform: 'node', format: 'esm', packages: 'external', write: false})
  await writeFile(temporaryModule, result.outputFiles[0].text)
  ;({schemaTypes} = await import(temporaryModule.href))
} finally {
  await unlink(temporaryModule).catch(() => {})
}

test('every editable field has explanatory guidance, including nested items', () => {
  const missing = []
  let checked = 0
  function visit(node, path) {
    for (const field of node.fields || []) {
      if (field.hidden === true) continue
      checked++
      if (!field.description?.trim()) missing.push(path + '.' + field.name)
      visit(field, path + '.' + field.name)
    }
    for (const member of node.of || []) visit(member, path)
  }
  for (const schema of schemaTypes) visit(schema, schema.name)
  assert.ok(checked > 150)
  assert.deepEqual(missing, [])
})

test('SEO fields and groups always follow the main editing fields', () => {
  for (const schema of schemaTypes) {
    const isSeo = (field) => field.type === 'primeSeo' || field.name === 'noIndex' || [field.group].flat().includes('seo')
    const firstSeo = schema.fields?.findIndex(isSeo) ?? -1
    if (firstSeo >= 0) assert.ok(schema.fields.slice(firstSeo).every(isSeo), schema.name)
    const seoGroup = schema.groups?.findIndex((group) => group.name === 'seo') ?? -1
    if (seoGroup >= 0) assert.equal(seoGroup, schema.groups.length - 1, schema.name)
  }
})

test('editorial changes preserve stored names, custom inputs and selection limits', () => {
  const property = schemaTypes.find((schema) => schema.name === 'property')
  assert.equal(property.fields[0].name, 'title')
  assert.equal(property.fields.find((field) => field.name === 'condominium').type, 'reference')
  assert.equal(typeof property.fields.find((field) => field.name === 'cover').validation, 'function')
  assert.equal(typeof property.fields.find((field) => field.name === 'propertyType').components.input, 'function')
  const home = schemaTypes.find((schema) => schema.name === 'primeHome')
  for (const [name, limit] of [['heroSlides', 3], ['homeSelection', 5]]) {
    const field = home.fields.find((entry) => entry.name === name)
    let maximum
    const rule = {max(value) {maximum = value; return this}, unique() {return this}}
    field.validation(rule)
    assert.equal(maximum, limit)
  }
})

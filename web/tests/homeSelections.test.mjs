import assert from 'node:assert/strict'
import {test} from 'node:test'
import {selectHomeProperties} from '../lib/homeSelections.ts'

const property = (id) => ({id, slug: id, cover: {asset: {_ref: 'image-' + id}}})

test('limits hero and explore independently while preserving editorial order', () => {
  const items = Array.from({length: 8}, (_, index) => property('property-' + index)).reverse()
  assert.deepEqual(selectHomeProperties(items, 3).map(({id}) => id), ['property-7', 'property-6', 'property-5'])
  assert.deepEqual(selectHomeProperties(items, 5).map(({id}) => id), ['property-7', 'property-6', 'property-5', 'property-4', 'property-3'])
})

test('skips unresolved references, incomplete listings and duplicates without consuming slots', () => {
  const first = property('first')
  const second = property('second')
  assert.deepEqual(selectHomeProperties([null, {id: 'unpublished'}, first, first, {...property('no-cover'), cover: {}}, second], 3), [first, second])
})

test('an intentionally empty selection stays empty', () => {
  assert.deepEqual(selectHomeProperties([], 3), [])
  assert.deepEqual(selectHomeProperties([], 5), [])
})

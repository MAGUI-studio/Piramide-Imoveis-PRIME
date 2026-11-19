import assert from 'node:assert/strict'
import {test} from 'node:test'
import {similarPropertiesOf} from '../lib/similarProperties.ts'

const property = (id, extra = {}) => ({id, slug: id, title: id, propertyType: 'Casa/Mansão', city: {id: 'city'}, cover: {asset: {_ref: 'image-cover'}}, ...extra})

test('excludes current property, sold listings and duplicates; returns at most three', () => {
  const current = property('current')
  const items = similarPropertiesOf(current, [current, property('sold', {availability: 'sold'}), property('a'), property('a'), property('b'), property('c'), property('d')])
  assert.deepEqual(items.map(({id}) => id), ['a', 'b', 'c'])
})

test('same type and condominium outrank other nearby properties; price breaks ties', () => {
  const current = property('current', {price: 1000, condominium: {id: 'condo'}})
  const items = similarPropertiesOf(current, [property('nearby-apartment', {propertyType: 'Apartamento/Cobertura'}), property('far-price', {price: 5000}), property('same-condo', {condominium: {id: 'condo'}}), property('near-price', {price: 1100})])
  assert.deepEqual(items.map(({id}) => id), ['same-condo', 'near-price', 'far-price'])
})

test('does not invent recommendations when nothing is similar', () => {
  assert.deepEqual(similarPropertiesOf(property('current'), [property('unrelated', {propertyType: 'Terreno', city: {id: 'elsewhere'}})]), [])
})

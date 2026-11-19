import assert from 'node:assert/strict'
import {test} from 'node:test'
import {orderLifestyleItems} from '../lib/lifestyleOrder.ts'

const items = [{type: 'Casa/Mansão', count: 20}, {type: 'Condomínio', count: 1}, {type: 'Terreno', count: 4}, {type: 'Comercial', count: 2}]

test('condominium stays first regardless of editorial order or property counts', () => {
  assert.deepEqual(orderLifestyleItems(items, ['Terreno', 'Condomínio', 'Comercial', 'Casa/Mansão']).map((item) => item.type), ['Condomínio', 'Terreno', 'Comercial', 'Casa/Mansão'])
})

test('partial orders retain other types and ignore missing or duplicate references', () => {
  assert.deepEqual(orderLifestyleItems(items, [null, ' comercial ', 'Comercial', 'Tipo removido']).map((item) => item.type), ['Condomínio', 'Comercial', 'Casa/Mansão', 'Terreno'])
  assert.deepEqual(items.map((item) => item.type), ['Casa/Mansão', 'Condomínio', 'Terreno', 'Comercial'])
})

test('without a configured order, condominium precedes the default count order', () => {
  assert.deepEqual(orderLifestyleItems(items).map((item) => item.type), ['Condomínio', 'Casa/Mansão', 'Terreno', 'Comercial'])
})

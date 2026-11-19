import assert from 'node:assert/strict'
import {test} from 'node:test'
import {technicalFactsOf} from '../lib/technicalFacts.ts'

test('total area remains independent of built and land areas; lavabos is not rendered', () => {
  const facts = technicalFactsOf({propertyType: 'Casa/Mansão', specifications: {totalArea: 900, area: 350, landArea: 700, lavabos: 2}})
  assert.deepEqual(facts.map(({label, value}) => [label, value]), [['Área total', '900 m²'], ['Área construída', '350 m²'], ['Área do terreno', '700 m²']])
  assert.ok(!technicalFactsOf({specifications: {area: 100, landArea: 200}}).some(({label}) => label === 'Área total'))
})

test('custom facts follow fixed facts, preserve order and share the check icon', () => {
  const facts = technicalFactsOf({specifications: {suites: 3}, customFacts: [{_key: 'a', label: ' Tipo de piso ', value: ' Porcelanato '}, {_key: 'b', label: 'Ano de construção', value: '2022'}]})
  assert.deepEqual(facts.map(({label}) => label), ['Suítes', 'Tipo de piso', 'Ano de construção'])
  assert.deepEqual(facts.slice(1).map(({icon}) => icon), ['check', 'check'])
})

test('empty or incomplete custom data is skipped; repeated labels have distinct keys', () => {
  const facts = technicalFactsOf({customFacts: [{_key: 'a', label: 'Vista', value: 'Serra'}, {_key: 'b', label: 'Vista', value: 'Jardim'}, {_key: 'c', label: ' ', value: 'Valor'}, {_key: 'd', label: 'Nome', value: ''}]})
  assert.equal(facts.length, 2)
  assert.notEqual(facts[0].key, facts[1].key)
  assert.deepEqual(technicalFactsOf({}), [])
})

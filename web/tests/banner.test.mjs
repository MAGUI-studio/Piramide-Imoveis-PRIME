import assert from 'node:assert/strict'
import {test} from 'node:test'
import {bannerHref} from '../lib/banner.ts'

test('supports public campaign links and internal navigation', () => {
  assert.equal(bannerHref('https://parqueuna.piramideimoveissjc.com.br/pt'), 'https://parqueuna.piramideimoveissjc.com.br/pt')
  assert.equal(bannerHref('/empreendimentos?tipo=Terreno'), '/empreendimentos?tipo=Terreno')
})

test('ignores unsafe protocols and malformed links', () => {
  for (const link of ['javascript:alert(1)', 'data:text/html,hello', '//example.com', '/\\example.com', '', 'invalid']) assert.equal(bannerHref(link), null)
})

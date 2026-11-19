import assert from 'node:assert/strict'
import {test} from 'node:test'
import {serializeJson} from '../lib/serializeJson.ts'

test('preserves editorial text while preventing HTML script termination', () => {
  const data = {title: 'Área < 100 m²', description: '</script><script>alert("teste")</script>', nested: ['<', '\\u003c', 'São José']}
  const serialized = serializeJson(data)
  assert.equal(serialized.includes('<'), false)
  assert.deepEqual(JSON.parse(serialized), data)
})

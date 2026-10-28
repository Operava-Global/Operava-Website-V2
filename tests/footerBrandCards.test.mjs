import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

test('shared bottom brand cards stay fully opaque white in both website themes', () => {
  const css = readFileSync(new URL('../src/site/theme.css', import.meta.url), 'utf8')
  const logo = readFileSync(new URL('../src/components/EcosystemLogos.tsx', import.meta.url), 'utf8')
  const layout = readFileSync(new URL('../src/site/Layout.tsx', import.meta.url), 'utf8')

  assert.match(layout, /<EcosystemLogos \/>/, 'shared brand grid must remain site-wide')
  assert.match(logo, /className="ecosystem-logo ecosystem-logo--interactive[^"]*bg-white/)
  const block = css.match(/\/\* Shared footer brand grid[\s\S]*?\*\/([\s\S]*?)\nhtml\[data-theme="light"\] #site-shell \.ecosystem-logo \{/)
  assert.ok(block, 'must have a single explicit solid-white override')
  assert.match(block[1], /html #site-shell \.ecosystem-logo/)
  assert.match(block[1], /html\[data-theme="light"\] #site-shell \.ecosystem-logo/)
  assert.match(block[1], /background-color:#FFFFFF!important/)
  assert.match(block[1], /background-image:none!important/)
  assert.match(block[1], /opacity:1!important/)
  assert.match(block[1], /backdrop-filter:none!important/)
  assert.doesNotMatch(css, /\.ecosystem-logo \{ background:#faf8fd/)
})

/**
 * Every service and industry catalogue card must feature its own actual image.
 * Prevents both repeated paths and byte-identical copies under new filenames.
 * Run with: node scripts/check-card-images.mjs
 */
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { createHash } from 'node:crypto'

const catalogs = [
  'src/data/itServices.ts',
  'src/data/bpoServices.ts',
  'src/data/automationServices.ts',
  'src/site/content/industries.ts',
]
const seenPath = new Map()
const seenContent = new Map()
const counts = {}
let failed = false

for (const source of catalogs) {
  const content = readFileSync(source, 'utf8')
  const images = [...content.matchAll(/\bimage:\s*['"](\/media\/[^'"]+\.webp)['"]/g)].map((m) => m[1])
  counts[source] = images.length
  if (images.length < 8) {
    console.error(`Expected at least eight image cards in ${source}, found ${images.length}`)
    failed = true
  }
  for (const path of images) {
    const earlier = seenPath.get(path)
    if (earlier) {
      console.error(`REUSED CARD PHOTO: ${path} in ${earlier} and ${source}`)
      failed = true
    }
    seenPath.set(path, source)
    const disk = join('public', path.replace(/^\//, ''))
    if (!existsSync(disk)) {
      console.error(`MISSING CARD PHOTO: ${disk} referenced by ${source}`)
      failed = true
      continue
    }
    const sha = createHash('sha256').update(readFileSync(disk)).digest('hex')
    const prior = seenContent.get(sha)
    if (prior) {
      console.error(`DUPLICATE IMAGE CONTENT: ${path} and ${prior} use the same picture`)
      failed = true
    }
    seenContent.set(sha, path)
  }
}
const n = Object.values(counts).reduce((a, b) => a + b, 0)
if (failed) process.exit(1)
console.log(`Verified ${n} catalog cards, ${seenPath.size} unique image paths and ${seenContent.size} unique image files.`)

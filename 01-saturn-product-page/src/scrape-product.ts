// crawl academy 01: scrape one product page on saturn.de with the crawlbrulee js/ts sdk.
//
// run it:  CRAWLBRULEE_API_KEY=cwbl_… pnpm scrape [product url]
// writes:  output/product.json and output/screenshot.webp
//
// the lesson in four files:
//   scrape-product.ts  this file: one request, then save the results
//   selectors.ts       what to read from the page, by css selector
//   parse.ts           turns the shop's text into numbers and lists
//   types.ts           the product as we save it

import { mkdir, writeFile } from 'node:fs/promises'
import { parseArgs } from 'node:util'
import { Crawlbrulee } from '@crawlbrulee/sdk'
import { toProduct } from './parse.ts'
import { PRODUCT_ELEMENTS } from './selectors.ts'

const DEFAULT_URL =
  'https://www.saturn.de/de/product/_apple-airpods-4-mit-aktiver-gerauschunterdruckung-in-ear-kopfhorer-bluetooth-weiss-2954282.html'

const { positionals } = parseArgs({ allowPositionals: true })
const productUrl = positionals[0] ?? DEFAULT_URL

// reads the key from CRAWLBRULEE_API_KEY
const crawlbrulee = Crawlbrulee.fromEnv()

// one request for everything: the product data and a screenshot.
// a screenshot needs a real browser, so the page is loaded in one, and the values are read from
// that same page.
const page = await crawlbrulee.scrape({
  url: productUrl,
  // ask for the page as a shopper in Germany sees it
  location: { country: 'de', locale: 'de-DE' },
  // prices change, so ask for a fresh copy of the page instead of one from our cache
  cache: { max_age: 0 },
  extract: {
    // only the named values below: no copy of the whole page, no page metadata
    cleaned_html: false,
    metadata: false,
    elements: PRODUCT_ELEMENTS,
    // a screenshot of what a shopper sees first, in the same request
    screenshot: { type: 'viewport', viewport: { width: 1440, height: 1000 } },
  },
})

if (page.page_status_code !== 200) {
  throw new Error(`saturn.de answered ${page.page_status_code} for ${productUrl}`)
}

const product = toProduct(page)
const credits = page.response_meta.usage.total_credit_cost ?? 0

await mkdir('output', { recursive: true })
await writeFile('output/product.json', JSON.stringify(product, null, 2) + '\n')

// the screenshot link expires 24 hours after the scrape, so keep the file, not the link
let screenshotFile: string | null = null
if (page.screenshot?.url) {
  const image = await fetch(page.screenshot.url)
  if (!image.ok) throw new Error(`screenshot download failed: ${image.status}`)
  screenshotFile = 'output/screenshot.webp'
  await writeFile(screenshotFile, Buffer.from(await image.arrayBuffer()))
}

console.log(`${product.name}`)
console.log(`  price:    ${product.price} ${product.currency}`)
console.log(`  rating:   ${product.rating} / 5 from ${product.review_count} reviews`)
console.log(`  variants: ${product.variants.map((v) => v.name).join(', ') || 'none'}`)
console.log(`  offers:   ${product.offers.map((o) => `${o.name} ${o.price} EUR`).join(', ') || 'none'}`)
console.log(`  images:   ${product.images.length}`)
console.log(`saved output/product.json${screenshotFile ? ` and ${screenshotFile}` : ''}`)
console.log(`credits used: ${credits}`)

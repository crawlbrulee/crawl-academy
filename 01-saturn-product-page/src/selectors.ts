// what to read from a saturn.de product page. each name is yours to pick, each value is a css
// selector. the values come back on page.elements under the same names, at no extra cost.
//
// the shop marks its parts with data-test attributes, which change less often than class names.
// when the shop changes its pages and a value comes back null, this is the only file to update.

import type { ScrapeElements } from '@crawlbrulee/sdk'

export const PRODUCT_ELEMENTS = {
  name: 'h1',
  article_number: "[data-test='pdp-article-number']",
  price: "[data-test='mms-product-price'] [data-test='cofr-price mms-branded-price']",
  // the star widget carries the average and the review count in its label
  rating: {
    selector: "a[href='#reviews'] [aria-label*='Basierend auf']",
    output: 'attribute',
    attribute: 'aria-label',
  },
  // other versions of the same product, e.g. "Airpods 4" or "Airpods Pro 3"
  variant_names: { selector: "a[data-sctrack='variant-tile-link']", all: true },
  variant_urls: {
    selector: "a[data-sctrack='variant-tile-link']",
    output: 'attribute',
    attribute: 'href',
    all: true,
  },
  // the offers in the buy box, e.g. new and refurbished, each with its own price
  offer_names: { selector: "[data-test='pdp-refurbished-selector'] [data-test='radio']", all: true },
  offer_prices: {
    selector: "[data-test='pdp-refurbished-selector'] [data-test='cofr-price mms-price']",
    all: true,
  },
  images: {
    selector: "[data-test='mms-pdp-gallery'] img",
    output: 'attribute',
    attribute: 'src',
    all: true,
  },
} satisfies ScrapeElements

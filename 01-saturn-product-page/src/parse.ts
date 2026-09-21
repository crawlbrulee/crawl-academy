// turns the values read from the page into a Product: the shop's text into numbers, and the
// matching lists (names and urls, names and prices) into one list of objects.

import type { ScrapeElementValue, ScrapeResponse } from '@crawlbrulee/sdk'
import type { Product } from './types.ts'

export function toProduct(page: ScrapeResponse): Product {
  const el = page.elements ?? {}
  const rating = parseRating(text(el.rating))
  const variantUrls = list(el.variant_urls)
  const offerPrices = list(el.offer_prices)

  return {
    url: page.url,
    name: text(el.name),
    article_number: text(el.article_number)?.replace(/\D/g, '') || null,
    price: parsePrice(text(el.price)),
    currency: 'EUR',
    rating: rating?.average ?? null,
    review_count: rating?.count ?? null,
    variants: list(el.variant_names).map((name, i) => ({
      name,
      url: variantUrls[i] ?? null,
      current: variantUrls[i] === page.url,
    })),
    offers: list(el.offer_names).map((name, i) => ({ name, price: parsePrice(offerPrices[i] ?? null) })),
    images: productImages(list(el.images)),
    scraped_at: new Date().toISOString(),
  }
}

// one element value as clean text, or null when nothing matched
function text(value: ScrapeElementValue | undefined): string | null {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() || null : null
}

// a list element value (all: true) as clean strings
function list(value: ScrapeElementValue | undefined): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((v): v is string => typeof v === 'string').map((v) => v.replace(/\s+/g, ' ').trim())
}

// "159, – € 159,00€ inkl. MwSt." → 159
// the shop shows a German price ("1.299,00") next to a shorter display price; we read the full one
function parsePrice(value: string | null): number | null {
  const match = value?.match(/(\d{1,3}(?:\.\d{3})*,\d{2})\s*€/)
  if (!match) return null
  return Number(match[1].replace(/\./g, '').replace(',', '.'))
}

// "Durchschnittliche Produktbewertung: 4.8 von 5 Sternen, Basierend auf 2172 Bewertungen"
function parseRating(label: string | null): { average: number; count: number } | null {
  const match = label?.match(/([\d.,]+) von 5 Sternen, Basierend auf ([\d.]+) Bewertung/)
  if (!match) return null
  return { average: Number(match[1].replace(',', '.')), count: Number(match[2].replace(/\./g, '')) }
}

// the gallery can list a picture twice (large image and thumbnail) and adds a video play button.
// keep one link per picture, in gallery order, without the resize parameters.
function productImages(srcs: string[]): string[] {
  const seen = new Set<string>()
  for (const src of srcs) {
    const url = new URL(src)
    if (url.hostname !== 'assets.mmsrg.com') continue
    seen.add(`${url.origin}${url.pathname}`)
  }
  return [...seen]
}

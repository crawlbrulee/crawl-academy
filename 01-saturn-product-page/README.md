# 🍮 crawl academy 01: a product page on saturn.de

scrape one product page from [saturn.de](https://www.saturn.de), a large German electronics shop, with the crawlbrulee [js/ts sdk](https://www.npmjs.com/package/@crawlbrulee/sdk). you get the product as clean json, plus a screenshot of the page, from one request. the article [how to scrape ecommerce product data](https://crawlbrulee.com/blog/scrape-ecommerce-product-data) explains the important parts.

```json
{
  "name": "APPLE AirPods 4 mit Aktiver Geräuschunterdrückung, In-ear Kopfhörer Bluetooth Weiß",
  "article_number": "2954282",
  "price": 159,
  "currency": "EUR",
  "rating": 4.8,
  "review_count": 2172,
  "variants": [
    { "name": "Airpods 4 mit ANC", "url": "https://www.saturn.de/de/product/_apple-airpods-4-mit-aktiver-…-2954282.html", "current": true },
    { "name": "Airpods 4", "url": "https://www.saturn.de/de/product/_apple-airpods-4-in-ear-…-2954343.html", "current": false },
    { "name": "Airpods Pro 3", "url": "https://www.saturn.de/de/product/_apple-airpods-pro-3-…-3013574.html", "current": false }
  ],
  "offers": [
    { "name": "Neues Produkt", "price": 159 },
    { "name": "Refurbished Produkte", "price": 130.08 }
  ],
  "images": [
    "https://assets.mmsrg.com/isr/166325/c1/-/ASSET_MMS_144665910",
    "https://assets.mmsrg.com/isr/166325/c1/-/ASSET_MMS_144665911",
    "…"
  ]
}
```

(values from 12 October 2026. prices and ratings change.)

## run it

```bash
pnpm install
export CRAWLBRULEE_API_KEY=cwbl_…   # free key: https://dashboard.crawlbrulee.com/auth/register?utm_source=github&utm_medium=crawl-academy&utm_campaign=crawl-academy-01
pnpm scrape
```

one command, one request: it writes the product to `output/product.json` and the screenshot to `output/screenshot.webp`.

## how it works

the lesson is four short files:

| file | what it does |
| --- | --- |
| [`src/scrape-product.ts`](./src/scrape-product.ts) | the run: one request, then save the results |
| [`src/selectors.ts`](./src/selectors.ts) | what to read from the page, by css selector |
| [`src/parse.ts`](./src/parse.ts) | turns the shop's text into numbers and lists |
| [`src/types.ts`](./src/types.ts) | the product as we save it |

### 1. read named values with css selectors

instead of downloading the html and parsing it yourself, you tell crawlbrulee which values you want. each key in `extract.elements` is a name you pick, and each value is a css selector. they live in their own file, `src/selectors.ts`:

```ts
export const PRODUCT_ELEMENTS = {
  name: 'h1',
  price: "[data-test='mms-product-price'] [data-test='cofr-price mms-branded-price']",
  rating: { selector: "a[href='#reviews'] [aria-label*='Basierend auf']", output: 'attribute', attribute: 'aria-label' },
  variant_names: { selector: "a[data-sctrack='variant-tile-link']", all: true },
  images: { selector: "[data-test='mms-pdp-gallery'] img", output: 'attribute', attribute: 'src', all: true },
  // …
} satisfies ScrapeElements
```

the request in `src/scrape-product.ts` passes them on, and the values come back under the same names:

```ts
const page = await crawlbrulee.scrape({
  url: productUrl,
  location: { country: 'de', locale: 'de-DE' },
  cache: { max_age: 0 },
  extract: { cleaned_html: false, metadata: false, elements: PRODUCT_ELEMENTS },
})

page.elements.name // "APPLE AirPods 4 mit Aktiver Geräuschunterdrückung, …"
```

`satisfies ScrapeElements` checks the shape of every entry against the sdk's types while you type, and keeps the names you picked. whether a css selector is valid, the api checks: a broken one comes back as a `400` error.

- a plain selector string gives you the text of the first match.
- `output: 'attribute'` reads an attribute instead, like an image `src` or a link `href`. links and image urls come back as full urls.
- `all: true` gives you every match as a list, for variants, offers and gallery images.

the shop marks its parts with `data-test` attributes. they change less often than css class names, so they make good selectors. reading `elements` costs no extra credits. the rules and limits are in the [elements docs](https://crawlbrulee.com/docs/scrape/elements).

### 2. leave the proxy on auto

the request has no proxy setting, and that's on purpose. leave it on `auto`, the default, and we pick the proxy for you: we start with the basic proxy and move up to the advanced proxy when the basic one doesn't get the page. for saturn.de, it ends up on the advanced proxy. you pay for the tier that got the page, and `page.response_meta.usage` tells you which one it was.

`location` asks for the page as a shopper in Germany sees it, in German. `cache: { max_age: 0 }` asks for a fresh copy: prices change, so you want a fresh copy, not an older one from our cache.

### 3. turn the text into numbers

the values come back as the shop shows them, so `src/parse.ts` cleans them up and builds a `Product` (the shape is in `src/types.ts`):

- the price box reads `159, – € 159,00€ inkl. MwSt.`. the script takes the full price, `159,00`, and turns the German format into the number `159`.
- the rating label reads `Durchschnittliche Produktbewertung: 4.8 von 5 Sternen, Basierend auf 2172 Bewertungen`. that gives the average and the review count.
- the gallery can list a picture twice (large and thumbnail), with resize parameters in the url. the script keeps one link per picture, without the parameters, which links to the full-size image.

### 4. add a screenshot to the same request

a screenshot needs a real browser, but not a second request. add `screenshot` to the same `extract` block, and we load the page in a browser, take the picture and read your `elements` from that same page:

```ts
extract: {
  cleaned_html: false,
  metadata: false,
  elements: PRODUCT_ELEMENTS,
  screenshot: { type: 'viewport', viewport: { width: 1440, height: 1000 } },
},
```

ads, cookie banners and popups are removed before the capture, so you get a clean picture of the product. the screenshot link expires 24 hours after the scrape, so the script downloads the image and keeps the file. see the [screenshot docs](https://crawlbrulee.com/docs/scrape/screenshots) for full-page captures, mobile views and slicing tall pages.

## what it costs

| request | engine | proxy | credits |
| --- | --- | --- | --- |
| product data and a screenshot | screenshot (5) | advanced (×5) | 25 |

the values come with the screenshot at no extra cost. the free plan has 750 credits a month, enough for 30 product pages. don't need the picture? leave out `screenshot`, and the same request runs without a browser for 5 credits. a request that fails costs nothing. [how credits work](https://crawlbrulee.com/docs/credits-and-pricing).

## what we checked

- **robots.txt.** saturn.de allows all visitors on product pages. it only closes search and some list pages, and the script doesn't visit those.
- **terms of use.** the shop's terms of use (Nutzungsbedingungen, September 2025 version) don't forbid reading public product pages.
- **personal data.** reviews are written by people, so the script reads only the average rating and the review count. it keeps no names and no review texts.
- **images.** product photos belong to the shop and the brands. the script saves image links, not the images.
- **load.** one page, one request per run.

when you adapt this to your own project, check these again for your pages. this is not legal advice.

## when the shop changes its pages

shops redesign their pages. when a value comes back as `null`, open the page in your browser, inspect the element, and update its selector in `src/selectors.ts`. nothing else needs to change.

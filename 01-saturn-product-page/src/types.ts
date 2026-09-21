// the product as this lesson saves it to output/product.json

export interface Product {
  url: string
  name: string | null
  article_number: string | null
  price: number | null
  currency: 'EUR'
  rating: number | null
  review_count: number | null
  variants: Variant[]
  offers: Offer[]
  images: string[]
  scraped_at: string
}

// another version of the same product, e.g. "Airpods 4" next to "Airpods 4 mit ANC"
export interface Variant {
  name: string
  url: string | null
  // true for the version on the page we scraped
  current: boolean
}

// one way to buy the product, e.g. new or refurbished, each with its own price
export interface Offer {
  name: string
  price: number | null
}

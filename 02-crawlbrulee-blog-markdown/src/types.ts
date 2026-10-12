// the data this lesson works with: the crawlbrulee api requests and responses (only the fields the
// script uses), and the post as we save it. the full shapes are in the api docs:
// https://crawlbrulee.com/docs

// --- POST /api/map ---------------------------------------------------------------

export interface MapRequest {
  url: string
  sitemap_only?: boolean
  types?: { internal?: boolean; internal_subdomains?: boolean; external?: boolean }
  cache?: { max_age: number }
}

export interface MapResponse {
  links: { url: string }[]
  response_meta: { usage: Usage }
}

// --- POST /api/scrape ------------------------------------------------------------

export interface ScrapeRequest {
  url: string
  extract?: { markdown?: boolean; metadata?: boolean; cleaned_html?: boolean }
  cleanup?: { exclude_selectors?: string[] }
}

export interface ScrapeResponse {
  url: string
  // the status the site answered with for the page
  page_status_code: number
  markdown?: string
  metadata?: { title?: string; og_title?: string; description?: string; date_published?: string }
  response_meta: { usage: Usage }
}

// what one request cost
export interface Usage {
  total_credit_cost: number
}

// --- what we save ----------------------------------------------------------------

// one post, as listed in output/posts.json. its markdown is in `file`.
export interface Post {
  slug: string
  title: string
  description: string | null
  published: string | null
  url: string
  file: string
}

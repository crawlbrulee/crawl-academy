// crawl academy 02: a markdown copy of the crawlbrulee blog, with plain fetch and the crawlbrulee api.
// no sdk and no dependencies: two http endpoints, POST /api/map and POST /api/scrape.
//
// run it:  CRAWLBRULEE_API_KEY=cwbl_… pnpm scrape
// writes:  one markdown file per post in output/posts/, and an index in output/posts.json.
//
// the lesson in four files:
//   scrape-blog.ts  this file: find the posts, scrape them, save them
//   client.ts       the api client: one fetch call with your api key
//   output.ts       the files we write
//   types.ts        the api requests and responses, and the post as we save it

import * as crawlbrulee from './client.ts'
import { clearPosts, postFile, savePost, savePosts } from './output.ts'
import type { Post, ScrapeResponse } from './types.ts'

const SITE = 'https://crawlbrulee.com'
const POST_PATH = '/blog/'

// scrape at most this many posts in one run: the first ones the sitemap lists. enough for the
// lesson, and gentle on the site.
const MAX_POSTS = 10

// the parts of a post page that aren't the post. each entry is a css selector: we remove every
// element it matches before the markdown is written, in this order.
const NOT_THE_POST = [
  'header', // the menu at the top
  'footer',
  'aside', // the table of contents on wide screens
  'section', // the author box and the sign-up box at the end
  // the table of contents on small screens is a fold-out box with a nav inside. the FAQ answers
  // use the same fold-out box, so we remove only the one that holds a nav.
  'details:has(nav)',
  // the parts around the title have no class or id of their own, so we pick them by position
  'div:has(+ h1)', // the label right before the title, like "product updates"
  'h1 ~ div', // everything after the title in its block: the author's name, the date, the reading time
]

let credits = 0

// 1. find the posts.
// the site lists every page in its sitemaps: the blog, the docs and the legal pages.
// a map with sitemap_only reads them all in one call (1 credit), and we keep the blog posts.
const map = await crawlbrulee.map({
  url: SITE,
  sitemap_only: true,
  types: { internal: true, internal_subdomains: false, external: false },
  // read the sitemaps fresh, so the list matches the blog right now
  cache: { max_age: 0 },
})
credits += map.response_meta.usage.total_credit_cost

const postUrls = map.links.map((link) => link.url).filter((url) => new URL(url).pathname.startsWith(POST_PATH))
const toScrape = postUrls.slice(0, MAX_POSTS)
console.log(`the blog has ${postUrls.length} posts. scraping ${toScrape.length} of them.`)

// 2. read each post as markdown, without the parts that aren't the post.
// one at a time, so the site isn't hit with many requests at once.
// the blog pages are plain html, so this needs no browser (1 credit a page).
const posts: Post[] = []
await clearPosts()

for (const url of toScrape) {
  const page = await crawlbrulee.scrape({
    url,
    extract: { markdown: true, metadata: true, cleaned_html: false },
    cleanup: { exclude_selectors: NOT_THE_POST },
  })
  credits += page.response_meta.usage.total_credit_cost

  // a post that was taken down since the sitemap was written: skip it
  if (page.page_status_code !== 200 || !page.markdown) {
    console.log(`  skipped (${page.page_status_code}) ${url}`)
    continue
  }

  // 3. save one file per post, with the facts from the metadata on top
  const post = toPost(url, page)
  await savePost(post, page.markdown)
  posts.push(post)
  console.log(`  saved: ${post.title}`)
}

const indexFile = await savePosts(posts)
console.log(`saved ${posts.length} posts to output/posts/ and ${indexFile}`)
console.log(`credits used: ${credits}`)

// the post's facts, from its url and the page metadata
function toPost(url: string, page: ScrapeResponse): Post {
  const slug = new URL(url).pathname.slice(POST_PATH.length).replace(/\/$/, '')
  return {
    slug,
    title: page.metadata?.og_title?.replace(/ · crawlbrulee$/, '') ?? slug,
    description: page.metadata?.description ?? null,
    published: page.metadata?.date_published?.slice(0, 10) ?? null,
    url,
    file: postFile(slug),
  }
}

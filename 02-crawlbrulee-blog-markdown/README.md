# 🍮 crawl academy 02: our blog as markdown, one file per post

turn the posts on the [crawlbrulee blog](https://crawlbrulee.com/blog) into clean markdown files. one run finds the posts the blog has right now, and saves up to 10 of them, each with its title, description, date and url. the article [how to scrape blog posts into markdown](https://crawlbrulee.com/blog/scrape-blog-posts-to-markdown) explains the important parts.

this lesson calls the crawlbrulee api with plain `fetch`. there is no sdk and there are no runtime dependencies: two http endpoints are all you need.

```text
output/
├── posts.json
└── posts/
    ├── crawlbrulee-for-your-dpo.md
    ├── data-privacy-reasons-to-switch-web-scraping-provider.md
    ├── do-website-terms-bind-a-scraper.md
    ├── is-web-scraping-legal.md
    ├── scrape-blog-posts-to-markdown.md
    ├── scrape-ecommerce-product-data.md
    └── zero-data-retention.md
```

each file starts with the post's facts, then the post itself:

```markdown
---
title: "new in crawlbrulee: zero data retention"
description: "with zero data retention, your results stay out of our shared cache, your urls stay out of our logs, and a sync scrape stores nothing at all"
published: "2026-10-07"
url: "https://crawlbrulee.com/blog/zero-data-retention"
---

# new in crawlbrulee: zero data retention 🎉

zero data retention is now live in …
```

`output/posts.json` lists the same posts with the same facts and the name of each file. (files from 12 October 2026.)

## run it

```bash
export CRAWLBRULEE_API_KEY=cwbl_…   # free key: https://dashboard.crawlbrulee.com/auth/register?utm_source=github&utm_medium=crawl-academy&utm_campaign=crawl-academy-02
pnpm scrape
```

no install needed: the script has no dependencies. one command reads the sitemap and up to 10 posts in it.

## how it works

the lesson is four short files:

| file | what it does |
| --- | --- |
| [`src/scrape-blog.ts`](./src/scrape-blog.ts) | the run: find the posts, scrape them, save them |
| [`src/client.ts`](./src/client.ts) | the api client: one `fetch` call with your api key |
| [`src/output.ts`](./src/output.ts) | the files we write |
| [`src/types.ts`](./src/types.ts) | the api requests and responses, and the post as we save it |

### 1. call the api with fetch

the whole client is `src/client.ts`. every call is a `POST` with your api key as a `Bearer` token and a json body:

```ts
export async function map(request: MapRequest): Promise<MapResponse> {
  return post('/api/map', request)
}

export async function scrape(request: ScrapeRequest): Promise<ScrapeResponse> {
  return post('/api/scrape', request)
}

async function post(path: string, body: object) {
  const res = await fetch(`https://api.crawlbrulee.com${path}`, {
    method: 'POST',
    headers: { authorization: `Bearer ${API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  // on an error, the body says what went wrong, e.g. {"name":"unauthorized","message":"…"}
  if (!res.ok) throw new Error(`${path} failed with ${res.status}: ${await res.text()}`)
  return res.json()
}
```

a failed call stops the script with the status and the api's own message, like `401` and `unauthorized`.

the run file imports the client with `import * as crawlbrulee from './client.ts'`, so the calls read `crawlbrulee.map(…)` and `crawlbrulee.scrape(…)`.

the request and response types are in `src/types.ts`, with only the fields this script uses. the [js/ts sdk](https://www.npmjs.com/package/@crawlbrulee/sdk) gives you every field typed, typed errors and retries. here you see what happens on the wire.

### 2. find the posts with a map

you don't need to click through the blog page by page. like most sites, ours lists every page in a sitemap, for search engines. one call to `POST /api/map` reads it:

```ts
const map = await crawlbrulee.map({
  url: 'https://crawlbrulee.com',
  sitemap_only: true,
  types: { internal: true, internal_subdomains: false, external: false },
  cache: { max_age: 0 },
})
// map.links → [{ url: 'https://crawlbrulee.com/docs' }, …, { url: 'https://crawlbrulee.com/blog/zero-data-retention' }, …]
```

`sitemap_only: true` skips the home page and reads only the sitemaps. `cache: { max_age: 0 }` asks for a fresh read, so the list matches the blog right now. a map costs 1 credit. the [map docs](https://crawlbrulee.com/docs/map) cover pagination and big sites.

the map returns every page on the site: the docs, the legal pages and the blog. the script keeps the urls that start with `/blog/`, and takes the first 10 in the order the sitemap lists them (`MAX_POSTS`). that keeps a run small, however big the blog gets.

### 3. read each post as markdown

ask for `markdown`, and you get the page as clean text with its headings, lists, links and code blocks. `cleanup.exclude_selectors` leaves out the parts of the page that aren't the post. step 4 shows how.

```ts
const page = await crawlbrulee.scrape({
  url,
  extract: { markdown: true, metadata: true, cleaned_html: false },
  cleanup: { exclude_selectors: NOT_THE_POST },
})

page.markdown                  // "# new in crawlbrulee: zero data retention 🎉\n\n…"
page.metadata.date_published   // "2026-10-07T09:00:00.000Z"
```

our blog pages are plain html, so the request needs no browser: 1 credit a post. the script reads the posts one at a time, so the site never gets many requests at once. the [extraction docs](https://crawlbrulee.com/docs/scrape/extraction) cover the other formats.

### 4. leave out what isn't the post

a post page has more on it than the post: the menu, a table of contents, the author box and a sign-up box at the end. under the title sits a byline, the line with the author's name, the date and the reading time. you don't want any of that in every file.

two of these parts are more than clutter: the byline and the author box name a person. a name is personal data, and in the EU, collecting it falls under the GDPR. you need a lawful reason to collect it, and rules apply to how long you keep it and who you tell. the GDPR also asks you to collect only the personal data you need, and a markdown copy of a post doesn't need its author's name. so we leave the names out before the markdown is written, and they never reach your files. the easiest personal data to protect is the data you never collect. [is web scraping legal in the EU?](https://crawlbrulee.com/blog/is-web-scraping-legal) explains the rules in more detail.

`cleanup.exclude_selectors` takes a list of css selectors. we remove every element they match, in order, before we write the markdown:

```ts
const NOT_THE_POST = [
  'header',           // the menu at the top
  'footer',
  'aside',            // the table of contents on wide screens
  'section',          // the author box and the sign-up box at the end
  'details:has(nav)', // the table of contents on phones
  'div:has(+ h1)',    // the label right before the title
  'h1 ~ div',         // the byline: the author's name, the date, the reading time
]
```

the list uses three kinds of selectors:

- **a tag name.** our blog marks these parts with `header`, `footer`, `aside` and `section` tags, so the tag name is enough. pages built this way are the easy case.
- **a tag that holds something.** on phones, the table of contents opens from a fold-out `details` box. the FAQ answers at the end of some posts use the same box, and we want to keep those. `details:has(nav)` matches only the box with a `nav` inside, which is the table of contents.
- **a position.** the byline has no class or id of its own, only styling classes that can change with the next redesign. so we pick it by where it sits. `h1 ~ div` means "every `div` after the `h1`, in the same block". `div:has(+ h1)` is the `div` right before the `h1`: the post's label, like "product updates".

the result: each file starts with the post's title, then the post itself, with the FAQ answers as headings. the files name no author. the date is not lost: it is in each file's facts (step 5).

to find selectors for another site, open a page in your browser, right-click the part you don't want, and pick "inspect". before you add a selector to the list, try it in the browser console: `document.querySelectorAll('h1 ~ div')` shows what it matches.

ads, cookie banners and popups are removed by default. `exclude_selectors` is for the rest. it changes the markdown, the links, the images and the screenshot, but never `raw_html`, which is always the page as it arrived.

### 5. save one file per post

the metadata gives each post its facts: the title, the description and the date it was published. `toPost` in `src/scrape-blog.ts` reads them:

```ts
return {
  slug,
  title: page.metadata?.og_title?.replace(/ · crawlbrulee$/, '') ?? slug,
  description: page.metadata?.description ?? null,
  published: page.metadata?.date_published?.slice(0, 10) ?? null,
  url,
  file: postFile(slug),
}
```

then `savePost` in `src/output.ts` writes them at the top of the file, as a small yaml block, with the markdown below:

```ts
await savePost(post, page.markdown)
```

most markdown tools read this block, and so do AI agents: when one quotes a post, it has the title and the url to link back to.

## what it costs

| step | credits |
| --- | --- |
| the map (one sitemap read) | 1 |
| each post | 1 |

a run costs 1 credit for the map plus 1 per post, so 11 credits at most. when we wrote this, the blog had 7 posts, this one's article included: 8 credits. the free plan has 750 credits a month. [how credits work](https://crawlbrulee.com/docs/credits-and-pricing).

## make it yours

- **your own blog.** change `SITE` and `POST_PATH` to the blog's address and the path its posts start with. then open one post in your browser, inspect the parts around it, and put their selectors in `NOT_THE_POST`. on your own blog, you can raise `MAX_POSTS`. pointing it at someone else's blog? read its robots.txt and terms of use first. most blog posts are copyrighted: unless the owner says yes, keep the title, the date and a link, not the full text. this is not legal advice.
- **an AI agent's reading list.** point your agent, or the tool that indexes your documents, at `output/posts/`. each file carries its own title, date and url.

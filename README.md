# 🍮 crawl academy

hands-on web scraping lessons from [crawlbrulee](https://crawlbrulee.com). each lesson scrapes or crawls a real website and turns it into clean data you can use.

every folder in this repo is one lesson: a few short TypeScript files you can run as they are, and a readme that walks through them step by step. each lesson has an article on the crawlbrulee blog that explains the important parts.

## lessons

| # | lesson | what you get | how it calls crawlbrulee | article |
| --- | --- | --- | --- | --- |
| 01 | [a product page on saturn.de](./01-saturn-product-page) | name, price, rating, variants, offers, image links and a screenshot of one product | the [js/ts sdk](https://www.npmjs.com/package/@crawlbrulee/sdk) | [how to scrape ecommerce product data](https://crawlbrulee.com/blog/scrape-ecommerce-product-data) |
| 02 | [our blog as markdown](./02-crawlbrulee-blog-markdown) | up to 10 posts from the crawlbrulee blog, each as a markdown file | plain `fetch`, no dependencies | [how to scrape blog posts into markdown](https://crawlbrulee.com/blog/scrape-blog-posts-to-markdown) |

more lessons are on the way.

## before you start

- **Node.js 22.18 or later.** the scripts are `.ts` files that Node.js runs directly, so there is no build step.
- **pnpm.** if you don't have it yet: `npm install -g pnpm`, or see [pnpm.io/installation](https://pnpm.io/installation).
- **a crawlbrulee api key.** the free plan has 750 credits a month, no credit card needed: [create a free account](https://dashboard.crawlbrulee.com/auth/register?utm_source=github&utm_medium=crawl-academy&utm_campaign=crawl-academy). every lesson says how many credits it uses.

## run a lesson

```bash
git clone https://github.com/crawlbrulee/crawl-academy.git
cd crawl-academy/01-saturn-product-page
pnpm install
export CRAWLBRULEE_API_KEY=cwbl_…
pnpm scrape
```

each lesson writes its results into its own `output/` folder.

## scrape with care

the lessons only read public pages, and they follow a few rules you should keep in your own projects too:

- **check the site first.** read its `robots.txt` and terms of use, and stay inside them.
- **keep the load low.** ask for the pages you need, a few at a time, not the whole site at full speed.
- **leave personal data out.** collect facts about products and pages, not about people. for reviews, we keep the average rating and the review count, not the names or the texts.
- **link, don't copy.** product photos and texts belong to their owners. the lessons save image links, not the images.

this is general guidance, not legal advice.

## about crawlbrulee

crawlbrulee is EU-native web scraping for AI agents and developers.

- **built in the EU.** [processing and long-term storage run on EU servers](https://crawlbrulee.com/gdpr-compliant-web-scraping).
- **output made for models.** clean markdown, named values read by css selector, screenshots and page metadata.
- **the hard parts, handled.** headless Chrome when a page needs it, rotating proxies with country selection, automatic retries, and ad and cookie-banner removal.
- **start free.** 750 credits a month, no credit card.

**[get your free api key](https://dashboard.crawlbrulee.com/auth/register?utm_source=github&utm_medium=crawl-academy&utm_campaign=crawl-academy)** · [docs](https://crawlbrulee.com/docs)

## license

[Apache-2.0](./LICENSE). copy the code into your own projects.

// a tiny crawlbrulee api client: every call is a POST with your api key and a json body.

import type { MapRequest, MapResponse, ScrapeRequest, ScrapeResponse } from './types.ts'

const API_KEY = process.env.CRAWLBRULEE_API_KEY
if (!API_KEY) throw new Error('set CRAWLBRULEE_API_KEY first (get a free key at https://dashboard.crawlbrulee.com)')

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

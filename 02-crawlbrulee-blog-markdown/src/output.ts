// the files the script writes: one markdown file per post in output/posts/, and an index of every
// post in output/posts.json.

import { mkdir, rm, writeFile } from 'node:fs/promises'
import type { Post } from './types.ts'

const INDEX_FILE = 'output/posts.json'
const POSTS_DIR = 'output/posts'

// start each run with an empty folder, so it holds only the posts from this run
export async function clearPosts(): Promise<void> {
  await rm(POSTS_DIR, { recursive: true, force: true })
}

export function postFile(slug: string): string {
  return `${POSTS_DIR}/${slug}.md`
}

// the post's facts on top, then the post itself
export async function savePost(post: Post, markdown: string): Promise<void> {
  await mkdir(POSTS_DIR, { recursive: true })
  await writeFile(post.file, frontMatter(post) + markdown + '\n')
}

export async function savePosts(posts: Post[]): Promise<string> {
  await mkdir('output', { recursive: true })
  await writeFile(INDEX_FILE, JSON.stringify(posts, null, 2) + '\n')
  return INDEX_FILE
}

// a small yaml block on top of each file. most markdown tools and AI agents read it as the file's facts.
// JSON.stringify quotes each value, and a json string is valid yaml.
function frontMatter(post: Post): string {
  const lines = [
    `title: ${JSON.stringify(post.title)}`,
    `description: ${JSON.stringify(post.description)}`,
    `published: ${JSON.stringify(post.published)}`,
    `url: ${JSON.stringify(post.url)}`,
  ]
  return `---\n${lines.join('\n')}\n---\n\n`
}

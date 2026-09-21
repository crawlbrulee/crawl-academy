# Agent context

This file is auto-loaded by coding agents (Claude Code, Codex, Gemini CLI, and others).

## what this repo is

Hands-on web scraping lessons. Each numbered folder is one lesson that stands on its own:
its own `package.json`, a few TypeScript files under `src/`, and a `README.md`. Start with
`README.md`.

## working in a lesson

- Run it with `pnpm install` and `pnpm scrape`; check it with `pnpm typecheck`.
- Node.js 22.18+ runs the `.ts` files directly, so only erasable syntax: no enums, no
  namespaces, `import type` for types, and relative imports end in `.ts`.
- Lessons share no code: each folder must keep working on its own.

## crawlbrulee ecosystem

This repository is one component of the broader crawlbrulee ecosystem of related projects.
The authoritative `crawlbrulee-ecosystem` skill — the full map of related projects,
shared-code locations, and the cross-project conventions — lives one level up, in the
maintainer's umbrella checkout:

    ../.agents/skills/crawlbrulee-ecosystem/SKILL.md

Read it from there when you need the bigger picture. It may be absent if this repository
was cloned on its own. It is also exposed locally as the `crawlbrulee-ecosystem` skill
(`.agents/skills/crawlbrulee-ecosystem/`), which agents discover via the
`.claude/skills` symlink.

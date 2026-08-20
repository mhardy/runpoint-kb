# @runpoint/kb

Generate static support pages from markdown. Pure file-in, file-out — no network calls, no caching.

**This is just a markdown → HTML generator, nothing more.** It runs once at build time and produces static files; there is no runtime component, no database, and no request-time code path. An earlier version (0.1.0) fetched articles from Supabase at request time inside a Cloudflare Worker, with its own search index and cache layer — that design was deliberately scrapped (see commit `4c8df6f`, "stop over engineering, we have AI, we don't need a CMS") in favor of this: markdown files in git are the CMS, and an LLM can search/summarize them if needed instead of hand-rolled full-text search. If you find code here that talks to a database or handles a live request, it's a regression — delete it.

Currently consumed by rouzz.app (`content/support` → `public/support`, built via `npm run build`). Not yet wired into any other site.

## Usage

```javascript
import { generateSupportPages } from "@runpoint/kb";

await generateSupportPages("./content/support", "./public/support", {
  siteNavHtml: '<nav class="site-nav">…</nav>',
  siteNavCssHref: "/assets/site-nav.css",
  siteNavScript: 'document.querySelector(".site-nav").classList.add("ready");',
});
```

All three options are optional. When omitted, generated pages are unchanged.

Each `.md` file in `sourceDir` becomes `outDir/<slug>/index.html`. An index listing all articles (alphabetically by title) is written to `outDir/index.html`.

### Frontmatter

```yaml
---
title: Required display title
excerpt: Optional short summary for the index page
slug: optional-url-slug   # defaults to filename without extension
---
```

## CLI

```bash
npx @runpoint/kb ./content/support ./public/support
```

Or from a consumer's `package.json` build script:

```json
{
  "scripts": {
    "build:support": "kb ./content/support ./public/support"
  }
}
```

## Local test

```bash
npm install
node test/check.mjs
```

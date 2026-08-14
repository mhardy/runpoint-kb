# @runpoint/kb

Generate static support pages from markdown. Pure file-in, file-out — no network calls, no caching.

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

# runpoint-kb

Shared package that renders published knowledge-base articles as HTML at request time inside a Cloudflare Worker. Consumed by site repos as a local `file:` dependency — no npm publish, no build step.

## Usage

```javascript
import { handleKbRequest } from "runpoint-kb";

export default {
  async fetch(request, env) {
    const kb = await handleKbRequest(request, env, {
      appSlug: "rouzz",
      basePath: "/support",
    });
    if (kb) return kb;

    return env.ASSETS.fetch(request);
  },
};
```

Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` in the consumer's `wrangler.jsonc` `vars` (public anon key; RLS protects data).

## Routes

Under `basePath` (default `/support`):

| Path | Response |
|------|----------|
| `/support` | Article index (HTML) |
| `/support/{slug}` | Single article (HTML) |
| `/support/search-index.json` | Search index (JSON) |

Returns `null` for non-KB paths so the caller can fall through to other routing.

## Local test

```bash
npm install
node test/check.mjs
```

Reads credentials from `.env` and verifies fetch, render, and Cache API behavior against the live Supabase project.

## Exports

- `handleKbRequest` — main Worker entry
- `fetchApp`, `fetchArticles`, `fetchArticle` — Supabase REST helpers
- `renderIndexPage`, `renderArticlePage`, `brandingFromApp` — HTML rendering
- `buildSearchIndex`, `searchWidgetScript` — client-side Fuse.js search

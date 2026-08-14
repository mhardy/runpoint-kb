### Use this prompt to add KB support pages to any site repo.
---

## Fill in before running

- `SOURCE_DIR` = path to this site's markdown article files, wherever they already live (e.g. `content/support`, `kb` — check what's actually in this repo)
- `OUT_DIR` = where generated HTML should land, e.g. `support` — **must** be inside this repo's `wrangler.jsonc` `assets.directory`, or Cloudflare won't deploy it
- Decide: does this site need its KB pages to match the main site's nav? (Y/N)

---

You are working in a site repo for one of Runpoint's apps. These sites run as Cloudflare Workers with static assets — look for `wrangler.jsonc`/`wrangler.toml` (`assets.directory` + `run_worker_first: true`) and a `worker.js` entry point. Cloudflare is git-connected and auto-deploys on push, running a configurable **Build command** before `wrangler deploy` — that's where this fits in.

If `worker.js` or `wrangler.jsonc` already reference `@runpoint/kb`, `handleKbRequest`, `SUPABASE_URL`, or `SUPABASE_ANON_KEY` — remove all of it. That was an earlier, abandoned design where the package fetched from a database and rendered per-request. The current `@runpoint/kb` only generates static files at build time; it has no request-time code path and needs no Worker wiring at all.

Add `@runpoint/kb` as a dependency: `"@runpoint/kb": "github:mhardy/runpoint-kb"`.

**If nav-matching is not needed:** add a `build` script to `package.json`: `"build": "kb SOURCE_DIR OUT_DIR"`.

**If nav-matching is needed:** extract the site's existing nav into `public/site-nav.css` (styles) and `site-nav.js` (exporting `siteNavHtml`, `siteNavCssHref`, `siteNavScript` strings — adjust in-page hash links to `/#section` so they work from `/OUT_DIR/*`), and link `site-nav.css` from the homepage too so it stays in sync. Then write a small local build script (e.g. `scripts/build-support.mjs`) that imports `generateSupportPages` and `siteNavHtml`/`siteNavCssHref`/`siteNavScript`, calls `generateSupportPages(SOURCE_DIR, OUT_DIR, { siteNavHtml, siteNavCssHref, siteNavScript })`, and set `package.json`'s `build` script to run it (the plain `kb` CLI can't pass nav options — only the JS API can).

Add a **Support** nav link to `/OUT_DIR/` in the site's header (and footer, if it has footer links), matching existing markup/styling. Skip if one already exists.

**Manual step — cannot be automated in code:** in the Cloudflare dashboard, go to this Worker's **Settings → Build** and set the **Build command** to `npm run build` (Cloudflare does not honor build config from `wrangler.jsonc`/`wrangler.toml` — this has to be set per-project in the dashboard, once). Add a line to this repo's own `README.md` documenting that this step was done and must be redone if the project is ever recreated.

**Check:** run the build script locally, then `wrangler dev` — confirm `/OUT_DIR/` and `/OUT_DIR/<a-real-article-slug>` render real HTML (view-source, not just what the browser shows) with nav matching if applicable, and every pre-existing route still works. Push to trigger the real Cloudflare build; check the **Builds** tab on that Worker to confirm the build command ran, then verify live.

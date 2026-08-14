### Use this prompt in any new site that will use the kb articles.
----


## Fill in before running

APP_SLUG = (this app's KB slug, as created in `/app/kb` on `admin.rpoint.com` — the only thing that changes per site)


KB_PACKAGE_REPO = mhardy/runpoint-kb
SUPABASE_URL = (Runpoint shared Supabase project URL — copy from any existing site’s `wrangler.jsonc`)
SUPABASE_ANON_KEY = (Runpoint shared publishable anon key — copy from any existing site’s `wrangler.jsonc`)

---

You are working in a site repo for one of Runpoint's apps. These sites run as Cloudflare Workers with static assets (not Cloudflare Pages) — look for `wrangler.jsonc`/`wrangler.toml` (`assets.directory` + `run_worker_first: true`) and a `worker.js` entry point, deployed via `wrangler deploy`. Before changing anything, read the existing `worker.js` and `wrangler.jsonc` in full to understand what this site already does — some sites route a `support.<domain>` subdomain through the worker for a contact form, some may have no support-related routing at all yet, and the exact structure varies per site. Do not assume a specific existing pattern; adapt to whatever this repo actually has.

Your task: wire in the `@runpoint/kb` package — a shared package hosted at `KB_PACKAGE_REPO` on GitHub — so that KB articles for this app render at `/support/*`.

Add `@runpoint/kb` as a dependency in `package.json`, referencing the GitHub repo: `"@runpoint/kb": "github:KB_PACKAGE_REPO"`.

In `worker.js`, import `handleKbRequest` from `@runpoint/kb`. Before the final static-assets fallback (`env.ASSETS.fetch(request)`), call `handleKbRequest(request, env, { appSlug: 'APP_SLUG' })` for requests whose path starts with `/support/` (article pages, the listing page, the search-index route), or — only if this site already has a `support.<domain>` subdomain routed through the worker — for that host with a non-root path too. If it returns a `Response`, return that; if it returns `null`, fall through exactly as the existing code does now. This must be purely additive: do not change or remove any of the site's existing routes, handlers, or behavior (contact forms, API routes, existing static pages, etc.) — if this site already serves something at `/support` (e.g. a hand-written page), ask how to reconcile that before overwriting it rather than assuming it should be replaced.

Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` (values above) to `wrangler.jsonc`'s `vars`, hardcoded (plain vars, not `wrangler secret` — the anon key is meant to be public, RLS is what protects the data, and it's fine to commit). Same project, same values, every site.

**Check:** run `wrangler dev` locally and hit `/support/` and `/support/<an-existing-published-article-slug>` — confirm a real published article for `APP_SLUG` renders as real HTML (check view-source, not just what the browser shows), with correct branding, and that every pre-existing route on this site still works unchanged. Then deploy (`npm run deploy` or equivalent) and confirm the same thing live. Publishing an edit to the article from `/app/kb` should show up on the live site within a few minutes without a redeploy.

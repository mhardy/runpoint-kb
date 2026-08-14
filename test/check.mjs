import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { fetchArticles, fetchArticle } from "../src/fetch.js";
import { handleKbRequest } from "../src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnv() {
  const envPath = resolve(root, ".env");
  const text = readFileSync(envPath, "utf8");
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return env;
}

/** Minimal Cache API polyfill so handleKbRequest caching can be exercised in Node. */
function installCachePolyfill() {
  const store = new Map();
  globalThis.caches = {
    default: {
      async match(request) {
        const key = typeof request === "string" ? request : request.url;
        const hit = store.get(key);
        return hit ? hit.clone() : undefined;
      },
      async put(request, response) {
        const key = typeof request === "string" ? request : request.url;
        store.set(key, response.clone());
      },
      _store: store,
    },
  };
}

function countSupabaseRequests() {
  let count = 0;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;
    if (url.includes("/rest/v1/kb_")) {
      count += 1;
    }
    return originalFetch(input, init);
  };
  return {
    get count() {
      return count;
    },
    restore() {
      globalThis.fetch = originalFetch;
    },
  };
}

const fileEnv = loadEnv();
const env = {
  SUPABASE_URL: fileEnv.SUPABASE_URL,
  SUPABASE_ANON_KEY: fileEnv.SUPABASE_ANON_KEY,
};

if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env");
  process.exit(1);
}

const APP_SLUG = "rouzz";

console.log("=== fetchArticles ===");
const articles = await fetchArticles(APP_SLUG, env);
console.log(`Found ${articles.length} published article(s):`);
for (const a of articles) {
  console.log(`  - ${a.slug}: ${a.title}`);
}

if (articles.length === 0) {
  console.error("No published articles to test.");
  process.exit(1);
}

const sampleSlug = articles[0].slug;

console.log("\n=== fetchArticle ===");
const article = await fetchArticle(APP_SLUG, sampleSlug, env);
console.log(`Title: ${article.title}`);
console.log(`Body preview: ${article.body_markdown.slice(0, 120).replace(/\s+/g, " ")}…`);

installCachePolyfill();
const spy = countSupabaseRequests();

const articleUrl = `https://example.com/support/${sampleSlug}`;
const request = new Request(articleUrl);

console.log("\n=== handleKbRequest (first call — expect cache MISS) ===");
const first = await handleKbRequest(request, env, { appSlug: APP_SLUG, basePath: "/support" });
const firstText = await first.text();
const supabaseAfterFirst = spy.count;

console.log(`Status: ${first.status}`);
console.log(`Supabase REST calls: ${supabaseAfterFirst}`);
console.log(`Contains title: ${firstText.includes(article.title)}`);
console.log(`Contains body fragment: ${firstText.includes("AlarmKit")}`);

console.log("\n=== handleKbRequest (second call — expect cache HIT) ===");
const second = await handleKbRequest(new Request(articleUrl), env, {
  appSlug: APP_SLUG,
  basePath: "/support",
});
const secondText = await second.text();
const supabaseAfterSecond = spy.count;

console.log(`Status: ${second.status}`);
console.log(`Supabase REST calls (total): ${supabaseAfterSecond}`);
console.log(`Cache hit confirmed: ${supabaseAfterSecond === supabaseAfterFirst}`);

if (supabaseAfterSecond !== supabaseAfterFirst) {
  console.error("FAIL: second request refetched from Supabase instead of serving from cache.");
  spy.restore();
  process.exit(1);
}

if (!secondText.includes(article.title)) {
  console.error("FAIL: cached response missing article title.");
  spy.restore();
  process.exit(1);
}

spy.restore();
console.log("\nAll checks passed.");

import { fetchApp, fetchArticles, fetchArticle } from "./fetch.js";
import { brandingFromApp, renderIndexPage, renderArticlePage } from "./render.js";
import { buildSearchIndex } from "./searchIndex.js";

const CACHE_TTL_SECONDS = 300;

/**
 * @param {string} basePath
 */
function normalizeBasePath(basePath) {
  if (!basePath.startsWith("/")) {
    return `/${basePath.replace(/\/$/, "")}`;
  }
  return basePath.replace(/\/$/, "") || "/";
}

/**
 * @param {URL} url
 * @param {string} basePath
 * @returns {'index' | 'search-index' | { type: 'article', slug: string } | null}
 */
function matchKbRoute(url, basePath) {
  const base = normalizeBasePath(basePath);
  const { pathname } = url;

  if (pathname !== base && !pathname.startsWith(`${base}/`)) {
    return null;
  }

  const rest = pathname.slice(base.length) || "/";
  if (rest === "/" || rest === "") {
    return "index";
  }

  const segment = rest.slice(1);
  if (segment === "search-index.json") {
    return "search-index";
  }

  if (segment && !segment.includes("/")) {
    return { type: "article", slug: decodeURIComponent(segment) };
  }

  return null;
}

/**
 * @param {Response} response
 */
function withCacheHeaders(response) {
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", `public, max-age=${CACHE_TTL_SECONDS}`);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * @param {Request} request
 * @param {Response} response
 */
async function cachePut(request, response) {
  const cache = caches.default;
  const cached = withCacheHeaders(response);
  await cache.put(request, cached.clone());
  return cached;
}

/**
 * @param {Request} request
 * @param {{ SUPABASE_URL: string, SUPABASE_ANON_KEY: string }} env
 * @param {{ appSlug: string, basePath?: string }} options
 * @returns {Promise<Response | null>}
 */
export async function handleKbRequest(request, env, options) {
  const { appSlug, basePath = "/support" } = options;
  const url = new URL(request.url);
  const route = matchKbRoute(url, basePath);

  if (!route) {
    return null;
  }

  const cache = caches.default;
  const cached = await cache.match(request);
  if (cached) {
    return cached;
  }

  const app = await fetchApp(appSlug, env);
  if (!app) {
    return new Response("Not Found", { status: 404 });
  }

  const branding = brandingFromApp(app, normalizeBasePath(basePath));
  const kbBase = normalizeBasePath(basePath);

  if (route === "index") {
    const articles = await fetchArticles(appSlug, env);
    const html = renderIndexPage(articles, branding, kbBase);
    return cachePut(
      request,
      new Response(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }),
    );
  }

  if (route === "search-index") {
    const articles = await fetchArticles(appSlug, env);
    const index = buildSearchIndex(articles);
    return cachePut(
      request,
      new Response(JSON.stringify(index), {
        headers: { "Content-Type": "application/json; charset=utf-8" },
      }),
    );
  }

  if (route.type === "article") {
    const article = await fetchArticle(appSlug, route.slug, env);
    if (!article) {
      return new Response("Not Found", { status: 404 });
    }
    const html = renderArticlePage(article, branding, kbBase);
    return cachePut(
      request,
      new Response(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }),
    );
  }

  return null;
}

export { fetchApp, fetchArticles, fetchArticle } from "./fetch.js";
export { brandingFromApp, renderIndexPage, renderArticlePage } from "./render.js";
export { buildSearchIndex, searchWidgetScript } from "./searchIndex.js";

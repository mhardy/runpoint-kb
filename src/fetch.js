const SUPABASE_HEADERS = (env) => ({
  apikey: env.SUPABASE_ANON_KEY,
  Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
});

/**
 * @param {string} appSlug
 * @param {{ SUPABASE_URL: string, SUPABASE_ANON_KEY: string }} env
 * @returns {Promise<object | null>}
 */
export async function fetchApp(appSlug, env) {
  const url = new URL(`${env.SUPABASE_URL}/rest/v1/kb_apps`);
  url.searchParams.set("select", "slug,name,domain,theme");
  url.searchParams.set("slug", `eq.${appSlug}`);

  const res = await fetch(url, { headers: SUPABASE_HEADERS(env) });
  if (!res.ok) {
    throw new Error(`fetchApp failed: ${res.status} ${await res.text()}`);
  }

  const rows = await res.json();
  return rows[0] ?? null;
}

/**
 * @param {string} appSlug
 * @param {{ SUPABASE_URL: string, SUPABASE_ANON_KEY: string }} env
 * @returns {Promise<object[]>}
 */
export async function fetchArticles(appSlug, env) {
  const url = new URL(`${env.SUPABASE_URL}/rest/v1/kb_articles`);
  url.searchParams.set("select", "slug,title,excerpt");
  url.searchParams.set("app_slug", `eq.${appSlug}`);
  url.searchParams.set("status", "eq.published");
  url.searchParams.set("order", "title.asc");

  const res = await fetch(url, { headers: SUPABASE_HEADERS(env) });
  if (!res.ok) {
    throw new Error(`fetchArticles failed: ${res.status} ${await res.text()}`);
  }

  return res.json();
}

/**
 * @param {string} appSlug
 * @param {string} articleSlug
 * @param {{ SUPABASE_URL: string, SUPABASE_ANON_KEY: string }} env
 * @returns {Promise<object | null>}
 */
export async function fetchArticle(appSlug, articleSlug, env) {
  const url = new URL(`${env.SUPABASE_URL}/rest/v1/kb_articles`);
  url.searchParams.set("select", "slug,title,body_markdown,updated_at");
  url.searchParams.set("app_slug", `eq.${appSlug}`);
  url.searchParams.set("slug", `eq.${articleSlug}`);
  url.searchParams.set("status", "eq.published");

  const res = await fetch(url, { headers: SUPABASE_HEADERS(env) });
  if (!res.ok) {
    throw new Error(`fetchArticle failed: ${res.status} ${await res.text()}`);
  }

  const rows = await res.json();
  return rows[0] ?? null;
}

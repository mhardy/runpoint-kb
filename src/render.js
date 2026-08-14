import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: false });

/**
 * @param {object} app
 * @param {string} basePath
 * @returns {{ appName: string, accentColor: string, logoUrl: string | null, backToAppUrl: string | null, faviconUrl: string | null, background: string, primaryText: string, secondaryText: string }}
 */
export function brandingFromApp(app, basePath) {
  const theme = app.theme && typeof app.theme === "object" ? app.theme : {};
  let backToAppUrl = null;
  if (app.domain) {
    if (app.domain.startsWith("support.")) {
      backToAppUrl = `https://${app.domain.slice("support.".length)}`;
    } else {
      backToAppUrl = `https://${app.domain}`;
    }
  }

  return {
    appName: app.name,
    accentColor: theme.accent ?? "#2563eb",
    logoUrl: theme.logoUrl ?? null,
    backToAppUrl,
    faviconUrl: theme.faviconUrl ?? theme.logoUrl ?? null,
    background: theme.background ?? "#ffffff",
    primaryText: theme.primaryText ?? "#18181b",
    secondaryText: theme.secondaryText ?? "#71717a",
  };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * @param {{ title: string, branding: ReturnType<typeof brandingFromApp>, bodyHtml: string, basePath: string, siteNavHtml?: string, siteNavCssHref?: string, siteNavScript?: string }} params
 */
function pageShell({ title, branding, bodyHtml, basePath, siteNavHtml, siteNavCssHref, siteNavScript }) {
  const { appName, accentColor, logoUrl, backToAppUrl, faviconUrl, background, primaryText, secondaryText } =
    branding;

  const favicon = faviconUrl
    ? `<link rel="icon" href="${escapeHtml(faviconUrl)}">`
    : "";
  const siteNavLink = siteNavCssHref
    ? `<link rel="stylesheet" href="${escapeHtml(siteNavCssHref)}">`
    : "";
  const navScript = siteNavScript ? `<script>${siteNavScript}</script>` : "";

  const defaultHeader = `<header class="site-header">
    <div class="site-header-inner">
      <div class="brand-row">
        ${logoUrl ? `<img class="logo" src="${escapeHtml(logoUrl)}" alt="${escapeHtml(appName)}" width="40" height="40">` : ""}
        <h1 class="brand-title"><a href="${escapeHtml(basePath)}">${escapeHtml(appName)} Help</a></h1>
      </div>
      ${backToAppUrl ? `<a class="back-link" href="${escapeHtml(backToAppUrl)}">← Back to ${escapeHtml(appName)}</a>` : ""}
    </div>
  </header>`;

  const headerBlock = siteNavHtml ?? defaultHeader;
  const kbStyles = siteNavHtml
    ? getSiteNavKbStyles()
    : getDefaultKbStyles({ accentColor, background, primaryText, secondaryText });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} · ${escapeHtml(appName)} Help</title>
  ${favicon}
  ${siteNavLink}
  <style>${kbStyles}</style>
</head>
<body>
  ${headerBlock}
  <main>
    ${bodyHtml}
  </main>
  ${navScript}
</body>
</html>`;
}

function getDefaultKbStyles({ accentColor, background, primaryText, secondaryText }) {
  return `
    :root {
      --accent: ${escapeHtml(accentColor)};
      --bg: ${escapeHtml(background)};
      --text: ${escapeHtml(primaryText)};
      --muted: ${escapeHtml(secondaryText)};
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.6;
      color: var(--text);
      background: var(--bg);
    }
    a { color: var(--accent); }
    .site-header {
      border-bottom: 1px solid color-mix(in srgb, var(--muted) 25%, transparent);
      background: color-mix(in srgb, var(--bg) 92%, white);
    }
    .site-header-inner,
    main {
      max-width: 44rem;
      margin: 0 auto;
      padding: 1.25rem 1.5rem;
    }
    .brand-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .logo { border-radius: 0.625rem; }
    .brand-title {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
    }
    .brand-title a { color: inherit; text-decoration: none; }
    .back-link {
      display: inline-block;
      margin-top: 0.75rem;
      font-size: 0.875rem;
      text-decoration: none;
      color: var(--muted);
    }
    .back-link:hover { color: var(--accent); }
    ${getSharedKbContentStyles("var(--text)", "var(--muted)", "var(--accent)")}`;
}

function getSiteNavKbStyles() {
  return `
    main {
      max-width: 44rem;
      margin: 0 auto;
      padding: 1.25rem 1.5rem;
    }
    a { color: var(--alarm); }
    ${getSharedKbContentStyles("var(--ink)", "var(--muted)", "var(--alarm)")}`;
}

function getSharedKbContentStyles(textVar, mutedVar, accentVar) {
  return `
    .search-wrap { margin: 1.5rem 0 0.5rem; }
    .search-input {
      width: 100%;
      padding: 0.625rem 0.875rem;
      border: 1px solid color-mix(in srgb, ${mutedVar} 30%, transparent);
      border-radius: 0.5rem;
      font: inherit;
      background: white;
    }
    .search-results {
      list-style: none;
      margin: 0.5rem 0 0;
      padding: 0;
    }
    .search-results li { margin: 0.375rem 0; }
    .search-results a { text-decoration: none; font-weight: 500; color: ${accentVar}; }
    .search-results p {
      margin: 0.125rem 0 0;
      font-size: 0.875rem;
      color: ${mutedVar};
    }
    .article-list {
      list-style: none;
      margin: 1.5rem 0 0;
      padding: 0;
    }
    .article-list li {
      border-bottom: 1px solid color-mix(in srgb, ${mutedVar} 20%, transparent);
      padding: 0.875rem 0;
    }
    .article-list a {
      font-size: 1.0625rem;
      font-weight: 600;
      text-decoration: none;
      color: ${textVar};
    }
    .article-list a:hover { color: ${accentVar}; }
    .article-list p {
      margin: 0.25rem 0 0;
      font-size: 0.9375rem;
      color: ${mutedVar};
    }
    .prose h1, .prose h2, .prose h3, .prose h4 {
      line-height: 1.25;
      margin: 1.75rem 0 0.75rem;
    }
    .prose h1 { font-size: 1.875rem; margin-top: 0; }
    .prose h2 { font-size: 1.375rem; }
    .prose h3 { font-size: 1.125rem; }
    .prose p, .prose ul, .prose ol { margin: 0.75rem 0; }
    .prose ul, .prose ol { padding-left: 1.5rem; }
    .prose li { margin: 0.25rem 0; }
    .prose table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9375rem;
    }
    .prose th, .prose td {
      border: 1px solid color-mix(in srgb, ${mutedVar} 25%, transparent);
      padding: 0.5rem 0.625rem;
      text-align: left;
    }
    .prose th { background: color-mix(in srgb, ${mutedVar} 8%, transparent); }
    .prose code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 0.875em;
      background: color-mix(in srgb, ${mutedVar} 10%, transparent);
      padding: 0.125rem 0.375rem;
      border-radius: 0.25rem;
    }
    .prose pre {
      overflow-x: auto;
      padding: 0.875rem 1rem;
      border-radius: 0.5rem;
      background: color-mix(in srgb, ${mutedVar} 10%, transparent);
    }
    .prose pre code { background: none; padding: 0; }
    .article-meta {
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid color-mix(in srgb, ${mutedVar} 20%, transparent);
      font-size: 0.875rem;
      color: ${mutedVar};
    }
    .article-meta a { color: ${accentVar}; }`;
}

/**
 * @param {object[]} articles
 * @param {ReturnType<typeof brandingFromApp>} branding
 * @param {string} basePath
 * @param {{ siteNavHtml?: string, siteNavCssHref?: string, siteNavScript?: string }} [chrome]
 */
export function renderIndexPage(articles, branding, basePath, chrome = {}) {
  const listItems = articles
    .map((article) => {
      const excerpt = article.excerpt
        ? `<p>${escapeHtml(article.excerpt)}</p>`
        : "";
      return `<li><a href="${escapeHtml(basePath)}/${escapeHtml(article.slug)}">${escapeHtml(article.title)}</a>${excerpt}</li>`;
    })
    .join("\n");

  const bodyHtml = `
    <div class="search-wrap" id="kb-search" data-index-url="${escapeHtml(basePath)}/search-index.json" data-base-path="${escapeHtml(basePath)}"></div>
    <ul class="article-list">
      ${listItems || "<li>No articles published yet.</li>"}
    </ul>
    <script>${getInlineSearchScript()}</script>`;

  return pageShell({
    title: "Help Center",
    branding,
    bodyHtml,
    basePath,
    ...chrome,
  });
}

/**
 * @param {object} article
 * @param {ReturnType<typeof brandingFromApp>} branding
 * @param {string} basePath
 * @param {{ siteNavHtml?: string, siteNavCssHref?: string, siteNavScript?: string }} [chrome]
 */
export function renderArticlePage(article, branding, basePath, chrome = {}) {
  const htmlBody = marked.parse(article.body_markdown ?? "");
  const updated = article.updated_at
    ? `<p class="article-meta">Last updated ${escapeHtml(new Date(article.updated_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }))}</p>`
    : "";

  const bodyHtml = `
    <article class="prose">
      <h1>${escapeHtml(article.title)}</h1>
      ${htmlBody}
      ${updated}
    </article>
    <p class="article-meta"><a href="${escapeHtml(basePath)}">← All articles</a></p>`;

  return pageShell({
    title: article.title,
    branding,
    bodyHtml,
    basePath,
    ...chrome,
  });
}

/** Inline search bootstrap (Fuse loaded from CDN). */
function getInlineSearchScript() {
  return `(function(){
  var root=document.getElementById("kb-search");
  if(!root) return;
  var indexUrl=root.getAttribute("data-index-url");
  var basePath=root.getAttribute("data-base-path")||"";
  root.innerHTML='<input type="search" class="search-input" placeholder="Search help articles…" aria-label="Search help articles"><ul class="search-results" hidden></ul>';
  var input=root.querySelector(".search-input");
  var results=root.querySelector(".search-results");
  var fuse=null;
  fetch(indexUrl).then(function(r){return r.json()}).then(function(items){
    if(typeof Fuse==="undefined"){
      var s=document.createElement("script");
      s.src="https://cdn.jsdelivr.net/npm/fuse.js@7.1.0/dist/fuse.min.js";
      s.onload=function(){initFuse(items)};
      document.head.appendChild(s);
    } else { initFuse(items); }
  }).catch(function(){});
  function initFuse(items){
    fuse=new Fuse(items,{keys:["title","excerpt"],threshold:0.35,ignoreLocation:true});
  }
  input.addEventListener("input",function(){
    if(!fuse){return;}
    var q=input.value.trim();
    if(!q){results.hidden=true;results.innerHTML="";return;}
    var hits=fuse.search(q,{limit:8});
    if(!hits.length){results.hidden=true;results.innerHTML="";return;}
    results.innerHTML=hits.map(function(h){
      var a=h.item;
      var ex=a.excerpt?'<p>'+a.excerpt.replace(/</g,"&lt;")+'</p>':"";
      return '<li><a href="'+basePath+'/'+a.slug+'">'+a.title.replace(/</g,"&lt;")+'</a>'+ex+'</li>';
    }).join("");
    results.hidden=false;
  });
})();`;
}

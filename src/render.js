import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: false });

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pageShell({ title, bodyHtml }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>${getPageStyles()}</style>
</head>
<body>
  <main>
    ${bodyHtml}
  </main>
</body>
</html>`;
}

function getPageStyles() {
  return `
    :root {
      --text: #18181b;
      --muted: #71717a;
      --accent: #2563eb;
      --border: color-mix(in srgb, var(--muted) 20%, transparent);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.6;
      color: var(--text);
      background: #ffffff;
    }
    a { color: var(--accent); }
    main {
      max-width: 44rem;
      margin: 0 auto;
      padding: 1.25rem 1.5rem;
    }
    .article-list {
      list-style: none;
      margin: 1.5rem 0 0;
      padding: 0;
    }
    .article-list li {
      border-bottom: 1px solid var(--border);
      padding: 0.875rem 0;
    }
    .article-list a {
      font-size: 1.0625rem;
      font-weight: 600;
      text-decoration: none;
      color: var(--text);
    }
    .article-list a:hover { color: var(--accent); }
    .article-list p {
      margin: 0.25rem 0 0;
      font-size: 0.9375rem;
      color: var(--muted);
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
      border: 1px solid color-mix(in srgb, var(--muted) 25%, transparent);
      padding: 0.5rem 0.625rem;
      text-align: left;
    }
    .prose th { background: color-mix(in srgb, var(--muted) 8%, transparent); }
    .prose code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 0.875em;
      background: color-mix(in srgb, var(--muted) 10%, transparent);
      padding: 0.125rem 0.375rem;
      border-radius: 0.25rem;
    }
    .prose pre {
      overflow-x: auto;
      padding: 0.875rem 1rem;
      border-radius: 0.5rem;
      background: color-mix(in srgb, var(--muted) 10%, transparent);
    }
    .prose pre code { background: none; padding: 0; }
    .back-link {
      margin-top: 2rem;
      font-size: 0.875rem;
    }`;
}

/**
 * @param {{ slug: string, title: string, excerpt?: string }[]} articles
 */
export function renderIndexPage(articles) {
  const listItems = articles
    .map((article) => {
      const excerpt = article.excerpt
        ? `<p>${escapeHtml(article.excerpt)}</p>`
        : "";
      return `<li><a href="${escapeHtml(article.slug)}/">${escapeHtml(article.title)}</a>${excerpt}</li>`;
    })
    .join("\n");

  const bodyHtml = `
    <h1>Help Center</h1>
    <ul class="article-list">
      ${listItems || "<li>No articles yet.</li>"}
    </ul>`;

  return pageShell({ title: "Help Center", bodyHtml });
}

/**
 * @param {{ slug: string, title: string, markdown: string }} article
 */
export function renderArticlePage(article) {
  const htmlBody = marked.parse(article.markdown ?? "");

  const bodyHtml = `
    <article class="prose">
      <h1>${escapeHtml(article.title)}</h1>
      ${htmlBody}
    </article>
    <p class="back-link"><a href="../">← All articles</a></p>`;

  return pageShell({ title: article.title, bodyHtml });
}

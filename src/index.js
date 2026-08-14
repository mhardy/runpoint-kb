import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import { join, basename, extname } from "node:path";
import matter from "gray-matter";

import { renderArticlePage, renderIndexPage } from "./render.js";

/**
 * @param {string} sourceDir
 * @param {string} outDir
 * @param {{ siteNavHtml?: string, siteNavCssHref?: string, siteNavScript?: string }} [options]
 */
export async function generateSupportPages(sourceDir, outDir, options = {}) {
  const entries = await readdir(sourceDir, { withFileTypes: true });
  const mdFiles = entries
    .filter((entry) => entry.isFile() && extname(entry.name).toLowerCase() === ".md")
    .map((entry) => entry.name);

  /** @type {{ slug: string, title: string, excerpt?: string, markdown: string }[]} */
  const articles = [];

  for (const filename of mdFiles) {
    const filePath = join(sourceDir, filename);
    const raw = await readFile(filePath, "utf8");
    const { data, content } = matter(raw);
    const fileSlug = basename(filename, extname(filename));
    const slug =
      typeof data.slug === "string" && data.slug.trim() ? data.slug.trim() : fileSlug;
    const title =
      typeof data.title === "string" && data.title.trim() ? data.title.trim() : fileSlug;
    const excerpt = typeof data.excerpt === "string" ? data.excerpt : undefined;

    articles.push({ slug, title, excerpt, markdown: content });
  }

  articles.sort((a, b) => a.title.localeCompare(b.title, "en", { sensitivity: "base" }));

  await mkdir(outDir, { recursive: true });

  for (const article of articles) {
    const articleDir = join(outDir, article.slug);
    await mkdir(articleDir, { recursive: true });
    const html = renderArticlePage(article, options);
    await writeFile(join(articleDir, "index.html"), html, "utf8");
  }

  const indexHtml = renderIndexPage(articles, options);
  await writeFile(join(outDir, "index.html"), indexHtml, "utf8");
}

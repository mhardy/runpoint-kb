import { mkdtemp, rm, readFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { generateSupportPages } from "../src/index.js";

const root = await mkdtemp(join(tmpdir(), "runpoint-kb-"));
const sourceDir = join(root, "source");
const outDir = join(root, "out");

await mkdir(sourceDir);

await writeFile(
  join(sourceDir, "beta-feature.md"),
  `---
title: Beta Feature
excerpt: How to try the beta.
slug: beta
---
# Beta

Enable beta in settings.
`,
  "utf8",
);

await writeFile(
  join(sourceDir, "getting-started.md"),
  `---
title: Getting Started
---
# Welcome

Start here.
`,
  "utf8",
);

await generateSupportPages(sourceDir, outDir);

const indexHtml = await readFile(join(outDir, "index.html"), "utf8");
const articleHtml = await readFile(join(outDir, "getting-started", "index.html"), "utf8");
const slugHtml = await readFile(join(outDir, "beta", "index.html"), "utf8");

const checks = [
  indexHtml.includes('href="beta/">Beta Feature'),
  indexHtml.includes('href="getting-started/">Getting Started'),
  indexHtml.indexOf("Beta Feature") < indexHtml.indexOf("Getting Started"),
  articleHtml.includes("<h1>Getting Started</h1>"),
  articleHtml.includes("<h1>Welcome</h1>"),
  slugHtml.includes("<h1>Beta Feature</h1>"),
  slugHtml.includes('href="../">← All articles'),
];

await rm(root, { recursive: true, force: true });

if (checks.every(Boolean)) {
  console.log("All checks passed.");
} else {
  console.error("FAIL: one or more checks did not pass.", checks);
  process.exit(1);
}

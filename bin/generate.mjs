#!/usr/bin/env node

import { generateSupportPages } from "../src/index.js";

const [sourceDir, outDir] = process.argv.slice(2);

if (!sourceDir || !outDir) {
  console.error("Usage: generate-support-pages <sourceDir> <outDir>");
  process.exit(1);
}

try {
  await generateSupportPages(sourceDir, outDir);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

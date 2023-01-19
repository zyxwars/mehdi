import * as chokidar from "chokidar";
import * as path from "path";
import * as fs from "fs";
import {
  loadSnippets,
  compileTemplate,
  loadConfig,
  normalizeTemplateKey,
} from "./utils";


export function main() {
  const config = loadConfig();

  let snippets = loadSnippets(config.snippetDir);

  // Watch snippet changes
  chokidar.watch(config.snippetDir).on("change", (entryName) => {
    entryName = path.resolve(entryName);

    // Load snippet data to key
    snippets[entryName] = fs.readFileSync(entryName, "utf-8");

    console.log(
      `SNIPPET: Updated key ${normalizeTemplateKey(
        entryName,
        config.snippetDir
      )} (${entryName})`
    );
  });

  // Watch source files
  chokidar.watch(config.watchDir).on("change", (entryName) => {
    entryName = path.resolve(entryName);

    // Don't change files outside of watch dir and inside snippet and dist dirs if they collide
    if (
      entryName.includes(config.watchDir) &&
      (entryName.includes(config.snippetDir) ||
        entryName.includes(config.distDir))
    )
      return;

    compileTemplate(
      entryName,
      snippets,
      config.snippetDir,
      config.watchDir,
      config.distDir
    );
  });
}

if (require.main === module) {
  main();
}

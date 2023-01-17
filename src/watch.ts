import * as chokidar from "chokidar";
import * as fs from "fs";
import {
  normalizePath,
  keifyPath,
  loadSnippets,
  populateTemplate,
} from "./lib";

import config from "./config.json";

let snippets = loadSnippets(config.snippetDir);

// Watch snippet changes
chokidar.watch(config.snippetDir).on("change", (path) => {
  path = normalizePath(path);

  snippets[path] = fs.readFileSync(path, "utf-8");

  console.log(
    `SNIPPET: Updated key ${keifyPath(path, config.snippetDir)} (${path})`
  );
});

// Watch source files
chokidar.watch(config.watchDir).on("change", (path) => {
  path = normalizePath(path);

  // Don't change files outside of watch dir and inside snippet and dist dirs if they collide
  if (
    path.includes(config.watchDir) &&
    (path.includes(config.snippetDir) || path.includes(config.distDir))
  )
    return;

  populateTemplate(
    path,
    snippets,
    config.snippetDir,
    config.watchDir,
    config.distDir
  );
});

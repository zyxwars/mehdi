import * as fs from "fs";
import { loadSnippets, populateTemplate } from "./lib";

import config from "./config.json";

let snippets = loadSnippets(config.snippetDir);

const updateDir = (path: string) => {
  const dirents = fs.readdirSync(path, { withFileTypes: true });

  dirents.forEach((dirent) => {
    // Don't change files outside of watch dir and inside snippet and dist dirs if they collide
    if (
      path.includes(config.watchDir) &&
      (path.includes(config.snippetDir) || path.includes(config.distDir))
    )
      return;

    // Recurse directories
    if (dirent.isDirectory()) {
      updateDir(path + "/" + dirent.name);
      return;
    }

    populateTemplate(
      path + "/" + dirent.name,
      snippets,
      config.snippetDir,
      config.watchDir,
      config.distDir
    );
  });
};

updateDir(config.watchDir);

import * as fs from "fs";
import { loadConfig, loadSnippets, populateTemplate } from "./utils";

export function main() {
  const config = loadConfig();

  let snippets = loadSnippets(config.snippetDir);

  const updateDir = (entryName: string) => {
    const dirents = fs.readdirSync(entryName, { withFileTypes: true });

    dirents.forEach((dirent) => {
      // Don't change files outside of watch dir and inside snippet and dist dirs if they collide
      if (
        entryName.includes(config.watchDir) &&
        (entryName.includes(config.snippetDir) ||
          entryName.includes(config.distDir))
      )
        return;

      // Recurse directories
      if (dirent.isDirectory()) {
        updateDir(entryName + "/" + dirent.name);
        return;
      }

      populateTemplate(
        entryName + "/" + dirent.name,
        snippets,
        config.snippetDir,
        config.watchDir,
        config.distDir
      );
    });
  };

  updateDir(config.watchDir);

  console.log("TEMPLATE: All templates populated successfully");
}

if (require.main === module) {
  main();
}

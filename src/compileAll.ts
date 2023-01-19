import * as fs from "fs";
import * as path from "path";
import { loadConfig, loadSnippets, compileTemplate } from "./utils";

export function main() {
  const config = loadConfig();

  let snippets = loadSnippets(config.snippetDir);

  const updateDir = (dirPath: string) => {
    const dirents = fs.readdirSync(dirPath, { withFileTypes: true });

    dirents.forEach((dirent) => {
      // Don't change files outside of watch dir and inside snippet and dist dirs if they collide
      if (
        dirPath.includes(config.watchDir) &&
        (dirPath.includes(config.snippetDir) ||
          dirPath.includes(config.distDir))
      )
        return;

      // Recurse directories
      if (dirent.isDirectory()) {
        updateDir(path.resolve(dirPath, dirent.name));
        return;
      }

      compileTemplate(
        path.resolve(dirPath, dirent.name),
        snippets,
        config.snippetDir,
        config.watchDir,
        config.distDir
      );
    });
  };

  updateDir(config.watchDir);
}

if (require.main === module) {
  main();
}

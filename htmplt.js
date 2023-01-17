import chokidar from "chokidar";
import { ArgumentParser } from "argparse";
import fs from "fs";

const normalizePath = (path) => {
  // Add ./ to path starting like this src/snippets > ./src/snippets
  if (!(path.startsWith("./") || path.startsWith("/"))) path = "./" + path;

  // Set forward slashes
  return path.replace(/\\/g, "/");
};

const keifyPath = (path, rootDir) => {
  // ./src/test.html > test.html
  return path.replace(rootDir + "/", "");
};

const loadSnippets = (snippetDir) => {
  snippetDir = normalizePath(snippetDir);

  let parsedSnippets = {};

  const dirents = fs.readdirSync(snippetDir, { withFileTypes: true });

  dirents.forEach((dirent) => {
    const currentName = snippetDir + "/" + dirent.name;

    // Recurse directories
    if (dirent.isDirectory()) {
      parsedSnippets = {
        ...parsedSnippets,
        ...loadSnippets(currentName),
      };
      return;
    }
    const data = fs.readFileSync(currentName, "utf-8");
    // Load snippet
    parsedSnippets[currentName] = data;
  });

  return parsedSnippets;
};

const config = {
  watchDir: "./src",
  snippetDir: "./src/snippets",
  distDir: "./dist",
};

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

  console.log("WATCH: Replacing " + path);
  fs.readFile(path, "utf-8", (err, data) => {
    if (err) throw err;

    Object.entries(snippets).forEach((key, val) => {
      data = data.replace(`{{${key}}}`, val);
    });

    fs.writeFile(distDir + keifyPath(path, config.watchDir), data);
  });
});

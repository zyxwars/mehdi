import * as fs from "fs";

export const normalizePath = (path: string) => {
  // Add ./ to path starting like this src/snippets > ./src/snippets
  if (!(path.startsWith("./") || path.startsWith("/"))) path = "./" + path;

  // Set forward slashes
  return path.replace(/\\/g, "/");
};

export const keifyPath = (path: string, rootDir: string) => {
  // ./src/test.html > test.html
  return path.replace(rootDir + "/", "");
};

export const loadSnippets = (snippetDir: string): { [key: string]: string } => {
  snippetDir = normalizePath(snippetDir);

  let parsedSnippets: { [key: string]: string } = {};

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
    console.log("SNIPPET: Loaded " + currentName);
  });

  return parsedSnippets;
};

export const populateTemplate = (
  path: string,
  snippets: { [key: string]: string },
  snippetDir: string,
  watchDir: string,
  distDir: string
) => {
  fs.readFile(path, "utf-8", (err, data) => {
    if (err) throw err;

    Object.entries(snippets).forEach((entry) => {
      const key = `{{${keifyPath(entry[0], snippetDir)}}}`;
      const val = entry[1];

      data = data.replace(key, val);
    });

    fs.writeFileSync(distDir + "/" + keifyPath(path, watchDir), data);
    console.log(
      `WATCH: Saved ${keifyPath(path, watchDir)} as ${
        distDir + "/" + keifyPath(path, watchDir)
      }`
    );
  });
};

import * as fs from "fs";
import * as path from "path";

interface IConfig {
  watchDir: string;
  snippetDir: string;
  distDir: string;
  config: string;
}

/**
 * Load htmplt.json from cwd
 */
export const loadConfig = (): IConfig => {
  const defaults = {
    watchDir: "./src",
    snippetDir: "./src/snippets",
    distDir: "./dist",
    config: "default",
  };

  const configPath = path.resolve("./htmplt.json");

  if (!fs.existsSync(configPath)) {
    console.log("CONFIG: Loaded default config, looked for", configPath);

    return defaults;
  }

  const customConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));

  console.log("CONFIG: Loaded", configPath);
  return { ...defaults, ...customConfig };
};

/**
 * ./src/test.html > test.html
 */
export const keifyPath = (entryName: string, rootDir: string) => {
  return entryName.replace(rootDir + "/", "").replace("\\", "/");
};

export const loadSnippets = (snippetDir: string): { [key: string]: string } => {
  if (!fs.existsSync(snippetDir)) {
    console.log(
      `SNIPPET: No snippet directory found, looked for ${path.resolve(
        snippetDir
      )}`
    );
    process.exit();
  }

  snippetDir = path.normalize(snippetDir);

  let parsedSnippets: { [key: string]: string } = {};

  const dirents = fs.readdirSync(snippetDir, { withFileTypes: true });

  dirents.forEach((dirent) => {
    const entryName = snippetDir + "/" + dirent.name;

    // Recurse directories
    if (dirent.isDirectory()) {
      parsedSnippets = {
        ...parsedSnippets,
        ...loadSnippets(entryName),
      };
      return;
    }
    const data = fs.readFileSync(entryName, "utf-8");
    // Load snippet
    parsedSnippets[entryName] = data;
    console.log(
      "SNIPPET: Loaded",
      entryName,
      "use key",
      keifyPath(entryName, snippetDir)
    );
  });

  return parsedSnippets;
};

export const populateTemplate = (
  entryName: string,
  snippets: { [key: string]: string },
  snippetDir: string,
  watchDir: string,
  distDir: string
) => {
  fs.readFile(entryName, "utf-8", (err, data) => {
    if (err) throw err;

    Object.entries(snippets).forEach((snippet) => {
      const key = `{{${keifyPath(snippet[0], snippetDir)}}}`;
      const val = snippet[1];

      data = data.replace(key, val);
    });

    fs.mkdir(distDir, { recursive: true }, (err) => {
      if (err) throw err;
      console.log("test");
      console.log(keifyPath(entryName, watchDir));

      fs.writeFileSync(distDir + "/" + keifyPath(entryName, watchDir), data);
      console.log("tset1");

      console.log(
        `TEMPLATE: Saved ${keifyPath(entryName, watchDir)} as ${
          distDir + "/" + keifyPath(entryName, watchDir)
        }`
      );
    });
  });
};

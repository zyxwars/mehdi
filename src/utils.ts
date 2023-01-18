import * as fs from "fs";
import * as path from "path";

interface IConfig {
  watchDir: string;
  snippetDir: string;
  distDir: string;
}

/**
 * Load htmplt.json from cwd
 */

const resolveConfigPaths = (config: IConfig) => {
  Object.entries(config).forEach(
    (entry) => (config[entry[0]] = path.resolve(entry[1]))
  );
  return config;
};

export const loadConfig = (): IConfig => {
  let defaults = {
    watchDir: "./src",
    snippetDir: "./src/snippets",
    distDir: "./dist",
  };
  defaults = resolveConfigPaths(defaults);

  // Load custom config
  const configPath = path.resolve("./htmplt.json");
  if (!fs.existsSync(configPath)) {
    console.log("CONFIG: Loaded default config, looked for", configPath);

    return defaults;
  }
  let customConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  customConfig = resolveConfigPaths(customConfig);

  console.log("CONFIG: Loaded", configPath);
  return { ...defaults, ...customConfig };
};

/**
 * .../src/test.html > test.html
 */
export const keifyPath = (entryName: string, rootDir: string) => {
  return entryName.replace(rootDir + "/", "");
};

export const normalizeTemplateKey = (entryName: string, rootDir: string) => {
  return keifyPath(entryName, rootDir).replace("\\", "/");
};

export const loadSnippets = (
  snippetDir: string,
  configSnippetDir: string
): { [key: string]: string } => {
  if (!fs.existsSync(snippetDir)) {
    console.log(
      `SNIPPET: No snippet directory found, looked for ${snippetDir}`
    );
    process.exit();
  }

  let parsedSnippets: { [key: string]: string } = {};

  const dirents = fs.readdirSync(snippetDir, { withFileTypes: true });

  dirents.forEach((dirent) => {
    const entryName = path.resolve(snippetDir, dirent.name);

    // Recurse directories
    if (dirent.isDirectory()) {
      parsedSnippets = {
        ...parsedSnippets,
        ...loadSnippets(entryName, configSnippetDir),
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
      normalizeTemplateKey(entryName, configSnippetDir)
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
      const key = `{{${normalizeTemplateKey(snippet[0], snippetDir)}}}`;
      const val = snippet[1];

      data = data.replace(new RegExp(key, "g"), val);
    });

    fs.mkdir(distDir, { recursive: true }, (err) => {
      if (err) throw err;

      fs.writeFileSync(
        path.resolve(distDir, keifyPath(entryName, watchDir)),
        data
      );
      console.log(
        `TEMPLATE: Saved ${keifyPath(entryName, watchDir)} as ${path.resolve(
          distDir,
          keifyPath(entryName, watchDir)
        )}`
      );
    });
  });
};

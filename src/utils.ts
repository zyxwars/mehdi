import * as fs from "fs";
import * as path from "path";

interface IConfig {
  watchDir: string;
  snippetDir: string;
  distDir: string;
}

export const defaultConfig = {
  watchDir: "./src",
  snippetDir: "./src/snippets",
  distDir: "./dist",
};

/**
 * Load htmplt.json from cwd
 */
export const loadConfig = (): IConfig => {
  /**
   * Resolve full path and normalize it for each config element
   */
  const resolveConfigPaths = (config: IConfig) => {
    Object.entries(config).forEach(
      (entry) => (config[entry[0]] = path.resolve(entry[1]))
    );
    return config;
  };

  let defaults = defaultConfig;
  defaults = resolveConfigPaths(defaults);

  // Load custom config
  const configPath = path.resolve("./htmplt.config.json");

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
  return entryName.replace(rootDir, "").substring(1);
};

/**
 * ...\src\test\test.html > test/test.html
 */
export const normalizeTemplateKey = (entryName: string, rootDir: string) => {
  return keifyPath(entryName, rootDir).replace(/\\/g, "/");
};

export const loadSnippets = (
  snippetDir: string,
  originalSnippetDir: string = null
): { [key: string]: string } => {
  if (!fs.existsSync(snippetDir)) {
    console.log(
      `SNIPPET: No snippet directory found, looked for ${snippetDir}`
    );
    process.exit();
  }

  // Used when recursing
  if (!originalSnippetDir) originalSnippetDir = snippetDir;

  let parsedSnippets: { [key: string]: string } = {};

  // Find all snippets in snippetDir
  const dirents = fs.readdirSync(snippetDir, { withFileTypes: true });
  dirents.forEach((dirent) => {
    const entryName = path.resolve(snippetDir, dirent.name);

    // Recurse directories
    if (dirent.isDirectory()) {
      parsedSnippets = {
        ...parsedSnippets,
        ...loadSnippets(entryName, originalSnippetDir),
      };
      return;
    }
    // Load snippet
    const data = fs.readFileSync(entryName, "utf-8");
    parsedSnippets[entryName] = data;
    console.log(
      "SNIPPET: Loaded",
      entryName,
      "use key",
      normalizeTemplateKey(entryName, originalSnippetDir)
    );
  });

  return parsedSnippets;
};

export const compileTemplate = (
  entryName: string,
  snippets: { [key: string]: string },
  snippetDir: string,
  watchDir: string,
  distDir: string
) => {
  fs.readFile(entryName, "utf-8", (err, data) => {
    if (err) throw err;

    // Apply each snippet
    Object.entries(snippets).forEach((snippet) => {
      const key = `{{${normalizeTemplateKey(snippet[0], snippetDir)}}}`;
      const val = snippet[1];

      data = data.replace(new RegExp(key, "g"), val);
    });

    // Create dist dir if it doesn't exist
    fs.mkdirSync(distDir, { recursive: true });
    // Output compiled template
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
};

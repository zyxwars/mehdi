"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
exports.__esModule = true;
exports.compileTemplate = exports.loadSnippets = exports.normalizeTemplateKey = exports.keifyPath = exports.loadConfig = exports.defaultConfig = void 0;
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
exports.defaultConfig = {
    watchDir: "./src",
    snippetDir: "./src/snippets",
    distDir: "./dist"
};
/**
 * Load mehdi.json from cwd
 */
var loadConfig = function () {
    /**
     * Resolve full path and normalize it for each config element
     */
    var resolveConfigPaths = function (config) {
        Object.entries(config).forEach(function (entry) { return (config[entry[0]] = path.resolve(entry[1])); });
        return config;
    };
    var defaults = exports.defaultConfig;
    defaults = resolveConfigPaths(defaults);
    // Load custom config
    var configPath = path.resolve("./mehdi.config.json");
    if (!fs.existsSync(configPath)) {
        console.log("CONFIG: Loaded default config, looked for", configPath);
        return defaults;
    }
    var customConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    customConfig = resolveConfigPaths(customConfig);
    console.log("CONFIG: Loaded", configPath);
    return __assign(__assign({}, defaults), customConfig);
};
exports.loadConfig = loadConfig;
/**
 * .../src/test.html > test.html
 */
var keifyPath = function (entryName, rootDir) {
    return entryName.replace(rootDir, "").substring(1);
};
exports.keifyPath = keifyPath;
/**
 * ...\src\test\test.html > test/test.html
 */
var normalizeTemplateKey = function (entryName, rootDir) {
    return (0, exports.keifyPath)(entryName, rootDir).replace(/\\/g, "/");
};
exports.normalizeTemplateKey = normalizeTemplateKey;
var loadSnippets = function (snippetDir, originalSnippetDir) {
    if (originalSnippetDir === void 0) { originalSnippetDir = null; }
    if (!fs.existsSync(snippetDir)) {
        console.log("SNIPPET: No snippet directory found, looked for ".concat(snippetDir));
        process.exit();
    }
    // Used when recursing
    if (!originalSnippetDir)
        originalSnippetDir = snippetDir;
    var parsedSnippets = {};
    // Find all snippets in snippetDir
    var dirents = fs.readdirSync(snippetDir, { withFileTypes: true });
    dirents.forEach(function (dirent) {
        var entryName = path.resolve(snippetDir, dirent.name);
        // Recurse directories
        if (dirent.isDirectory()) {
            parsedSnippets = __assign(__assign({}, parsedSnippets), (0, exports.loadSnippets)(entryName, originalSnippetDir));
            return;
        }
        // Load snippet
        var data = fs.readFileSync(entryName, "utf-8");
        parsedSnippets[entryName] = data;
        console.log("SNIPPET: Loaded", entryName, "use key", (0, exports.normalizeTemplateKey)(entryName, originalSnippetDir));
    });
    return parsedSnippets;
};
exports.loadSnippets = loadSnippets;
var compileTemplate = function (entryName, snippets, snippetDir, watchDir, distDir) {
    fs.readFile(entryName, "utf-8", function (err, data) {
        if (err)
            throw err;
        // Apply each snippet
        Object.entries(snippets).forEach(function (snippet) {
            var key = "{{".concat((0, exports.normalizeTemplateKey)(snippet[0], snippetDir), "}}");
            var val = snippet[1];
            data = data.replace(new RegExp(key, "g"), val);
        });
        // Create dist dir if it doesn't exist
        fs.mkdirSync(distDir, { recursive: true });
        // Output compiled template
        fs.writeFileSync(path.resolve(distDir, (0, exports.keifyPath)(entryName, watchDir)), data);
        console.log("TEMPLATE: Saved ".concat((0, exports.keifyPath)(entryName, watchDir), " as ").concat(path.resolve(distDir, (0, exports.keifyPath)(entryName, watchDir))));
    });
};
exports.compileTemplate = compileTemplate;

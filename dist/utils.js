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
exports.populateTemplate = exports.loadSnippets = exports.keifyPath = exports.loadConfig = void 0;
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
/**
 * Load htmplt.json from cwd
 */
var loadConfig = function () {
    var defaults = {
        watchDir: "./src",
        snippetDir: "./src/snippets",
        distDir: "./dist",
        config: "default"
    };
    var configPath = path.resolve("./htmplt.json");
    if (!fs.existsSync(configPath)) {
        console.log("CONFIG: Loaded default config, looked for", configPath);
        return defaults;
    }
    var customConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    console.log("CONFIG: Loaded", configPath);
    return __assign(__assign({}, defaults), customConfig);
};
exports.loadConfig = loadConfig;
/**
 * ./src/test.html > test.html
 */
var keifyPath = function (entryName, rootDir) {
    return entryName.replace(rootDir + "/", "");
};
exports.keifyPath = keifyPath;
var loadSnippets = function (snippetDir) {
    if (!fs.existsSync(snippetDir)) {
        console.log("SNIPPET: No snippet directory found, looked for ".concat(path.resolve(snippetDir)));
        process.exit();
    }
    snippetDir = path.normalize(snippetDir);
    var parsedSnippets = {};
    var dirents = fs.readdirSync(snippetDir, { withFileTypes: true });
    dirents.forEach(function (dirent) {
        var entryName = snippetDir + "/" + dirent.name;
        // Recurse directories
        if (dirent.isDirectory()) {
            parsedSnippets = __assign(__assign({}, parsedSnippets), (0, exports.loadSnippets)(entryName));
            return;
        }
        var data = fs.readFileSync(entryName, "utf-8");
        // Load snippet
        parsedSnippets[entryName] = data;
        console.log("SNIPPET: Loaded", entryName, "use key", (0, exports.keifyPath)(entryName, snippetDir));
    });
    return parsedSnippets;
};
exports.loadSnippets = loadSnippets;
var populateTemplate = function (entryName, snippets, snippetDir, watchDir, distDir) {
    fs.readFile(entryName, "utf-8", function (err, data) {
        if (err)
            throw err;
        Object.entries(snippets).forEach(function (snippet) {
            var key = "{{".concat((0, exports.keifyPath)(snippet[0], snippetDir), "}}");
            var val = snippet[1];
            data = data.replace(key, val);
        });
        fs.mkdir(distDir, { recursive: true }, function (err) {
            if (err)
                throw err;
            fs.writeFileSync(distDir + "/" + (0, exports.keifyPath)(entryName, watchDir), data);
        });
        console.log("TEMPLATE: Saved ".concat((0, exports.keifyPath)(entryName, watchDir), " as ").concat(distDir + "/" + (0, exports.keifyPath)(entryName, watchDir)));
    });
};
exports.populateTemplate = populateTemplate;

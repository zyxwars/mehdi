"use strict";
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
exports.main = void 0;
var chokidar = __importStar(require("chokidar"));
var path = __importStar(require("path"));
var fs = __importStar(require("fs"));
var utils_1 = require("./utils");
function main() {
    var config = (0, utils_1.loadConfig)();
    var snippets = (0, utils_1.loadSnippets)(config.snippetDir);
    // Watch snippet changes
    chokidar.watch(config.snippetDir).on("change", function (entryName) {
        entryName = path.normalize(entryName);
        snippets[entryName] = fs.readFileSync(entryName, "utf-8");
        console.log("SNIPPET: Updated key ".concat((0, utils_1.keifyPath)(entryName, config.snippetDir), " (").concat(entryName, ")"));
    });
    // Watch source files
    chokidar.watch(config.watchDir).on("change", function (entryName) {
        entryName = path.normalize(entryName);
        // Don't change files outside of watch dir and inside snippet and dist dirs if they collide
        if (entryName.includes(config.watchDir) &&
            (entryName.includes(config.snippetDir) ||
                entryName.includes(config.distDir)))
            return;
        (0, utils_1.populateTemplate)(entryName, snippets, config.snippetDir, config.watchDir, config.distDir);
    });
}
exports.main = main;
if (require.main === module) {
    main();
}

#!/usr/bin/env node
"use strict";
exports.__esModule = true;
var compileAll_1 = require("./compileAll");
var watch_1 = require("./watch");
if (process.argv[2] === "watch")
    (0, watch_1.main)();
else if (!process.argv[2])
    (0, compileAll_1.main)();
else {
    console.log("Invalid args, only valid options are: [watch]");
}

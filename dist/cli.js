#!/usr/bin/env node
"use strict";
exports.__esModule = true;
var populate_1 = require("./populate");
var populate_2 = require("./populate");
if (process.argv[2] === "watch")
    (0, populate_2.main)();
else if (!process.argv[2])
    (0, populate_1.main)();
else {
    console.log("Invalid args, only valid options are: [watch]");
}

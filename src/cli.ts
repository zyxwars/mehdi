#!/usr/bin/env node
import { main as compileAll } from "./compileAll";
import { main as watch } from "./watch";

if (process.argv[2] === "watch") watch();
else if (!process.argv[2]) compileAll();
else {
  console.log("Invalid args, only valid options are: [watch]");
}
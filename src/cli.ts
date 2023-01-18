#!/usr/bin/env node
import { main as populate } from "./populate";
import { main as watch } from "./populate";

if (process.argv[2] === "watch") watch();
else if (!process.argv[2]) populate();
else {
  console.log("Invalid args, only valid options are: [watch]");
}

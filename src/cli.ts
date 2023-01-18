#!/usr/bin/env node
import { main as once } from "./once";
import { main as watch } from "./watch";

if (process.argv[2] === "watch") watch();
else if (!process.argv[2]) once();
else {
  console.log("Invalid args, only valid options are: [watch]");
}

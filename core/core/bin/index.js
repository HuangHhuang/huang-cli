#!/usr/bin/env node

import importLocal from "import-local";
import npmlog from "npmlog";
import { fileURLToPath } from "url";
import lib from "../lib/index.js";

// 检查版本号
const __filename = fileURLToPath(import.meta.url);
if (importLocal(__filename)) {
  npmlog.info("cli", "using local cli");
} else {
  lib(process.argv.slice(2));
}

const fs = require("node:fs");
const Module = require("node:module");
const path = require("node:path");

const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function resolveFilename(request, parent, isMain, options) {
  if (request === "server-only") {
    return path.join(__dirname, "server-only-test-stub.cjs");
  }

  return originalResolveFilename.call(this, request, parent, isMain, options);
};

require("ts-node").register({
  transpileOnly: true,
  compilerOptions: {
    module: "commonjs",
    moduleResolution: "node",
  },
});
require("tsconfig-paths/register");

function collectTests(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const tests = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      tests.push(...collectTests(absolutePath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".test.ts")) {
      tests.push(absolutePath);
    }
  }

  return tests;
}

for (const testFile of collectTests(path.join(process.cwd(), "src"))) {
  require(testFile);
}

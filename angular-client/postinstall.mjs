// Patches @mastra/schema-compat to replace the Node.js 'module' built-in import
// with a browser-compatible stub. This is required because Angular's esbuild-based
// build fails when it encounters `import { createRequire } from 'module'` for
// browser targets.
//
// This patch does NOT affect runtime behaviour: the createRequire path in
// schema-compat is wrapped in try/catch and only used as a CJS fallback for zod
// loading. In an ESM browser context it is never reached.

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const targetFile = resolve(
  __dirname,
  'node_modules/@mastra/schema-compat/dist/chunk-OA5IWMRF.js'
);

let content;
try {
  content = readFileSync(targetFile, 'utf8');
} catch {
  // Package not installed yet or path changed in a newer version — skip patch.
  process.exit(0);
}

const from = "import { createRequire } from 'module';";
const to   = "// [browser-patch] stubbed Node 'module' built-in\nconst createRequire = () => () => { throw new Error('require() is not available in the browser'); };";

if (content.includes(from)) {
  writeFileSync(targetFile, content.replace(from, to), 'utf8');
  console.log('[postinstall] Patched @mastra/schema-compat for browser compatibility.');
} else if (content.includes('[browser-patch]')) {
  console.log('[postinstall] @mastra/schema-compat already patched.');
} else {
  console.warn('[postinstall] Could not find expected import in @mastra/schema-compat — patch skipped.');
}

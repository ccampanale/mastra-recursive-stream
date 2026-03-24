// Browser polyfill for Node.js's 'module' built-in.
// @mastra/schema-compat uses createRequire for CJS interop; in a browser ESM
// context this code path is never reached, so a no-op stub is sufficient.
export function createRequire(_filename: string) {
  return (_id: string): never => {
    throw new Error(`require('${_id}') is not available in the browser`);
  };
}

# Angular Client — Mastra Client Tools Bug Reproduction

Minimal Angular application that reproduces [mastra-ai/mastra#14364](https://github.com/mastra-ai/mastra/issues/14364):

> **Error processing recursive stream response: MastraClientError: HTTP error! status: 400**

## What this demo does

1. Sends a user message to the `demo-agent` Mastra agent using `@mastra/client-js`.
2. Passes a client-side `getUserInfo` tool via `clientTools`.
3. The agent calls `getUserInfo` — the first stream completes successfully (HTTP 200).
4. The client SDK automatically opens a **second stream** with the tool result.
5. That second stream fails with **HTTP 400** (the bug).

## Setting up

### 1. Start the Mastra backend

From the **repo root**:

```bash
npm install
npm run dev
```

The Mastra dev server starts at `http://localhost:4111`. CORS headers are added via middleware so the Angular app can call it directly.

### 2. Install dependencies and start the Angular app

```bash
cd angular-client
npm install        # also runs postinstall.mjs which patches @mastra/schema-compat
npm start          # ng serve → http://localhost:4200
```

> **Note on the `postinstall.mjs` patch**: `@mastra/schema-compat` (a transitive
> dependency of `@mastra/client-js`) imports `createRequire` from Node's built-in
> `module` package. Angular's esbuild-based browser build cannot resolve Node
> built-ins, so `postinstall.mjs` replaces that import with a browser-compatible
> stub. The code path it guards is never reached in the browser (it's a CJS
> fallback wrapped in try/catch), so runtime behaviour is unchanged.

## Reproducing the bug

1. Open `http://localhost:4200` in Chrome.
2. The default message is "Tell me about user 42". Click **Send**.
3. Open the browser DevTools **Network** tab.
4. You should see:
   - A first `POST /api/agents/demo-agent/stream` → `200 OK`
   - A second `POST /api/agents/demo-agent/stream` → `400 Bad Request`
5. The error message will appear in the UI:
   ```
   Error processing recursive stream response: MastraClientError: HTTP error! status: 400
   ```

## Project structure

```
angular-client/
├── postinstall.mjs            ← patches @mastra/schema-compat after npm install
├── src/
│   ├── module-polyfill.ts     ← TypeScript stub for Node's 'module' built-in
│   └── app/
│       ├── app.ts             ← component with MastraClient + createTool usage
│       ├── app.html           ← minimal UI
│       └── app.css            ← basic styles
└── tsconfig.app.json          ← paths: module → src/module-polyfill.ts
```


## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

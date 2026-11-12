# Fluent accordion initialization reproduction

A standalone reproduction using `@fluentui/web-components` 3.2.1 and plain HTML/JavaScript.

## Run

Use Node 22.22.3 or newer in the Node 22 series, or Node 24.15 or newer in the Node 24 series.

```sh
npm install
npm run dev
```

Open <http://127.0.0.1:4310> in Chromium and click **Section**.

**Expected:** The section expands even though its body contains an unregistered
`<demo-content>` element.

**Possible failure:** Item discovery remains pending and the heading does not expand.

**Important limitation:** The normal page may initialize successfully and expand as expected.
This issue depends on the idle deadlines supplied by the browser. While callbacks have
positive time remaining, the helper keeps waiting. A callback with no remaining time
lets initialization complete despite the unregistered element.

The status distinguishes pending discovery from completed initialization. A brief pending
status during startup is normal and does not prove the bug. A working accordion means
the blocking condition was not sustained on that run. Reloading may change the result,
but does not guarantee a failure. Use the diagnostic test below for a repeatable case.

`demo-content` is deliberately just an unregistered HTML element containing text. It
needs no implementation. Such elements also occur as framework component hosts that
are not registered through `customElements.define()`.

## Project layout

```text
index.html
src/
  main.js
  style.css
tests/
  reproduction.spec.js
vite.config.js
playwright.config.js
package.json
package-lock.json
```

`index.html` contains the reproduction markup. `src/main.js` registers Fluent and
reports initialization status; `src/style.css` contains the page styling.
Use `npm run build` to create `dist/` and `npm run preview` to serve that build.

## Cause

The accordion's `setItems()` calls `waitForConnectedDescendants()`, which searches
all descendants with `:not(:defined)`. The nested `demo-content` element always matches.
The helper retries while idle callbacks report positive `timeRemaining()`, so item
listeners may never be attached. A callback reporting no remaining time lets it
escape, which makes the browser symptom timing dependent.

The demo requests animation frames to encourage short idle periods; this does not
guarantee the scheduling condition needed to reproduce the failure. It uses
native browser idle callbacks without replacing them.

## Repeatable diagnostic test

```sh
npx playwright install chromium
npm test
```

The test alone supplies idle callbacks with positive time remaining. It confirms
that the heading is unresponsive, then removes only the unregistered host while
preserving its text. Discovery completes and the heading works. The test passes
when this bug is reproduced; it is a diagnostic, not an assertion of correct behavior.

## Suggested upstream investigation

Accordion item discovery uses direct children. Consider limiting its readiness
check to those direct children, so arbitrary elements inside an item's heading or
body cannot block initialization.

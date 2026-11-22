# Repository Guidelines

## Project Structure & Module Organization

ShopLedger is a Node.js/Express point-of-sale, inventory, Khata ledger, and GST invoicing app. `server.js` configures Express and mounts the API. `routes/` contains endpoint handlers; `lib/` contains pricing, tax, coupon, inventory, order, ledger, storage, date, invoice, and reporting logic. `config.js` holds shop and application settings. `public/` contains the browser UI, JavaScript, and CSS. `data/db.json` is the JSON-backed store. `docs/architecture.svg` diagrams the main modules and order flow. There is currently no test directory.

## Build, Test, and Development Commands

- `npm start` runs `node server.js`; open `http://localhost:3000` by default. Set `PORT` to override the port.
- `npm test` currently exits with “Error: no test specified”; it does not run a test suite.
- No build, lint, or formatting scripts are configured. Do not describe a command as a successful test until a real test suite is added.

## Coding Style & Naming Conventions

Match the existing CommonJS JavaScript style: two-space indentation, `var`, semicolons, single-quoted strings, and `module.exports`/`exports` modules. Use lower camel case for functions and variables, and descriptive lower-case filenames such as `gst-reconciliation` only where the existing route path requires it. Keep HTTP handling in `routes/` and reusable business rules in `lib/`. Avoid introducing dependencies or formatting tools without a project need.

## Testing Guidelines

There is no test framework or coverage requirement in the repository. For behavior changes, add focused tests when establishing a test setup, especially for pricing, GST slabs, coupon limits, inventory boundaries, Khata balance changes, and invoice reconciliation. Until then, clearly report that automated tests are unavailable; do not treat `npm test` as verification.

## Commit & Pull Request Guidelines

Recent commits use short, descriptive, lower-case summaries (for example, `customer khata credit ledger and order cancellation`). Follow that style. A pull request should explain the user-visible change, note affected routes or data behavior, list verification performed, and include screenshots for UI changes. Call out any change to the JSON data shape or billing calculations.

## Security & Data Handling

Keep credentials and deployment-specific settings out of source control; `config.js` currently contains an admin key. Treat `data/db.json` as potentially sensitive customer and sales data. Do not commit real customer data, secrets, or generated local changes.

# Build Instructions

## Prerequisites

- Node.js 26 or later and npm 11 or later.
- Native build tooling compatible with `better-sqlite3` when installing on a new machine.
- Write access to the application data directory, which defaults to `data/` in the workspace or is selected through `LUNCH_DATA_DIR`.

## Steps

1. Install dependencies. Use a workspace-local cache when the global npm cache is unavailable:

```bash
npm install --cache .npm-cache --no-audit --no-fund
```

2. Build the server and coordinator web interface:

```bash
npm run build
```

3. Start the local API and Vite interface in separate terminals:

```bash
npm run server
npm run dev -- --host 127.0.0.1
```

4. Open `http://127.0.0.1:5173/`.

## Expected Result

The build writes the browser bundle to `dist/` and compiled server output to `dist-server/`. The API listens on port 3001 and the interface on port 5173. The SQLite file is created as `lunch-ledger.sqlite` in the selected application-data directory.

## Troubleshooting

- If npm reports a global-cache permission error, rerun installation with `--cache .npm-cache`.
- If `better-sqlite3` does not load, verify that the active Node.js version matches the installed native package build, then reinstall dependencies.
- If the interface cannot reach `/api`, confirm that `npm run server` is running on port 3001.
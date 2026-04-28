# Stardew Valley UI

React + TypeScript + Vite project with Bun as the default package manager and runtime.

## Local development

Install dependencies:

```bash
bun install
```

Start the dev server:

```bash
bun run dev
```

Build for production:

```bash
bun run build
```

Run lint and tests:

```bash
bun run lint
bun run test:run
```

## GitHub Pages deployment

The project is configured for automatic deployment to GitHub Pages through GitHub Actions.

- Push to the `main` branch to trigger a deployment.
- The workflow installs dependencies with `bun install --frozen-lockfile`.
- The build uses `bun run build`.
- Vite `base` is configured for the `stardewUi` repository.
- `scripts/prepare-github-pages.mjs` generates `404.html` and `.nojekyll` in `dist` for SPA routing.

## GitHub repository settings

In the GitHub repository settings, make sure Pages is configured to:

- Source: `GitHub Actions`

Once that is enabled, each successful run of `.github/workflows/deploy-pages.yml` will publish the latest `dist` output.

# Changesets

Every PR that changes a published package (`@gntik-ai/*` under `packages/`) adds a changeset:

```sh
pnpm changeset          # pick packages, bump type, write a one-line summary
```

On merge to `main`, the Release workflow opens a "Version packages" PR (bumps versions and
writes CHANGELOG.md). Merging that PR publishes the new versions to GitHub Packages.

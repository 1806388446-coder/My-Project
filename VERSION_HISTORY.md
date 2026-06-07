# Version History

This file is the project's required iteration log. Every optimization, bug fix, or new feature must update this file before the work is committed and pushed.

## Current Version

- Version: `v0.2.2`
- Date: 2026-06-07
- Status: Deployment-output workflow release
- GitHub: `origin/main`

## Required Release Workflow

For every future project iteration:

1. Check the current Git status and avoid mixing unrelated local changes.
2. Make the requested feature, optimization, or fix.
3. Update this file with the new version number and a short change summary.
4. Run the project verification commands:

```bash
npm test
node --check app.js
node --check frontend-modules/music-player.js
node --check frontend-modules/ui-feedback.js
node --check cloud-api.js
node --check index.mjs
```

5. Commit the relevant files only.
6. Create the next version tag.
7. Push `main` and the new tag to GitHub.
8. In the final response, output the cloud deployment upload list for this release.

## Versions

### `v0.2.2` - 2026-06-07

Purpose: require every future development completion message to include the cloud deployment upload list.

Changes:

- Updated `AGENTS.md` to require a `Cloud Deployment Files` section in final responses.
- Clarified that future releases must state whether frontend OSS files, backend FC files, configuration, or database changes need cloud updates.
- Updated this version history workflow so deployment upload guidance is part of every iteration.

Verification:

- `npm test`
- `node --check app.js`
- `node --check frontend-modules/music-player.js`
- `node --check frontend-modules/ui-feedback.js`
- `node --check cloud-api.js`
- `node --check index.mjs`

### `v0.2.1` - 2026-06-07

Purpose: establish the permanent version-iteration process for future development windows.

Changes:

- Added this required version history document.
- Added `AGENTS.md` so future models know the project rules before making changes.
- Defined the default release workflow: update version notes, verify, commit, tag, and push to GitHub.

Verification:

- `npm test`
- `node --check app.js`
- `node --check frontend-modules/music-player.js`
- `node --check frontend-modules/ui-feedback.js`
- `node --check cloud-api.js`
- `node --check index.mjs`

### `v0.2.0` - 2026-06-07

Purpose: first stable GitHub-published iteration after organizing the frontend and photo wall work.

Changes:

- Organized music-player and UI-feedback logic into frontend modules.
- Added architecture coverage for the frontend module boundary.
- Updated photo wall and music player tests.
- Merged the iteration into `main` and pushed it to GitHub.

Verification:

- `npm test` passed with 8 test files and 36 tests.
- JavaScript syntax checks passed for the main app and frontend modules.

### `v0.1.0` - 2026-06-07

Purpose: initial Git baseline.

Changes:

- Created the first repository commit.
- Captured the existing static memory-site project state.
- Included the mobile Junimo adjustment and new slogan work present in the initial commit.

Verification:

- Not separately recorded before the version-history process was introduced.

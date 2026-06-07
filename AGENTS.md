# Project Rules for Coding Agents

This project is managed as an iterative GitHub-published site. Before changing code or documentation, read this file and follow it unless the user explicitly says otherwise.

## Repository

- Local path: `/Users/dengzijie/Documents/MyProject`
- GitHub remote: `git@github.com-my-project:1806388446-coder/My-Project.git`
- Primary branch: `main`
- Version log: `VERSION_HISTORY.md`

## Default Behavior

When the user asks for any optimization, bug fix, feature, UI change, deployment change, or project-documentation change:

1. Inspect `git status --short --branch` first.
2. Keep unrelated local changes out of the commit.
3. Make the requested change.
4. Update `VERSION_HISTORY.md` with the new version number, date, change summary, and verification commands.
5. Run verification before claiming the work is complete.
6. Commit only the relevant files.
7. Tag the release with the new version number.
8. Push `main` and the new tag to GitHub.
9. In the final response, include a cloud deployment upload list that tells the user exactly which files or folders must be uploaded for this release.

## Version Numbering

Use semantic-style local versions:

- Patch release, for docs, small fixes, and minor UI refinements: `v0.2.1`, `v0.2.2`, etc.
- Minor release, for meaningful new features or larger behavior changes: `v0.3.0`, `v0.4.0`, etc.
- Do not reuse an existing tag.

If unsure, use the next patch version and explain why.

## Verification Commands

Run these commands for ordinary frontend/API iterations:

```bash
npm test
node --check app.js
node --check frontend-modules/music-player.js
node --check frontend-modules/ui-feedback.js
node --check cloud-api.js
node --check index.mjs
```

If a file listed above does not exist in a future version, explain the changed verification command in `VERSION_HISTORY.md`.

## Git Rules

- Do not run destructive commands such as `git reset --hard` or `git checkout --` unless the user explicitly asks.
- Do not commit unrelated dirty files.
- Prefer focused commits with clear messages.
- After a successful release commit, push:

```bash
git push origin main
git push origin <version-tag>
```

## Cloud Deployment Output

After every completed development iteration, the final response must include a section named `Cloud Deployment Files`.

In that section, list the files and folders that need to be uploaded or updated in the cloud for the current release:

- Frontend OSS files, when the visible site changed.
- Backend FC package files, when API/server behavior changed.
- Configuration or database changes, when environment variables, TableStore tables, OSS buckets, or deployment settings changed.
- `No cloud runtime upload needed` when the release only changes local docs, tests, or agent workflow files.

Keep this list specific to the current release. Do not include unrelated dirty local files or files that were not part of the release commit.

## Current User Preference

The user wants future development windows to automatically preserve version history. Every new optimization or feature should update `VERSION_HISTORY.md`, create a new Git version, upload the version to GitHub by default, and clearly state which files must be uploaded to the cloud deployment.

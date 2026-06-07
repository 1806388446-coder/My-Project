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

## Current User Preference

The user wants future development windows to automatically preserve version history. Every new optimization or feature should update `VERSION_HISTORY.md`, create a new Git version, and upload the version to GitHub by default.

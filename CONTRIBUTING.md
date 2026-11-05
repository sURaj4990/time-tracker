# Contributing to Time Tracker

Thanks for helping improve Time Tracker. This guide explains how changes get from your machine into `main`.

## The short version

1. Fork or branch from `main`.
2. Make your change on a branch with a clear name.
3. Run the checks locally.
4. Open a pull request.
5. Wait for CI to pass and for a maintainer to approve.
6. The maintainer merges it.

Nobody can push directly to `main`, including maintainers. This keeps `main` working at all times.

## Setting up

Follow the steps in the README. Then confirm your setup works:

```bash
npm test
npm run typecheck
```

## Branches

Create a branch for each change. Use a short prefix that describes the type of work, followed by a few words in lowercase with hyphens:

- `feature/pomodoro-notes`
- `fix/week-chart-dark-mode`
- `docs/troubleshooting-eas`
- `test/streak-edge-cases`

```bash
git checkout main
git pull
git checkout -b feature/your-change
```

Keep each branch focused on one change. Small pull requests are reviewed faster and merge with fewer conflicts.

## Commit messages

Write the subject line in the imperative mood and keep it under 72 characters. A prefix is optional but helpful:

```
feat: add daily goal progress to the Track page
fix: keep Week chart labels readable in dark mode
test: cover streak reset after a missed day
docs: add APK sharing steps to the README
```

## Code guidelines

- Use TypeScript. Avoid `any` unless there's a clear reason, and leave a short comment explaining it.
- Read colours from the theme (`useTheme()`), not hard-coded values. Hard-coded colours break dark mode.
- Put pure logic (date maths, formatting, rules) in `src/lib/` and write tests for it.
- Keep database access in `src/db/`. Screens should call helpers there, not write SQL directly.
- Don't commit secrets, keystores, or signing files. The `.gitignore` covers the common cases; check `git status` before committing.

## Tests

Add or update tests for any change to logic in `src/lib/` or `src/db/`. Run them before you push:

```bash
npm test
```

CI runs the same tests and the type check on every pull request.

## Opening a pull request

1. Push your branch:

   ```bash
   git push -u origin feature/your-change
   ```

2. On GitHub, open a pull request into `main`.
3. Fill in the pull request template. Describe what changed and why, how you tested it, and include screenshots for anything visual, in both light and dark mode.
4. Make sure the CI check passes. A failing check blocks the merge.
5. Request a review. Address feedback by pushing new commits to the same branch.
6. Once approved and green, the maintainer merges it.

Pull requests are normally merged with a squash, so the history on `main` stays one commit per change. Delete your branch after it merges.

## Reviews

Reviews check correctness, readability, and whether the change fits the app's design. Reviewers may ask for changes, and that's normal. Please keep discussion respectful and specific.

## Reporting bugs

Open an issue with the steps to reproduce, what you expected, what happened, your phone model and Android version, and the app version from Settings. Screenshots help a lot.

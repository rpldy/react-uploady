# Architecture

## Release process

All packages are released together with the same version (lerna fixed mode, `--force-publish=*`).
Releases run in two GitHub workflows, with a manual review in between:

1. **Uploady Prepare Release** (`.github/workflows/release-prepare.yml`, run on `master`)
   - `scripts/release/prepareRelease.mjs` collects the commits on master's first-parent line since the last stable
     release commit (`chore: release vX.Y.Z`), calculates the next version and adds a suggested entry at the top of `CHANGELOG.md`.
   - `version: auto` picks the bump from conventional commits: breaking (`!` / `BREAKING CHANGE`) → major, `feat` → minor, otherwise patch.
     Pre-releases (`prepatch`/`preminor`/`premajor`/`prerelease` + `rc`/`alpha`) are always chosen explicitly.
   - Pushes a `release-<version>` branch and opens the `chore: release v<version>` PR.
2. **Manual review**: edit the entry in `CHANGELOG.md` on the release branch (reword, trim, credit contributors).
3. **Uploady Release** (`.github/workflows/release.yml`, run on the release branch)
   - Reads the version from the latest `## x.y.z` heading in `CHANGELOG.md`, so the reviewed entry is the one released.
     `rc` versions publish with the `next` dist-tag and `alpha` versions with `alpha`.
   - Versions all packages, builds, publishes to npm, tags and creates the GitHub release from the changelog entry.
4. Squash-merge the release PR keeping its title. That commit marks the start of the next release's range.

Changelog entry generation (`scripts/release/changelogEntry.mjs`):

- Sections: Features (`feat`, `perf`), Bug fixes (`fix`), Docs (`docs`), Internal (everything else).
- Each line is labeled with the affected packages: the commit scope if it's a package name, otherwise the packages
  whose files the commit changed (`all` above 3 packages or when no package changed, `ci` for `.github/`-only changes).
- Dependabot commits (`deps`/`deps-dev` scopes) collapse into a single "upgrade dev deps" line; release and bundle-size report commits are skipped.

**Why this design**: the existing lerna flow already handled versioning and publishing well, and off-the-shelf tools
(release-please, changesets, lerna's conventional-commits mode) can't produce the existing changelog format.
Commit messages alone aren't enough for good release notes, so the generated entry is a suggestion reviewed in the release PR.
PR titles are linted (`pr-title.yml`) since squash-merged PR titles are the commits the entry is generated from.

# Releasing a new version

All `@rpldy/*` packages are released together with the same version.
A release takes two workflow runs with a review of the changelog in between.
For the design behind it, see [architecture.md](./architecture.md#release-process).

## 1. Prepare the release

Run the **Uploady Prepare Release** workflow on `master`:

```bash
gh workflow run release-prepare.yml --ref master -f version=auto
```

| `version` | `preid` | Result (from 1.13.0) |
|---|---|---|
| `auto` | - | picked from the commits: breaking change → major, `feat` → minor, otherwise patch |
| `patch` / `minor` / `major` | - | 1.13.1 / 1.14.0 / 2.0.0 |
| `prepatch` / `preminor` / `premajor` | `rc` or `alpha` | e.g. 1.14.0-rc.0 |
| `prerelease` | `rc` or `alpha` | next pre-release number, e.g. 1.14.0-rc.0 → 1.14.0-rc.1 |

The workflow creates a `release-<version>` branch with a suggested entry at the top of `CHANGELOG.md`
and opens a `chore: release v<version>` PR (the link is in the run's summary).

## 2. Review the changelog entry

Edit `CHANGELOG.md` on the release branch: reword lines, merge or drop noise, credit contributors.

- Keep the `## <version> (<date>)` heading. The release reads the version from it, so changing the version here changes what gets published.
- The date doesn't matter, it's set to the publish date during the release.

## 3. Publish

Run the **Uploady Release** workflow on the release branch:

```bash
gh workflow run release.yml --ref release-1.14.0
```

It versions all packages, builds, publishes to npm, pushes the version commit and `v<version>` tag,
and creates the GitHub release with the changelog entry as its notes.
`rc` versions are published with the `next` npm dist-tag and `alpha` versions with `alpha`.

Use `-f dry=true` to stop after the version step without publishing.

## 4. Merge the release PR

Squash-merge the release PR **keeping its title** (`chore: release v<version>`), so the next changelog leaves it out.
This also brings the version bump in `lerna.json` and the changelog entry to `master`.

Do this right after publishing, including for pre-releases: the next prepare run fails while a release PR is still open.

## Troubleshooting

| Prepare fails with | Do this |
|---|---|
| A previous release PR is still open | Merge it (if it was published) or close it (if it wasn't) |
| `lerna.json version (…) doesn't match the latest release tag` | A published release wasn't merged back. Merge its release PR |
| `no changes found since last stable release` | There's nothing to release |
| `'preid' must be selected for pre-release versions` | Pick `rc`/`alpha` for `pre*` versions only |

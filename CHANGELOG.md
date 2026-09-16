# Changelog

Notable changes to the guide. Each page also shows its own last-modified
date, taken from git history.

Entries are grouped by what changed for a reader: **Added** for new pages,
**Changed** for revised guidance, **Verified** when a page's samples were
run against a real org, **Fixed** for corrections.

## Unreleased

### Added
- **Actions Backed by Apex** — invocable methods, input/output name binding,
  writing descriptions the agent reasons over, `filter_from_agent` and
  `is_displayable`, supported types, security and governor limits, common
  failure modes.
- **Apex Actions with Custom Lightning Types** — the CLT wiring chain, Apex
  class requirements, schema projection, Lightning Type Bundles and channels,
  editor/renderer LWC targets, the `action's user_input tool` instruction
  phrasing, the Draft-mode preview bug, and Apex class modification rules.
- SFDX example project under `examples/`. Every code sample in the guide is
  imported from it at build time, so published samples are the files that
  were actually deployed.
- Docusaurus site with GitHub Pages deployment, git-derived last-modified
  dates, and per-page verification banners.

### Changed
- Documented the conflict between the `CustomLightningTypes` recipe (`public`
  inner classes, `$` reference syntax) and the Lightning Types platform docs
  (top-level `global` classes, `@AuraEnabled`, `@JsonAccess`). The guide
  teaches the strict form as the default and flags the recipe's form as a
  local-org convenience.

### Not yet verified
- No page has been run against an org yet. Both action pages carry an
  unverified banner until they have.

### Added (machine-readable output)
- `/llms.txt`, `/llms-full.txt` and per-page `.md` routes, generated after the
  Docusaurus build so `file=` code imports are already resolved. Serving the
  repo's raw Markdown instead would hand readers empty code blocks.

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

### Changed (verification)
- Verification status moved out of per-page Markdown into a central
  `verification.json`, rendered by a theme wrapper on every doc. A page not
  listed there renders as unverified, so a new page can never silently look
  tested.
- The same registry feeds `llms.txt` and the per-page Markdown, so machine
  readers get the tested/untested signal too.

### Added
- `CONTRIBUTING.md` — the loop for testing samples in an org and recording
  the result.

### Added
- **Demo Order with a Custom Lightning Type** recipe — the output-only half of
  CLTs: a `complex_data_type_name` output reaching its renderer, with no input
  form. Marked unverified until the Apex, Lightning Type Bundle and renderer
  LWC land alongside the AgentScript.

### Fixed
- Demo order metadata: corrected a doubled `lightningTypes/lightningTypes/`
  path, replaced a `schema.json` copied from an unrelated time-slot feature,
  converted an `editor.json` to `renderer.json` (the type is an output), added
  the missing `.cls-meta.xml` files, and aligned the join key to
  `c__DemoOrderResultV2` across the AgentScript, bundle folder and LWC.
- Added the `orderDetailsRenderer` LWC.
- Flagged on the Custom Lightning Types page that `renderer.json` has two
  forms in the wild. The wrapped form is org-confirmed; the unwrapped form in
  the platform docs is not yet tested.
- Channels table on the Custom Lightning Types page replaced with the full
  support matrix: `experienceBuilder` has no renderer support, and
  property-level overrides exist only there. Also flags that this sits awkwardly
  with the platform docs' claim that Apex-based types are unsupported in
  Experience Builder.
- Documented that `with orderNumber = ...` is literal AgentScript, not an
  unfinished binding.

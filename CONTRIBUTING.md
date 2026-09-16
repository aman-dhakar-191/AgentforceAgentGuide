# Writing and verifying pages

This guide's whole premise is that its samples were run against a real org.
That only holds if testing and publishing stay connected. This document is
the loop: where code goes, how to test it, and how to record the result.

## The rule

**Code samples are never written in Markdown.** Every code block in the guide
is imported at build time from `examples/`, the SFDX project in this repo:

````
```apex file=../../examples/force-app/main/default/classes/CaseInput.cls
```
````

You edit the `.cls`, deploy that file, test it, and the docs update
themselves. If you paste code into a page instead, it is unverifiable by
construction and the next person cannot tell.

## Where files go

| What you built | Where it belongs |
| --- | --- |
| Apex class | `examples/force-app/main/default/classes/` |
| LWC | `examples/force-app/main/default/lwc/<name>/` |
| Lightning Type Bundle | `examples/force-app/main/default/lightningTypes/<type>/` |
| AgentScript fragment | `examples/agent-script/<name>.agent` |
| Permission set, custom object, etc. | the matching `force-app/main/default/` folder |

Keep each file small and single-purpose. Whole-file imports are the robust
form; line ranges break silently the moment you add a line above them.

## The loop

### 1. Write the code in `examples/`, not in the docs

```bash
cd examples
sf project deploy start --source-dir force-app
```

### 2. Wire it up in the org

Metadata deploy alone does not create a working agent. In Agentforce Builder:

1. Add the action, pointing at `apex://<YourClass>`.
2. Paste the AgentScript from `examples/agent-script/`.
3. **Commit and activate the agent.** Custom Lightning Type renderer cards do
   not appear in the Builder preview while the agent is in Draft. This is a
   known platform bug — do not spend an hour re-checking your wiring.
4. Add agent access to your user's permission set, or the agent will not
   appear in the chat experience at all.

### 3. Test it for real

Run the actual conversation in the deployed experience, not just the preview.
Confirm the things that fail silently:

- The action fires when you'd expect, from the instruction wording alone.
- Inputs arrive populated — a name mismatch between AgentScript and
  `@InvocableVariable` yields `null`, not an error.
- Outputs come back and the agent reads them correctly.
- For CLTs: the editor form renders, and the renderer card renders after
  submit.

### 4. Push fixes back into `examples/`

Anything you changed in the org to make it work — a field, an annotation, the
instruction phrasing — goes back into the file in `examples/`. **This is the
step that makes verification mean anything.** Skip it and the docs describe
something that never worked.

### 5. Record the result

Edit `verification.json`:

```json
{
  "actions/apex-actions": {
    "verified": true,
    "date": "2026-09-20",
    "org": "scratch",
    "apiVersion": "64.0",
    "notes": "submit_case fires from a cold start; outputs read back correctly."
  }
}
```

The key is the doc's path under `docs/`, without `.md`. Fields:

| Field | Meaning |
| --- | --- |
| `verified` | `true` only if you ran it and it worked |
| `date` | when you last checked — this is what goes stale |
| `org` | `scratch`, `developer`, or `namespaced` |
| `apiVersion` | the org's API version |
| `notes` | anything that surprised you; shown in the banner |
| `exempt` | `true` for pages with no code to test |

A page **not listed** in `verification.json` renders as unverified. That
default is deliberate: forgetting to register a new page makes it look
untested, which is true, rather than making it look fine.

### 6. Build before you push

```bash
npm run build
```

This is the real check. It fails on broken internal links and on `file=`
imports pointing at files you moved or renamed. The same build runs on every
PR.

## When a sample stops working

Salesforce moves. When something that was verified breaks:

1. Set `verified: false` and put what broke in `notes`. Do this **first** —
   a wrong "verified" badge is worse than no badge.
2. Fix the file in `examples/`.
3. Re-test, then set it back to `true` with a new `date`.
4. Add a `### Fixed` entry to `CHANGELOG.md` if a reader would care.

## When sources disagree

The official docs and the sample recipes do not always agree. The live
example is the Apex class shape behind a Custom Lightning Type: the recipe
uses `public` inner classes, the platform docs require top-level `global`
classes with `@AuraEnabled` and `@JsonAccess`.

**Say so in the page.** Do not silently pick one. State what each source
says, what you observed in the org, and which form the guide teaches.
Readers hitting the same contradiction need to know it is the platform being
inconsistent, not them misreading.

## Adding a new page

1. Create `docs/<section>/<page>.md` with `title`, `sidebar_label`,
   `sidebar_position` front matter.
2. Add `_category_.json` if the section is new.
3. Put the code in `examples/` and import it with `file=`.
4. Add an entry to `verification.json` — `verified: false` until you test it.
5. Add a `### Added` line to `CHANGELOG.md`.
6. `npm run build`, then commit.

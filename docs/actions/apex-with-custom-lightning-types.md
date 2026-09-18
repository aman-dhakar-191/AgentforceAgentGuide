---
title: Apex Actions with Custom Lightning Types
sidebar_label: Apex + Custom Lightning Types
sidebar_position: 2
---

# Apex Actions with Custom Lightning Types

A plain Apex action gets you default UI: the agent collects inputs
conversationally and reports outputs as text. **Custom Lightning Types
(CLTs)** replace both ends with your own Lightning Web Components — a
structured form for input, a rich card for output.

Read [Actions Backed by Apex](./apex-actions.md) first; everything here
builds on that action definition.

## What CLTs actually do

A CLT is a binding between three layers. Nothing renders until all three
agree:

```
AgentScript action                  Lightning Type Bundle           LWC Component
─────────────────                   ─────────────────────           ─────────────
complex_data_type_name:             caseInput/                      caseInputEditor/
  "c__caseInput"      ──────────►     schema.json                     js-meta.xml:
  is_user_input: True                   → @apexClassType/                target:
                                          c__CaseInput                     lightning__AgentforceInput
                                      lightningDesktopGenAi/             targetType: c__caseInput
                                        editor.json
                                          → c/caseInputEditor

complex_data_type_name:             caseResult/                     caseResultRenderer/
  "c__caseResult"     ──────────►     schema.json                     js-meta.xml:
  is_displayable: True                  → @apexClassType/                target:
  filter_from_agent: False                c__CaseResult                    lightning__AgentforceOutput
                                      lightningDesktopGenAi/             sourceType: c__caseResult
                                        renderer.json
                                          → c/caseResultRenderer
```

The `complex_data_type_name` is the join key. It appears in AgentScript, it
names the Lightning Type Bundle folder, and it appears again in the LWC's
`js-meta.xml`. A typo in any of the three gets you the default UI with no
error.

:::note Not every `complex_data_type_name` is a custom type
The platform ships its own Lightning types, namespaced `lightning__` instead
of `c__`. The common one is `lightning__recordIdType`, which is how a
Salesforce record Id should be typed — see
[Record IDs are not strings](./apex-actions.md#record-ids-are-not-strings).

Built-in types need no bundle, no LWC and no deploy: you name the type and
the platform supplies the handling. Everything below is about the `c__` case,
where you author all three layers yourself.
:::

**Input** flows through `editor.json` → an LWC targeting
`lightning__AgentforceInput`, matched by `targetType`.
**Output** flows through `renderer.json` → an LWC targeting
`lightning__AgentforceOutput`, matched by `sourceType`.

## Apex class requirements — read this before writing code

The Apex behind a CLT has stricter rules than the Apex behind a plain
action, because the schema is *projected* from the class rather than
declared by hand.

| Requirement | Rule |
| --- | --- |
| Class shape | Top-level class, in its own file. Not an inner class. |
| Visibility | `global`. `public` or `private` can fail in namespaced orgs and managed packages. |
| Field annotation | `@AuraEnabled` on every field that must appear in the type — including fields inside objects used as `@InvocableVariable`. |
| Class annotation | `@JsonAccess(serializable='always' deserializable='always')` on every class. |
| Namespace prefix | `c__` for local org classes; your registered namespace for managed packages. |

> **Conflicting guidance in the wild.** The official
> `CustomLightningTypes` sample recipe uses `public` **inner** classes and
> references them with `$` syntax
> (`@apexClassType/c__CaseSubmissionService$CaseInput`). The Lightning Types
> platform documentation explicitly prohibits inner classes and requires
> `global`. Treat the inner-class form as a local-org convenience that
> happens to work in the sample, and the table above as what to write if you
> will ever deploy to a namespaced org or package this. Migrating from inner
> to top-level classes later means deleting and recreating the agent action.

### Supported data types

Primitives (`Integer`, `Double`, `Long`, `Date`, `Datetime`, `Time`,
`String`, `ID`, `Boolean`), sObjects (generic or specific), collections
(lists/arrays of primitives, sObjects, user-defined classes, and
collections; `Map<String, ...>` only), and user-defined Apex classes.

### Schema projection

You do not write out the fields in `schema.json`. The
`LightningTypeBundle` API introspects the referenced Apex class, scans for
`@AuraEnabled` member variables, and generates the runtime JSON schema —
translating primitives, nested classes and sObjects automatically. The Apex
class is the single source of truth: add an `@AuraEnabled` field and the
type's structure updates with no JSON edit.

## Building it

### 1. The Apex data shapes

```apex file=../../examples/force-app/main/default/classes/CaseInput.cls
```

```apex file=../../examples/force-app/main/default/classes/CaseResult.cls
```

The request wrapper's field names must match the AgentScript input names:

```apex file=../../examples/force-app/main/default/classes/SubmitCaseRequest.cls
```

### 2. The Lightning Type Bundles

One bundle folder per type, named to match `complex_data_type_name` without
the `c__` prefix.

```
lightningTypes/
  caseInput/
    schema.json
    lightningDesktopGenAi/
      editor.json
  caseResult/
    schema.json
    lightningDesktopGenAi/
      renderer.json
```

`caseInput/schema.json` — no properties, just a pointer:

```json file=../../examples/force-app/main/default/lightningTypes/caseInput/schema.json
```

`caseInput/lightningDesktopGenAi/editor.json` — a top-level override, using
`$` as the key to replace the UI for the entire type with one component:

```json file=../../examples/force-app/main/default/lightningTypes/caseInput/lightningDesktopGenAi/editor.json
```

`caseResult/lightningDesktopGenAi/renderer.json` is the same shape, pointing
at `c/caseResultRenderer`.

:::warning Two forms of this file exist
The shape above follows the platform documentation. A `DemoOrderResultV2`
renderer confirmed working in an org uses an extra wrapper key naming the
role:

```json
{
  "renderer": {
    "componentOverrides": {
      "$": { "definition": "c/orderDetailsRenderer" }
    }
  }
}
```

That form is the one with observed evidence behind it — see the
[Demo Order recipe](../recipes/demo-order-clt.md), verified on
`enhancedWebChat`. The unwrapped form above has not been run in an org. If
your card does not render, try the wrapped form first. This page will be
corrected once both channels are tested.
:::

Map individual schema properties onto LWC properties with
`{!$attrs.PropertyName}`. Note the channel limits below: property-level
overrides are only available in `experienceBuilder`, so in the agent channels
a top-level override handling the whole type is the only option.

#### Channels

The channel subfolder decides where the override applies, and each channel
supports a different subset. These four are the supported channels:

| Channel | Surface | Editor | Renderer | Top-level override | Property-level override |
| --- | --- | :-: | :-: | :-: | :-: |
| `lightningDesktopGenAi` | Employee agent in Lightning Experience | Yes | Yes | Yes | No |
| `lightningMobileGenAi` | Employee agent on mobile; Service agent via Enhanced Chat v2 on mobile | Yes | Yes | Yes | No |
| `enhancedWebChat` | Service agent via Enhanced Chat v2 | Yes | Yes | Yes | No |
| `experienceBuilder` | Experience Builder sites | Yes | **No** | Yes | **Yes** |

Two consequences worth planning around:

**`experienceBuilder` has no renderer support.** You can override the input
form there, but not the output display — an action result falls back to the
default rendering. If a custom result card is the point, that channel cannot
deliver it.

**Property-level overrides only exist in `experienceBuilder`.** In the three
agent channels the only available override is top-level: one component
handling the whole type, keyed by `$`. You cannot swap the component for a
single property and leave the rest default.

Separately, the platform documentation states that **Apex-based** types are
not supported in Experience Builder sites. Read alongside the table above,
that most likely means Experience Builder supports editor overrides for
Lightning types generally, but not for types whose schema projects from an
Apex class. Untested here — if you need Apex-based types in Experience
Builder, verify it before designing around it.

### 3. The LWC components

The editor receives a `value` property holding existing data, and dispatches
`valuechange` when the user edits the form:

```js file=../../examples/force-app/main/default/lwc/caseInputEditor/caseInputEditor.js
```

`event.stopPropagation()` matters — without it the inner input's own event
escapes alongside yours and the platform can see conflicting updates.

Editor `js-meta.xml` — matched by `targetType`:

```xml file=../../examples/force-app/main/default/lwc/caseInputEditor/caseInputEditor.js-meta.xml
```

Renderer `js-meta.xml` — matched by `sourceType`:

```xml file=../../examples/force-app/main/default/lwc/caseResultRenderer/caseResultRenderer.js-meta.xml
```

The renderer receives the action output through its `value` property.

### 4. The AgentScript action

```yaml file=../../examples/agent-script/submit_case.agent
```

The property pairs that matter:

- **Input**: `is_user_input: True` + `complex_data_type_name` → editor renders.
- **Output**: `is_displayable: True` + `filter_from_agent: False` +
  `complex_data_type_name` → renderer renders *and* the agent can still
  reason over the data. Set `filter_from_agent: True` if you want the card
  shown but the values kept out of the model's context.

### 5. The instruction wording

This is the non-obvious part. The phrase **`action's user_input tool`** is
what tells the platform to render the CLT editor rather than collect the
fields conversationally:

```yaml file=../../examples/agent-script/submit_case_instructions.agent
```

Drop that phrasing and you get a working action with default UI — no error,
just no form.

## What happens at runtime

1. The agent's reasoning identifies the intent and invokes the action's user
   input tool.
2. The platform sees `is_user_input: True` and `complex_data_type_name`.
3. It resolves the `caseInput` bundle and finds the editor override.
4. `caseInputEditor` renders the structured form.
5. On submit, the LWC dispatches `valuechange` with the form data.
6. The Apex method executes with the collected input.
7. The platform sees `is_displayable: True` and the output's
   `complex_data_type_name`.
8. It resolves the `caseResult` bundle and finds the renderer override.
9. `caseResultRenderer` renders the confirmation card.

## Testing

Two things will waste an afternoon if you don't know them up front:

- **The renderer card does not appear in the Agentforce Builder preview
  panel while the agent is in Draft.** This is a known platform bug, not a
  wiring mistake. Commit and activate the agent in Agentforce Builder, then
  test.
- **The user's permission set must grant agent access** to the agent. Without
  it the agent doesn't appear in the Agentforce chat experience at all.

Debug in wiring order — the join key first, the component last:

1. Does `complex_data_type_name` match the bundle folder name exactly,
   prefix included?
2. Does `schema.json`'s `lightning:type` resolve to a real Apex class with
   the right namespace prefix?
3. Does the `js-meta.xml` `targetType` / `sourceType` match
   `complex_data_type_name`?
4. Is the agent activated, not Draft?

## Changing Apex classes safely

Once a type is live, the Apex class behind it is part of a contract:

| Change | Status | Impact |
| --- | --- | --- |
| Adding `@AuraEnabled` fields | Permitted | Schema projection picks them up automatically |
| Renaming or deleting the class | Prohibited | Runtime failures for any referencing `lightning:type` |
| Changing a field's data type | Breaking | Breaks the integration |
| Removing an `@AuraEnabled` field in use | Breaking | Invocation errors |
| `global` → `public` in a managed package | Prohibited | Breaks external references |

Additive is safe; everything else needs a migration. And if you created an
agent action *before* the Apex class met the requirements above, delete and
recreate the action — updating the class alone does not re-register it.

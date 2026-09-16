---
title: Apex Actions with Custom Lightning Types
sidebar_label: Apex + Custom Lightning Types
sidebar_position: 2
---

# Apex Actions with Custom Lightning Types

:::info Verification status
**Not yet verified against an org.** Samples on this page are derived from the
official Lightning Types documentation and the `CustomLightningTypes` recipe.
Once run in an org, this banner is replaced with the tested org type and API
version.
:::

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

```apex
@JsonAccess(serializable='always' deserializable='always')
global class CaseInput {
    @AuraEnabled
    @InvocableVariable(
        label='Subject'
        description='Case subject'
        required=true
    )
    global String subject;

    @AuraEnabled
    @InvocableVariable(label='Priority' description='Case priority')
    global String priority;

    @AuraEnabled
    @InvocableVariable(label='Description' description='Case description')
    global String description;
}
```

```apex
@JsonAccess(serializable='always' deserializable='always')
global class CaseResult {
    @AuraEnabled global String caseNumber;
    @AuraEnabled global String subject;
    @AuraEnabled global String priority;
    @AuraEnabled global String status;
    @AuraEnabled global Datetime createdDate;
    @AuraEnabled global String estimatedResponse;
}
```

The request wrapper's field names must match the AgentScript input names:

```apex
global class SubmitCaseRequest {
    @InvocableVariable(required=true)
    global CaseInput case_data;
}
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

```json
{
  "title": "Case Input",
  "description": "Support case submission data",
  "lightning:type": "@apexClassType/c__CaseInput"
}
```

`caseInput/lightningDesktopGenAi/editor.json` — a top-level override, using
`$` as the key to replace the UI for the entire type with one component:

```json
{
  "componentOverrides": {
    "$": {
      "definition": "c/caseInputEditor"
    }
  }
}
```

`caseResult/lightningDesktopGenAi/renderer.json` is the same shape, pointing
at `c/caseResultRenderer`.

Map individual schema properties onto LWC properties with
`{!$attrs.PropertyName}` when you need finer control than a top-level
override.

#### Channels

The channel subfolder decides where the override applies. Pick the folders
matching the surfaces you support:

| Folder | Surface |
| --- | --- |
| `lightningDesktopGenAi` | Agentforce Employee agent in Lightning Experience |
| `enhancedWebChat` | Agentforce Service agent via Enhanced Chat v2 |
| `lightningMobileGenAi` | Employee agent on mobile; Service agent via Enhanced Chat v2 on mobile |

Apex-based types are **not supported in Experience Builder sites**.

### 3. The LWC components

The editor receives a `value` property holding existing data, and dispatches
`valuechange` when the user edits the form:

```js
handleInputChange(event) {
    event.stopPropagation();
    const { name, value } = event.target;
    this[name] = value;

    this.dispatchEvent(
        new CustomEvent('valuechange', {
            detail: {
                value: {
                    subject: this.subject,
                    priority: this.priority,
                    description: this.description
                }
            }
        })
    );
}
```

`event.stopPropagation()` matters — without it the inner input's own event
escapes alongside yours and the platform can see conflicting updates.

Editor `js-meta.xml` — matched by `targetType`:

```xml
<targets>
    <target>lightning__AgentforceInput</target>
</targets>
<targetConfigs>
    <targetConfig targets="lightning__AgentforceInput">
        <targetType name="c__caseInput"/>
    </targetConfig>
</targetConfigs>
```

Renderer `js-meta.xml` — matched by `sourceType`:

```xml
<targets>
    <target>lightning__AgentforceOutput</target>
</targets>
<targetConfigs>
    <targetConfig targets="lightning__AgentforceOutput">
        <sourceType name="c__caseResult"/>
    </targetConfig>
</targetConfigs>
```

The renderer receives the action output through its `value` property.

### 4. The AgentScript action

```
actions:
   submit_case:
      description: "Submits a support case with structured input and returns case details"
      inputs:
         case_data: object
            description: "Case details including subject, priority, and description"
            label: "case_data"
            is_required: True
            is_user_input: True
            complex_data_type_name: "c__caseInput"
      outputs:
         case_result: object
            description: "The created case details for display"
            label: "case_result"
            complex_data_type_name: "c__caseResult"
            filter_from_agent: False
            is_displayable: True
         case_number: string
            description: "The case number assigned to the new case"
      target: "apex://CaseSubmissionService"
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

```
instructions:->
   if not @variables.case_submitted:
      | The user wants to submit a support case.
        Call {!@actions.submit_case} action's user_input tool to collect the case details from the user.
        Once the form is submitted, confirm the case was created and share the case number.
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

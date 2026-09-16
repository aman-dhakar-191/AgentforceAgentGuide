---
title: Demo Order with a Custom Lightning Type
sidebar_label: Demo Order (CLT output)
sidebar_position: 1
---

# Demo Order with a Custom Lightning Type

A minimal recipe for the **output half** of Custom Lightning Types: an action
that returns structured order data and lets a renderer LWC display it, with no
input form involved.

It is deliberately narrow. The only thing being proved is that a
`complex_data_type_name` output reaches its renderer and draws a card — which
is the part most likely to fail silently, and the part the Agentforce Builder
preview panel actively lies about while an agent is in Draft.

For the full input-and-output version, see
[Apex Actions with Custom Lightning Types](../actions/apex-with-custom-lightning-types.md).

## What it does

```
User: "Show me a demo order"
          │
          ▼
OrderInquiries subagent routes to Get_Demo_Order
          │
          ▼
DemoOrderAction (Apex) returns a DemoOrderResultV2
          │
          ▼
orderResult output: is_displayable, complex_data_type_name c__DemoOrderResultV2
          │
          ▼
renderer LWC draws the order card
```

The user can supply an order number or not; with no number the action returns
a default demo order.

## The AgentScript

```yaml file=../../examples/agent-script/get_demo_order.agent
```

### What matters in it

**The output properties are the whole recipe.** Three of them have to appear
together, and the card silently fails to render if any is missing:

| Property | Why |
| --- | --- |
| `complex_data_type_name: "c__DemoOrderResultV2"` | The join key. Names the Lightning Type Bundle folder and must match the renderer LWC's `sourceType`. |
| `is_displayable: True` | Hands the value to the display layer. Without it the value is data only. |
| `filter_from_agent: False` | Keeps the data in the agent's context as well, so it can also talk about the order. Set `True` to show the card but hide the values from the model. |

**There is no input CLT here.** The `orderNumber` input is a plain string with
no `is_user_input` and no `complex_data_type_name`, so it is collected
conversationally. That is what makes this a smaller test than the full
editor-and-renderer recipe.

**The instructions are written to force the call.** The wording is blunt on
purpose — an explicit list of example phrasings, and an instruction not to
summarize the output:

> Do not convert the structured Get Demo Order output into a text summary.

Without that, a model that has the structured data in context will often
helpfully describe the order in prose, and you cannot tell whether the
renderer failed or the agent simply talked over it. For a production agent
you would not need this; for a rendering test you do.

## The pieces this needs in the org

| Component | Role |
| --- | --- |
| `DemoOrderAction` (Apex) | Invocable action behind `apex://DemoOrderAction` |
| `DemoOrderResultV2` (Apex) | The data shape the Lightning type projects its schema from |
| `DemoOrderResultV2` Lightning Type Bundle | `schema.json` pointing at the Apex class, plus `lightningDesktopGenAi/renderer.json` pointing at the LWC |
| Renderer LWC | Targets `lightning__AgentforceOutput` with `sourceType` `c__DemoOrderResultV2` |

The Apex class behind a Lightning type has stricter requirements than a plain
invocable class — top-level, `global`, `@AuraEnabled` fields, `@JsonAccess`.
Those rules and why they matter are covered in
[Apex Actions with Custom Lightning Types](../actions/apex-with-custom-lightning-types.md#apex-class-requirements--read-this-before-writing-code).

## Testing it

1. Deploy the metadata, then add the action in Agentforce Builder pointing at
   `apex://DemoOrderAction`.
2. **Commit and activate the agent.** The renderer card does not appear in the
   Builder preview while the agent is in Draft. This is a known platform bug,
   not a wiring mistake, and it is the single most expensive thing to
   rediscover.
3. Grant agent access on the running user's permission set, or the agent will
   not appear in the chat experience at all.
4. Ask for a demo order both ways — with an order number and without — and
   confirm the card renders rather than a prose summary.

If the card does not appear, debug in wiring order, join key first:

1. Does `complex_data_type_name` match the bundle folder name exactly,
   `c__` prefix included?
2. Does the bundle's `schema.json` resolve to a real Apex class?
3. Does the LWC's `sourceType` match `complex_data_type_name`?
4. Is the agent activated, not Draft?

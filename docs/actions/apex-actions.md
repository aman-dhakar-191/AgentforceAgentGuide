---
verified: false
verified_on: null
org_type: null
api_version: null
notes: Not yet run against an org. Code samples are derived from official docs and the CustomLightningTypes recipe.
---

# Actions Backed by Apex

An Apex action lets an agent call your own server-side logic. You write an
invocable Apex method, point an AgentScript action at it with an
`apex://` target, and the platform handles turning the agent's reasoning
into a typed method call and the method's return value back into something
the agent can talk about.

This page covers the plain Apex action. For replacing the input form or the
output card with your own LWC, continue to
[Apex Actions with Custom Lightning Types](./apex-with-custom-lightning-types.md).

## The three pieces

```
AgentScript action          Apex class                    Runtime
──────────────────          ──────────                    ───────
target: "apex://            @InvocableMethod              1. agent decides to act
  CaseSubmissionService"      submitCase(List<Request>)   2. inputs bound to Request
                                                          3. method runs
inputs:  name/type/desc  ─►  Request  @InvocableVariable  4. Response mapped to outputs
outputs: name/type/desc  ◄─  Response @InvocableVariable  5. agent reads outputs
```

Three things must line up, and the failure mode when they don't is usually a
silent no-op rather than a compile error:

1. **The action's `target`** names the Apex class.
2. **Input names in AgentScript** match the `@InvocableVariable` field names
   on the request wrapper class, exactly.
3. **Output names in AgentScript** match the `@InvocableVariable` field names
   on the response wrapper class, exactly.

## Minimal Apex action

### The Apex

An invocable method takes a `List` of requests and returns a `List` of
responses. The platform invokes it with a single-element list for an agent
action, but the bulk signature is still required.

```apex
public with sharing class CaseSubmissionService {

    public class SubmitCaseRequest {
        @InvocableVariable(
            label='Subject'
            description='Short summary of the problem'
            required=true
        )
        public String subject;

        @InvocableVariable(label='Priority' description='Case priority')
        public String priority;

        @InvocableVariable(label='Description' description='Full detail')
        public String description;
    }

    public class SubmitCaseResponse {
        @InvocableVariable public String case_number;
        @InvocableVariable public String status;
    }

    @InvocableMethod(
        label='Submit Case'
        description='Creates a support case and returns its case number'
    )
    public static List<SubmitCaseResponse> submitCase(List<SubmitCaseRequest> requests) {
        List<SubmitCaseResponse> results = new List<SubmitCaseResponse>();

        for (SubmitCaseRequest req : requests) {
            Case c = new Case(
                Subject     = req.subject,
                Priority    = String.isBlank(req.priority) ? 'Medium' : req.priority,
                Description = req.description,
                Origin      = 'Agentforce'
            );
            insert c;

            Case created = [
                SELECT CaseNumber, Status
                FROM Case
                WHERE Id = :c.Id
                LIMIT 1
            ];

            SubmitCaseResponse res = new SubmitCaseResponse();
            res.case_number = created.CaseNumber;
            res.status      = created.Status;
            results.add(res);
        }

        return results;
    }
}
```

### The AgentScript

```
actions:
   submit_case:
      description: "Submits a support case and returns the new case number"
      inputs:
         subject: string
            description: "Short summary of the problem"
            is_required: True
         priority: string
            description: "Case priority: Low, Medium, High"
         description: string
            description: "Full detail of the problem"
      outputs:
         case_number: string
            description: "The case number assigned to the new case"
         status: string
            description: "The status of the newly created case"
      target: "apex://CaseSubmissionService"
```

### Wiring it into instructions

An action that exists but is never referenced is never called. Reference it
from a topic's instructions with `{!@actions.<name>}`:

```
instructions:->
   | The user wants to report a problem.
     Gather the subject, priority, and description conversationally,
     then call {!@actions.submit_case} and tell the user their case number.
```

## Writing descriptions the agent can actually use

The `description` on the action and on every input is not documentation —
it is the prompt the model reasons over when deciding whether and how to
call the action. This is the highest-leverage part of an Apex action and the
most commonly under-invested.

- **Action description**: say *when* to call it, not just what it does.
  "Submits a support case. Use when the user reports a problem they want
  tracked" beats "Submits a case."
- **Input descriptions**: state the allowed values. `"Case priority: Low,
  Medium, or High"` gets you valid values; `"The priority"` gets you
  whatever the user happened to say.
- **Output descriptions**: describe what the agent should *do* with the
  value, since the agent reads outputs back into its reasoning.

## Controlling what the agent sees

Two properties on outputs decide what reaches the model:

| Property | Effect |
| --- | --- |
| `filter_from_agent: True` | The value is returned but withheld from the agent's context. Use for data the UI needs but the model shouldn't reason over or repeat. |
| `is_displayable: True` | The value is handed to the display layer. Paired with a Custom Lightning Type, this is what renders a custom card. |

Withholding large payloads with `filter_from_agent` is worth doing
deliberately: everything you return that isn't filtered consumes context and
can be echoed back to the user verbatim.

## Supported input and output types

Action inputs and outputs map to Apex types. Stick to:

- Primitives — `String`, `Integer`, `Double`, `Long`, `Boolean`, `Date`,
  `Datetime`, `Time`, `ID`
- sObjects — generic or specific (`Account`, `MyObject__c`)
- Collections — `List`/array of the above, and `Map<String, ...>` where the
  key is always a `String`
- User-defined Apex classes, for structured `object` inputs and outputs

## Security and governor limits

- **`with sharing` is the right default.** An agent action runs on behalf of
  a user; enforcing their sharing rules is almost always what you want. Use
  `without sharing` only with a reason you can write down.
- **Field-level security is not automatic.** Check `isAccessible()` /
  `isCreateable()`, or use `Security.stripInaccessible()`, before you trust
  fields on the way in or out.
- **The method runs in a normal Apex transaction**, with normal governor
  limits. The bulk signature means you should still avoid SOQL and DML
  inside the request loop for anything that could be invoked in bulk.
- **Users need permission.** The running user needs access to the Apex class
  and to the agent itself. A permission set granting agent access is a
  required setup step, not an optional hardening one — without it the agent
  simply doesn't appear.

## Common failure modes

| Symptom | Likely cause |
| --- | --- |
| Action never fires | No `{!@actions.<name>}` reference in instructions, or a description too vague for the model to match intent |
| Inputs arrive null | AgentScript input name doesn't exactly match the `@InvocableVariable` field name |
| Outputs missing | Response field lacks `@InvocableVariable`, or the output name doesn't match |
| Changes to Apex don't take effect | The agent action was registered against the old shape — delete and recreate the action |
| Works in Draft, fails when deployed | Permission set missing agent access, or an org-namespace prefix issue |

## Next

- [Apex Actions with Custom Lightning Types](./apex-with-custom-lightning-types.md)
  — replace the default input form and output card with your own LWC.

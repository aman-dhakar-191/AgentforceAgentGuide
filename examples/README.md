# Example source

Every code sample in the guide is imported from this SFDX project at build
time, so what is published is the code that was actually deployed and tested.
Nothing here is copy-pasted into the docs by hand.

## Layout

```
examples/
  sfdx-project.json
  agent-script/                     AgentScript fragments imported by the docs
  force-app/main/default/
    classes/                        Apex data shapes and invocable services
    lwc/                            CLT editor and renderer components
    lightningTypes/                 Lightning Type Bundles
```

## Deploying to a scratch org

```bash
cd examples
sf org create scratch --definition-file config/project-scratch-def.json --alias agentguide --set-default
sf project deploy start
sf org assign permset --name Agentforce_Guide_Examples   # once the permset exists
sf org open
```

## Testing checklist

After deploying, the agent still needs wiring in Agentforce Builder:

1. Create the agent and add the `submit_case` action pointing at
   `apex://CaseSubmissionService`.
2. Paste the AgentScript from `agent-script/` into the topic.
3. **Commit and activate the agent.** The CLT renderer card does not appear
   in the Builder preview panel while the agent is in Draft — this is a known
   platform bug, not a wiring mistake.
4. Add agent access to the running user's permission set, or the agent will
   not appear in the chat experience at all.

Once a page's samples are confirmed working, update that page's verification
banner with the org type and API version tested.

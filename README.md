# Agentforce Agent Guide

A practical guide to building Agentforce agents — with AgentScript, Apex,
Custom Lightning Types, and the Salesforce CLI.

Every code sample here is intended to be **run against a real org before it
is marked verified**. Each page carries front-matter recording its
verification state:

```yaml
verified: true
verified_on: 2026-09-20
org_type: scratch          # scratch | developer | namespaced
api_version: "64.0"
```

A page with `verified: false` has not been executed yet — treat its samples
as derived from documentation, not proven.

## Contents

### Actions
- [Actions Backed by Apex](docs/actions/apex-actions.md) — invocable methods,
  input/output binding, descriptions the agent can reason over, security and
  governor limits.
- [Apex Actions with Custom Lightning Types](docs/actions/apex-with-custom-lightning-types.md)
  — replace the default input form and output card with your own LWC.

## Planned structure

```
docs/
  concepts/        agent anatomy: topics, actions, instructions, variables, the runtime loop
  agent-script/    authoring agents as script: syntax, action config, testing
  actions/         action backends: Apex, CLT, prompt templates, external services
  lightning-types/ custom types in depth: schema, channels, UI config
  cli/             sf CLI: project setup, deploy, agent test, preview
  recipes/         complete scenarios, each shown in script and CLI/metadata form
  reference/       metadata shapes, limits, glossary, troubleshooting
```

Concepts are written once in `concepts/` and linked to, rather than
re-explained per authoring mode — that is what keeps the script and CLI
tracks from doubling the guide's size.

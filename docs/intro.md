---
title: Introduction
sidebar_position: 1
slug: /
---

# Agentforce Agent Guide

A practical guide to building Agentforce agents with AgentScript, Apex,
Custom Lightning Types, and the Salesforce CLI.

## How this guide treats correctness

Agentforce and Lightning Types move quickly, and the official sources do not
always agree with each other. This guide handles that in two ways.

**Every page carries a verification banner.** A page is either verified —
meaning its samples were deployed and run in a real org, with the org type
and API version recorded — or it is explicitly marked unverified. Nothing is
presented as tested until it has been.

**Every page shows its last-modified date**, taken from git history rather
than maintained by hand, so a stale page is visibly stale. Meaningful
changes are also recorded in the [changelog](https://github.com/aman-dhakar-191/AgentforceAgentGuide/blob/main/CHANGELOG.md).

Where sources conflict, the guide says so in the text rather than silently
picking one. The clearest current example is the Apex class shape required
behind a Custom Lightning Type — see
[Apex Actions with Custom Lightning Types](./actions/apex-with-custom-lightning-types.md).

## Where to start

- New to agent actions → [Actions Backed by Apex](./actions/apex-actions.md)
- Need a custom form or result card →
  [Apex Actions with Custom Lightning Types](./actions/apex-with-custom-lightning-types.md)

## Planned structure

Concepts are written once and linked to, rather than re-explained per
authoring mode — that is what keeps the AgentScript and CLI tracks from
doubling the size of the guide.

| Section | Covers |
| --- | --- |
| `concepts/` | Agent anatomy: topics, actions, instructions, variables, the runtime loop |
| `agent-script/` | Authoring agents as script: syntax, action configuration, testing |
| `actions/` | Action backends: Apex, Custom Lightning Types, prompt templates |
| `lightning-types/` | Custom types in depth: schema, channels, UI configuration |
| `cli/` | `sf` CLI: project setup, deploy, agent test, preview |
| `recipes/` | Complete scenarios, each shown in script and CLI/metadata form |
| `reference/` | Metadata shapes, limits, glossary, troubleshooting |

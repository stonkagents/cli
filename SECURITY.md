# Security Policy

## Reporting a vulnerability

Please do not open a public issue for security problems.

Email **security@stonkagents.com** with:

- a description of the issue and the component affected (file, function, command),
- the CLI version (`stonkagents --version`) or the commit you tested,
- steps to reproduce, ideally a minimal proof of concept,
- the impact you observed,
- any suggested fix.

You will get an acknowledgement within 3 business days. We ask that you give us reasonable time to ship a fix before publishing details.

## Scope

This repository is a fork of [OpenClaw](https://github.com/openclaw/openclaw). Issues in shared OpenClaw code (gateway, channels, agents, sandboxing) affect the upstream project as well: report those to OpenClaw following their [security policy](https://github.com/openclaw/openclaw/blob/main/SECURITY.md) and copy security@stonkagents.com so we can ship the fix in the StonkAgents build as soon as it lands upstream.

StonkAgents-specific parts (the `extensions/stonkagents` provider plugin, installer onboarding, the tracker integration) are ours alone; report those to security@stonkagents.com only.

Anything about the StonkAgents hosted services (tracker, portal, docs) also goes to security@stonkagents.com.

## Supported versions

Only the latest published `stonkagents` npm release and the current `main` branch receive security fixes.

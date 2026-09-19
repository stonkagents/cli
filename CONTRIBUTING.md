# Contributing to the StonkAgents CLI

Thanks for helping out. This repository is a fork of [OpenClaw](https://github.com/openclaw/openclaw) that adds the StonkAgents provider plugin and installer support. Keep that split in mind when deciding where a change belongs.

## Where does my change go?

- **Generic OpenClaw behaviour** (gateway, channels, agents, TUI, docs that are not StonkAgents-specific): open the change against [openclaw/openclaw](https://github.com/openclaw/openclaw) first. We track upstream releases, so a fix landed there reaches this repository on the next sync and does not create a merge conflict for us.
- **StonkAgents-specific code** (`extensions/stonkagents/`, the `stonkagents` binary, installer onboarding, this README): open a pull request here.
- **Not sure**: open an issue here and we will point you to the right place.

## Prerequisites

- Node.js 22.14 or newer (upstream CI runs on 24)
- pnpm 10 (`corepack enable` picks the pinned version from `package.json`)
- Git

## Build and test

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm test
```

Faster loops while iterating:

```bash
pnpm test:fast                          # unit tests only
pnpm vitest run extensions/stonkagents         # a single area
pnpm lint
pnpm check                              # typecheck, lint, formatting and boundary checks
```

To try the CLI from the working tree:

```bash
pnpm openclaw --help
node openclaw.mjs onboard
```

## Pull requests

1. Fork the repository and create a branch from `main`.
2. Keep the change focused; one topic per pull request.
3. Add or update tests next to the code (`*.test.ts`). The StonkAgents provider tests live in `extensions/stonkagents/index.test.ts`.
4. Run `pnpm check` and `pnpm test` before pushing.
5. Fill in the pull request template. Say what changed, why, and how it was tested.
6. Commit messages follow the conventional style used upstream (`fix(stonkagents): ...`, `feat: ...`, `docs: ...`). No trailers are needed.

Pull requests that touch shared OpenClaw code are welcome, but expect us to ask for the upstream pull request link so the two trees stay aligned.

## Reporting bugs

Use the issue templates. Include the CLI version (`stonkagents --version`), your platform, the command you ran and the output. Never paste API keys, gateway tokens or full config files; redact them first.

## Security

Do not open public issues for security problems. See [SECURITY.md](SECURITY.md).

## License

By contributing you agree that your contributions are licensed under the MIT License, the same license that covers the rest of the repository (see [LICENSE](LICENSE) and [NOTICE](NOTICE)).

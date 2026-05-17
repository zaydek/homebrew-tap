# homebrew-tap Requirements Index

Maintenance rules live in [AGENTS.md](AGENTS.md).

## Canonical Gate

```sh
make requirements
```

## Active Requirements

| Layer        | Kind     | File                                                                      | Purpose                         |
| ------------ | -------- | ------------------------------------------------------------------------- | ------------------------------- |
| acceptance   | Acceptance | [acceptance/homebrew-live-e2e.acceptance.mjs](acceptance/homebrew-live-e2e.acceptance.mjs) | opt-in live install/uninstall e2e |
| architecture | Check    | [architecture/adderall-formula.check.mjs](architecture/adderall-formula.check.mjs) | adderall formula distribution    |
| architecture | Contract | [architecture/adderall-formula.contract.md](architecture/adderall-formula.contract.md) | Architecture Contract: Formula   |

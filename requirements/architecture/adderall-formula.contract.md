# Architecture Contract: adderall Formula

The `adderall` formula must install the proprietary Apple Silicon macOS binary
without exposing source code or mutating privileged system state.

## Contract

- `Formula/adderall.rb` points at the `adderall-v0.1.1` release asset.
- The formula sha256 matches the published release tarball.
- The formula declares `license :cannot_represent`.
- The formula is guarded to macOS-only, Ventura+, and Apple Silicon.
- The formula installs `bin/adderall` and creates an `add` symlink explicitly.
- The formula does not run `adderall install`.
- Caveats instruct users to run `adderall install` and `adderall doctor`.
- The formula test exercises `adderall --help`.

## Proof

```sh
node requirements/architecture/adderall-formula.check.mjs
```

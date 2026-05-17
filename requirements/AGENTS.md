# homebrew-tap Requirements

This folder owns executable accountability for the tap distribution surface.

The tap exists so Apple Silicon macOS users can install the proprietary
`adderall` binary with:

```sh
brew install zaydek/tap/adderall
```

## Proof

Run from the tap root:

```sh
make requirements
```

The gate validates the formula shape, release checksum, and downloaded binary
macOS minimum-version stamp without running `adderall install` or mutating
`/etc/sudoers.d`. After the tap is installed, run the optional live Homebrew
test with:

```sh
BREW_LIVE=1 make requirements
```

## Rules

- Keep the source private; this tap distributes binary release assets only.
- Keep `license :cannot_represent`; do not claim an open-source license.
- Do not run `adderall install` from the formula.
- Formula caveats must tell users to run `adderall install` and
  `adderall doctor`.
- Keep the formula Apple Silicon macOS-only until additional binaries exist.

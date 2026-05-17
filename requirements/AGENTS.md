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

For final machine acceptance on Snorlax or another Apple Silicon Mac, run the
opt-in e2e receipt. It installs from the tap, runs the one-time sudoers setup,
checks doctor, exercises `add 5s`, uninstalls the sudoers entry, and restores
the starting formula/sudoers state when possible:

```sh
make live-e2e
```

This command may show macOS administrator password prompts. Do not put it in the
default gate.

## Rules

- Keep the source private; this tap distributes binary release assets only.
- Keep `license :cannot_represent`; do not claim an open-source license.
- Do not run `adderall install` from the formula.
- Formula caveats must tell users to run `adderall install` and
  `adderall doctor`.
- Keep the formula Apple Silicon macOS-only until additional binaries exist.
- Keep the live e2e opt-in because it mutates `/etc/sudoers.d` and power state.

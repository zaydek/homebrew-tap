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

Precondition: Homebrew must already be installed and available on `PATH`.

This command is agent-driven but human-assisted: The Operator must be present to
type the macOS administrator password. A fresh machine normally shows two GUI
password prompts (`adderall install`, then test cleanup via `adderall
uninstall`); a machine that already has sudoers installed can show up to four
prompts because the test removes, installs, removes, then restores sudoers. Each
command has a two-minute timeout so an unanswered prompt fails the receipt
instead of hanging forever.

On a fresh machine, a passing `make live-e2e` leaves the machine clean: the test
uninstalls `adderall` and removes the sudoers entry after proving both install
and uninstall. To keep using `adderall` after a passing e2e, run:

```sh
brew install zaydek/tap/adderall
adderall install
adderall doctor
```

Do not put `make live-e2e` in the default gate.

## Rules

- Keep the source private; this tap distributes binary release assets only.
- Keep `license :cannot_represent`; do not claim an open-source license.
- Do not run `adderall install` from the formula.
- Formula caveats must tell users to run `adderall install` and
  `adderall doctor`.
- Keep the formula Apple Silicon macOS-only until additional binaries exist.
- Keep the live e2e opt-in because it mutates `/etc/sudoers.d` and power state.

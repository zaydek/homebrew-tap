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

The Operator acceptance path on Snorlax or another Apple Silicon Mac is the
plain Homebrew install path:

```sh
brew install zaydek/tap/adderall
adderall install
adderall doctor
add 5s
```

Precondition: Homebrew must already be installed and available on `PATH`.
`adderall install` shows the one-time macOS administrator password prompt.

For blind-agent or independent audit work, use the opt-in e2e receipt from a
tap checkout. It installs from the tap, runs the one-time sudoers setup, checks
doctor, exercises `add 5s`, uninstalls the sudoers entry, and restores the
starting formula/sudoers state when possible:

```sh
make live-e2e
```

This command is agent-driven but human-assisted: The Operator must be present to
type the macOS administrator password. A fresh machine normally shows two GUI
password prompts (`adderall install`, then test cleanup via `adderall
uninstall`); a machine that already has sudoers installed can show up to four
prompts because the test removes, installs, removes, then restores sudoers. Each
command has a two-minute timeout so an unanswered prompt fails the receipt
instead of hanging forever.

On a fresh machine, a passing `make live-e2e` leaves the machine clean: the test
uninstalls `adderall` and removes the sudoers entry after proving both install
and uninstall. It is not The Operator's normal install flow. To keep using
`adderall` after a passing e2e, run the plain Homebrew install path:

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
- Keep The Operator path as `brew install zaydek/tap/adderall`, `adderall
  install`, `adderall doctor`, `add 5s`.
- Keep the live e2e opt-in and agent-facing because it mutates
  `/etc/sudoers.d` and power state, then cleans up.

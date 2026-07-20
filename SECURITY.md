# Security policy

## Reporting

Found a vulnerability — especially anything that could expose a child's data?
Open a GitHub Security Advisory on this repository (preferred) or a private
report to the maintainer. Please do not open public issues for privacy-
sensitive findings.

## Scope that matters most

1. Any way for data in `localStorage` to leave the device.
2. XSS through imported backups or free-text notes.
3. The privacy guard (`tests/privacy.test.mjs`) failing to catch a class of
   personal data.
4. Integrity of the import/rollback path (silent data loss).

## Commitments

- No accounts, no server, no analytics — the attack surface is the static page.
- Zero runtime/build dependencies; CI actions pinned by major version.
- Every release passes the privacy guard before deploy; the deploy artifact is
  scanned again in CI.

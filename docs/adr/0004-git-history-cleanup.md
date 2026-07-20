# ADR-0004 — Git history cleanup runbook (personal identifiers in old blobs)

**Status:** accepted · 2026-07-20 · **execution requires the owner's go-ahead**

## Context

The working tree is clean (enforced by `tests/privacy.test.mjs`), but early
commits contain blobs with personal identifiers:

- a child's first name inside legacy `localStorage` key strings
  (`js/app.mjs` in commits `52d7e5c` → until the privacy commit), plus one
  header comment in `styles.css` and an old fixture `app` field
  (`tests/fixtures/v1-backup.json` in `1f4e3ce`);
- a real birth month as a code fallback in the same range;
- a household-materials / child-calibration comment block in `js/app.mjs`.

No real session logs, notes or backups were ever committed. Exposure is
limited to a first name in identifiers, one birth month, and coarse
developmental notes — worth removing, not an emergency.

## Preconditions (all satisfied before execution)

1. **Backup:** verified `git bundle` of all refs + worktree tarball, stored
   outside the repo with SHA-256 sums.
2. **Documentation:** this runbook.
3. **Affected commits identified:** `git log --all -S <pattern>` lists them;
   every commit from the first `feat:` onward carries at least one tainted blob,
   so the rewrite touches all commit ids.
4. **Private storage:** personal data continues to exist only on the owner's
   device and in the local backup folder (gitignored patterns).

## Procedure

```bash
# 0. fresh backup (repeat even if one exists)
git bundle create ../math-trail-pre-rewrite.bundle --all

# 1. install git-filter-repo (no repo deps involved)
pip3 install --user git-filter-repo

# 2. replacements file (never commit it) — fill the real strings locally;
#    they must never appear in this runbook either (the privacy guard checks)
cat > /tmp/replacements.txt <<'EOF'
<child-name-lowercase>==>legacy
<child-name-capitalized>==>Legacy
<real-birth-month-YYYY-MM>==>2023-06
EOF

# 3. rewrite every blob in every ref
git filter-repo --replace-text /tmp/replacements.txt

# 4. verify: both greps must return nothing
git log --all -S "<child-name-lowercase>" --oneline
git grep -i "<child-name-lowercase>" $(git rev-list --all) || echo CLEAN

# 5. force-push and clean the remote
git push --force --all && git push --force --tags
```

Then: invalidate any clones/forks (none known — repo is days old, zero forks,
zero stars at time of writing), and note that GitHub may retain unreachable
blobs in caches/PR references — contact GitHub Support for a server-side GC if
full erasure is required.

## Why not executed automatically

A history rewrite changes every commit id and force-pushes — destructive by
definition. Per the project's own rules, destructive actions on shared
history need an explicit human decision, even when preconditions are met.

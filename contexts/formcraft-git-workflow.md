# FormCraft — Git Branching Strategy & Workflow Setup

## Goal

Set up a Git repository with a `main` + `development` branch structure. After each successful phase, the agent commits all changes to `development`. You (the human) manually merge `development` → `main` when you're satisfied.

---

## One-Time Setup (Run This Now)

Run these commands from inside the `formcraft/` project root:

### 1. Initialize the repo (if not already done)

```bash
git init
```

If `git init` says "Reinitialized existing Git repository" — that's fine, continue.

### 2. Create a `.gitignore`

Create `formcraft/.gitignore` with this content:

```
node_modules/
dist/
.env
.env.local
.DS_Store
*.log
```

### 3. Make the first commit on `main`

```bash
git add .
git commit -m "chore: initial project scaffold (Phase 1)"
```

### 4. Create and switch to the `development` branch

```bash
git checkout -b development
```

`development` now starts from the same point as `main`.

### 5. Verify

```bash
git branch
```

Output should show:
```
* development
  main
```

---

## Per-Phase Commit Convention

After every successful phase, the agent runs this exact sequence from the `formcraft/` project root:

```bash
# Make sure you're on development
git checkout development

# Stage all changes
git add .

# Commit with a consistent message format
git commit -m "<type>: <short description> (Phase <N>)"
```

### Commit message format

```
feat: dashboard page — form cards, create modal, delete confirm (Phase 2)
feat: form builder — DnD canvas, field palette, properties panel (Phase 3)
feat: public form view — field rendering, validation, submission (Phase 4)
feat: analytics dashboard — stat cards, charts, response table (Phase 5)
feat: polish — share modal, toasts, empty states, mobile layout (Phase 6)
```

Use `feat:` for feature phases, `fix:` for bug-fix-only commits, `chore:` for config/tooling changes.

---

## Phase Commit Checklist (Agent Runs After Each Phase)

Before committing, the agent verifies:

- [ ] `npm run dev` starts without errors
- [ ] All acceptance criteria for the phase pass
- [ ] No `console.error` output in the browser
- [ ] Currently on the `development` branch (`git branch` confirms)

Then commits:

```bash
git checkout development
git add .
git commit -m "feat: [phase description] (Phase N)"
```

---

## Your Manual Merge Workflow (Human Only)

When you're happy with a phase and want to promote it to `main`:

```bash
# From inside formcraft/
git checkout main
git merge development --no-ff -m "merge: Phase N complete"
git checkout development
```

The `--no-ff` flag preserves a clean merge commit in the history so each phase is clearly visible in `git log`.

---

## Branch Rules Summary

| Branch | Who writes to it | When |
|---|---|---|
| `main` | You (manually) | After verifying a phase is solid |
| `development` | The coding agent | After each successful phase |

The agent **never touches `main`** directly. It always commits to `development`.

---

## Useful Commands for Reference

```bash
# See current branch
git branch

# See commit history (pretty)
git log --oneline --graph --all

# See what's changed but not yet committed
git status

# Undo last commit but keep changes (if something went wrong)
git reset --soft HEAD~1

# See diff between development and main
git diff main development
```

---

## Right Now — Backfill Phase 1

Since Phase 1 is already done, commit it to `development` immediately after setup:

```bash
git checkout development
git add .
git commit -m "chore: initial project scaffold (Phase 1)"
```

Then for Phase 2 (already complete), commit it too:

```bash
git add .
git commit -m "feat: dashboard page — form cards, create modal, delete confirm (Phase 2)"
```

From Phase 3 onward, the agent commits at the end of each phase automatically.

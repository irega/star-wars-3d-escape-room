---
name: save-worklog
description: Manually save a session entry to the project worklog. Captures session context, generates a summary, translates the user prompt to English, and saves to docs/WORKLOG.md after your confirmation. Use when you want to record progress at any point during the session.
---

# Save Worklog

Manually append a session entry to `docs/WORKLOG.md` with:
- Timestamp (auto-generated)
- Summary of what was done (Claude-generated from session context)
- Your original prompt, translated to English

## Workflow

1. **Invoke** — Type `/save-worklog`
2. **Review** — See the proposed entry (summary + translated prompt)
3. **Edit** (optional) — Modify the summary or prompt before saving
4. **Confirm** — Approve and save to worklog, or cancel

## Example

```
/save-worklog
```

Generates:
```
- **2026-05-26 13:05** — Updated the README with documentation about the worklog hook, explaining its purpose and scope.
  - Prompt used:
    "Add a section explaining the worklog hook for reviewers"
```

## Notes

- **Project-specific**: Only works in projects with `docs/WORKLOG.md`
- **Manual control**: Unlike automated hooks, you decide when to save
- **Full transparency**: See exactly what gets saved before it's committed

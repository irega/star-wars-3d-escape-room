---
name: save-worklog
description: Manually save a session entry to the project worklog. Captures session context, generates a summary, translates the user prompt to English, and saves to docs/WORKLOG.md after your confirmation. Use when you want to record progress at any point during the session.
agent: true
---

# Save Worklog Agent

Manually append a session entry to `docs/WORKLOG.md` with:
- Timestamp (auto-generated)
- Summary of what was done (Claude-generated from session context)
- Your original prompt, translated to English

## Task

1. Capture the current session context and the user's last prompt (before /save-worklog)
2. Run `.claude/skills/save-worklog/scripts/save-worklog.py` with the session data
3. Present the proposed worklog entry to the user
4. Ask for confirmation (save, edit, or cancel)
5. If approved, append the entry to `docs/WORKLOG.md` and create a git commit
6. Provide feedback on success

## Script Interface

The `save-worklog.py` script expects JSON on stdin:
```json
{
  "context": "session summary/context text",
  "messages": [
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "..."}
  ]
}
```

Output format:
```json
{
  "timestamp": "2026-05-26 13:11",
  "summary": "concise bullet point",
  "prompt_en": "translated last user prompt",
  "full_entry": "formatted entry with timestamp and prompt",
  "status": "pending_confirmation"
}
```

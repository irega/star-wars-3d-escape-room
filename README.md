# star-wars-3d-escape-room
Star Wars-themed 3D escape room running in the browser

## Worklog

**For reviewers:** This project uses a manual `/save-worklog` command (skill-based) to record progress in `docs/WORKLOG.md`. When invoked, it:
- Generates a concise summary of what was done
- Captures the user's original prompt, translated to English
- Shows the entry for review/editing before saving
- Appends to the worklog with timestamp

**Why this exists:** This is a **take-home exercise optimization** to keep `docs/WORKLOG.md` updated with full transparency. The command provides an audit trail of what was accomplished each step and what was requested, while giving the user explicit control over when entries are recorded.

**In production:** Such manual logging would not be standard (most teams rely on git commits + PR descriptions for history). This is included here to demonstrate how session context can be efficiently captured and summarized for documentation and transparency.

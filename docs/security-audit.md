# Security Audit Report — Phase 6

**Date:** 2026-05-29  
**Methodology:** `.claude/skills/security-audit/` — OWASP Top 10 baseline, five review domains (Input Handling, Auth & Authorization, Data Protection, Infrastructure, Third-Party Integrations).  
**Scope:** Full codebase post Phase 5 (`main` branch, commit `d6db373`).

---

## Summary

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 1 |
| Low | 1 |
| Info | — |

All Medium/Low findings are addressed or documented below. No Critical or High findings.

---

## Findings

### [MEDIUM] Missing HTTP security headers

- **Location:** `vercel.json` (deployment config)
- **Description:** No `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, or `Referrer-Policy` headers were configured. Without CSP, any injected script (e.g. via a browser extension, compromised CDN, or reflected content) runs without restriction. Without `X-Frame-Options`, the app can be embedded in a malicious iframe for clickjacking.
- **Impact:** No sensitive user data is stored, so the blast radius is limited. However, CSP is a standard defense-in-depth layer for any public web app.
- **Proof of concept:** Load the page in a frame: `<iframe src="https://star-wars-3d-escape-room.vercel.app"></iframe>`. Without `frame-ancestors 'none'`, this succeeds. Injecting a `<script>` tag via any vector would also execute without restriction.
- **Recommendation:** Add security headers in `vercel.json`. **Fixed in this PR.**

```json
"headers": [
  {
    "source": "/(.*)",
    "headers": [
      { "key": "X-Content-Type-Options", "value": "nosniff" },
      { "key": "X-Frame-Options", "value": "DENY" },
      { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
      {
        "key": "Content-Security-Policy",
        "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; media-src 'self'; worker-src 'self' blob:; frame-ancestors 'none'"
      }
    ]
  }
]
```

**CSP notes:**
- `style-src 'unsafe-inline'` is required because `index.html` contains an inline `<style>` reset block. Three.js/R3F inline styles set via CSSOM (JavaScript) are not restricted by `style-src`.
- `img-src data: blob:` covers Three.js texture data URIs and blob URLs.
- `worker-src blob:` covers any Web Workers spun up by three.js loaders.
- No `unsafe-eval` is needed — Three.js compiles GLSL shaders via the WebGL API, not JavaScript `eval()`.

---

### [LOW] i18next `escapeValue: false` with user-supplied interpolation

- **Location:** `src/i18n.ts:18`, `src/ui/Victory.tsx:15`
- **Description:** `escapeValue: false` disables i18next's own HTML-encoding of interpolation values. Player name (user input) is passed as `{{ name: playerName }}` into `t('victory.message', ...)`.
- **Impact:** No actual XSS risk. `t()` returns a plain string that React renders as a text node (not `innerHTML`), so React's DOM layer escapes any HTML entities. This is the standard react-i18next configuration and the [library's own documentation](https://react.i18next.com/latest/usetranslation-hook#overrides-i18next-options) recommends it.
- **Recommendation:** No change required. Document that the escaping guarantee comes from React's rendering layer (text nodes), not i18next. If `dangerouslySetInnerHTML` is ever used with i18next output, this must be revisited.

---

## Accepted risk

None. All findings are addressed (Medium fixed, Low documented with rationale).

---

## Checklist

- [x] Audit methodology cited (`.claude/skills/security-audit/`, OWASP Top 10)
- [x] Critical/High findings: none found
- [x] Medium finding: CSP headers added to `vercel.json`
- [x] Low finding: `escapeValue: false` documented with rationale — no fix needed
- [x] `npm audit` — **0 vulnerabilities** (lockfile reviewed 2026-05-29)
- [x] No secrets in repo — CI secrets use `${{ secrets.XXX }}` references only
- [x] Player name escaped via React text node rendering (not innerHTML); `maxLength={30}` constrains input
- [x] Terminal input handled as enumerated keystrokes, not free text; rendered via React text nodes
- [x] No arbitrary external URLs loaded from user input; audio src is a hardcoded relative path

---

## Positive Observations

- **Zero CVEs** — `npm audit` reports 0 vulnerabilities across all dependencies.
- **No unsafe DOM operations** — no `dangerouslySetInnerHTML`, `innerHTML`, or `eval()` in the codebase.
- **No secrets in source** — all CI tokens use `${{ secrets.XXX }}` references; `.gitignore` excludes `.env` files.
- **No backend attack surface** — static frontend-only; no auth, sessions, server-side processing, or database.
- **Input surface is minimal** — only two user inputs exist: player name (30-char max, stored in memory only, rendered via text node) and terminal keystrokes (enum-typed, validated against a fixed answer set).
- **No external network requests** — the app makes no `fetch` or XHR calls; all assets are bundled or served from `/public`.

#!/usr/bin/env python3
"""
Save worklog entry - captures session context, generates summary, saves to WORKLOG.md.
"""

import json
import sys
import os
import subprocess
from datetime import datetime


def get_timestamp() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M")


def condense_to_bullet(context: str) -> str:
    """Use Claude CLI to summarize session context."""
    if not context:
        return ""

    prompt = (
        "You are writing a single entry for a developer worklog.\n"
        "Based on the session summary below, write ONE concise bullet point (max 2 lines) "
        "describing what was done. Always write in English regardless of the conversation language. "
        "Plain text, past tense, no leading dash or asterisk. "
        "Be specific — mention files, decisions, or outcomes. No filler.\n\n"
        f"Session summary:\n{context}"
    )
    try:
        result = subprocess.run(
            [os.path.expanduser("~/.local/bin/claude"), "-p", prompt, "--model", "claude-haiku-4-5-20251001"],
            capture_output=True,
            text=True,
            timeout=30,
        )
        if result.returncode == 0 and result.stdout.strip():
            return result.stdout.strip()
    except Exception as e:
        sys.stderr.write(f"Claude CLI failed: {e}\n")

    return context[:200].replace("\n", " ").strip()


def extract_last_user_prompt(messages: list) -> str:
    """Extract the last user prompt, excluding /save-worklog command."""
    if not messages:
        return ""

    # Search backwards through messages for the last user message
    for msg in reversed(messages):
        if msg.get("role") == "user":
            content = msg.get("content", "")
            if isinstance(content, list):
                # Content is a list of blocks
                for block in content:
                    if isinstance(block, dict) and block.get("type") == "text":
                        text = block.get("text", "").strip()
                        if text and not text.startswith("/save-worklog"):
                            return text[:500]
            elif isinstance(content, str):
                # Content is a string
                text = content.strip()
                if text and not text.startswith("/save-worklog"):
                    return text[:500]

    return ""


def translate_to_english(text: str) -> str:
    """Translate user prompt to English if needed."""
    if not text:
        return ""

    prompt = (
        "Translate the following text to English. "
        "Keep it concise (one line max). "
        "If already in English, return as-is.\n\n"
        f"Text: {text}"
    )
    try:
        result = subprocess.run(
            [os.path.expanduser("~/.local/bin/claude"), "-p", prompt, "--model", "claude-haiku-4-5-20251001"],
            capture_output=True,
            text=True,
            timeout=10,
        )
        if result.returncode == 0 and result.stdout.strip():
            return result.stdout.strip()
    except Exception as e:
        sys.stderr.write(f"Translation failed: {e}\n")

    return text


def main():
    # Read input from stdin (Claude will provide session context)
    try:
        data = json.loads(sys.stdin.read())
    except Exception:
        data = {}

    context = data.get("context", "")
    messages = data.get("messages", [])

    # Extract the last user prompt (not /save-worklog)
    user_prompt = extract_last_user_prompt(messages)

    # Fallback to explicit user_prompt if provided
    if not user_prompt:
        user_prompt = data.get("user_prompt", "")

    # Generate summary and translate prompt
    summary = condense_to_bullet(context)
    prompt_en = translate_to_english(user_prompt) if user_prompt else ""

    # Format entry
    timestamp = get_timestamp()
    entry = f"- **{timestamp}** — {summary}\n"
    if prompt_en:
        entry += f"  - Prompt used:\n    {repr(prompt_en)}\n"

    # Output JSON with proposed entry for user review
    output = {
        "timestamp": timestamp,
        "summary": summary,
        "prompt_en": prompt_en,
        "full_entry": entry,
        "status": "pending_confirmation"
    }

    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()

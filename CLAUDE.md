# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chrome extension (Manifest V3) called "Dynamic Prompts". Lets users write prompt templates with `{A|B|C}` syntax, generate random realizations, and insert them into supported AI websites.

Inspired by: https://github.com/adieyal/dynamicprompts (Python, reimplemented in JS)

## Development

No build system — loads directly from source. To develop:

1. Open `chrome://extensions/` in Chrome
2. Enable "Developer mode"
3. Click "Load unpacked" and select this directory
4. After editing, click the refresh icon on the extension card

No tests, no linter, no package manager.

## Architecture

**`background.js`** — Minimal service worker. Opens the side panel on toolbar icon click.

**`parser.js`** — Core template engine. `generate(template, wildcards)` resolves `{A|B|C}` variant syntax and `__wildcard__` syntax by iterating from innermost brackets outward, supporting arbitrary nesting. `wildcards` is a `{ name: string[] }` map pre-loaded by `sidepanel.js`.

**`content.js`** — Injected only on `https://grok.com/imagine*`. Listens for `insertPrompt` message and inserts text into the TipTap/ProseMirror editor (`.ProseMirror` contenteditable div) using `execCommand('selectAll')` + `execCommand('insertText')`.

**`sidepanel.html` + `sidepanel.js`** — UI with:
- Template textarea (persisted to `localStorage`)
- Wildcards folder picker (handle persisted to IndexedDB via File System Access API)
- Generate button → loads wildcards, calls `generate()` from `parser.js`
- Result textarea (read-only)
- Insert button → `chrome.tabs.sendMessage` with `{ action: 'insertPrompt', text }`

## Data Flow

User types template → clicks Generate → `sidepanel.js` loads wildcard `.txt` files from selected folder → `parser.js` resolves `{A|B|C}` and `__wildcard__` → result shown → clicks Insert → `sidepanel.js` sends message to active tab → `content.js` inserts into page editor

## Supported Sites

| Site | URL pattern | Editor type |
|------|-------------|-------------|
| Grok Imagine | `https://grok.com/imagine*` | TipTap/ProseMirror (`.ProseMirror`) |

## Key Notes

- `parser.js` must be loaded before `sidepanel.js` in `sidepanel.html` (no modules)
- Grok Imagine uses TipTap — inserting via `execCommand` is required; setting `.textContent` directly does not trigger React state updates. `execCommand` is deprecated but intentionally used here — it's the only approach TipTap picks up correctly
- Template is saved to `localStorage` under key `dp_template`
- Wildcard folder handle is persisted in IndexedDB (db `dynamicprompts`, store `kv`, key `wildcardDir`) using the File System Access API — only names used in the current template are loaded

## Committing to Git
- Use commit messages in the same style as those in the Git history
- Use brief, clear, one line commit messages in English
- Commit messages should be approved manually

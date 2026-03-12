# Dynamic Prompts

Chrome extension that lets you write prompt templates with `{A|B|C}` syntax, generate random realizations, and insert them directly into AI tools.

Inspired by [adieyal/dynamicprompts](https://github.com/adieyal/dynamicprompts) (Python), reimplemented in JavaScript.

## Example

Template:
```
a {red|blue|green} {cat|dog} on a {sunny|rainy} day
```

Possible results: `a blue cat on a sunny day`, `a red dog on a rainy day`, …

Nesting is supported: `{bright {red|orange}|dark {blue|purple}}` works as expected.

## Supported sites

| Site | URL |
|------|-----|
| Grok Imagine | `https://grok.com/imagine` |

## Installation

1. Download or clone this repository
2. Open `chrome://extensions/` in Chrome
3. Enable **Developer mode**
4. Click **Load unpacked** and select the repository folder

## Usage

1. Open the extension side panel by clicking the toolbar icon
2. Type a template into the **Template** field
3. Click **Generate** to see a random realization, or **Generate & Insert** to generate and insert in one step
4. Click **Insert into page** to insert the generated prompt into the active tab

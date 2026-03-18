<img src="icon.png" width="64" align="left" style="margin-right: 16px">

# Dynamic Prompts (Chrome extension)

Chrome extension that lets you write prompt templates with `{A|B|C}` variant syntax, generate random prompts, and insert them directly into online AI tools.

Inspired by [adieyal/dynamicprompts](https://github.com/adieyal/dynamicprompts) (Python), reimplemented in JavaScript.

## Example

Template:
```
a {red|blue|green} {cat|dog} on a {sunny|rainy} day
```

Possible results: `a blue cat on a sunny day`, `a red dog on a rainy day`, …

Nesting is supported: `{bright {red|orange}|dark {blue|purple}}` works as expected.

### Multiple values

Pick multiple values at once with `{N$$...}` or a range `{N-M$$...}`:

```
{2$$red|green|blue}          → "red, green"
{1-3$$red|green|blue}        → 1, 2, or 3 colours joined with ", "
{1-3$$ and $$red|green|blue} → joined with " and " instead
```

Omitting a bound defaults to 1 (lower) or all options (upper):
```
{-2$$red|green|blue}   == {1-2$$red|green|blue}
{1-$$red|green|blue}   == {1-3$$red|green|blue}
```

### Wildcards

Create a `.txt` file with one value per line and reference it as `__filename__`. Wildcard files can themselves contain `{A|B|C}` or `__other_wildcard__` syntax.

```
a __color__ __animal__ on a {sunny|rainy} day
```

## Supported online **AI tools**

| Site | URL |
|------|------|
| Grok Imagine | https://grok.com/imagine |
| Kling AI | https://app.klingai.com/global/video/new?ac=1 |
| Sora | https://sora.chatgpt.com/ |
| Vidu | https://www.vidu.com/create/ |
| Veed | https://www.veed.io/ |
| Artlist Toolkit | https://toolkit.artlist.io/ |
| Deevid | https://deevid.ai/ |


## Installation

1. Download or clone this repository
2. Open `chrome://extensions/` in Chrome
3. Enable **Developer mode**
4. Click **Load unpacked** and select the repository folder

## Usage

1. Open the extension side panel by clicking the toolbar icon
2. Type a template into the **Template** field
3. Optionally select a **Wildcards folder** containing `.txt` files for `__wildcard__` syntax
4. Click **Generate** to see a random prompt, or **Generate & Insert** to generate and insert in one step
5. Click **Insert into page** to insert the generated prompt into the active tab

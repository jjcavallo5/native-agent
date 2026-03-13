---
name: native-agent
description: Interact with a mobile device (Android or iOS) through the native-agent CLI. Use when the user asks you to navigate, tap, type, or interact with a mobile app.
argument-hint: "[task description]"
---

# Native Agent - Mobile Device Interaction

You have access to a mobile device (Android or iOS) through the `native-agent` CLI. Use the commands below to interact with the device. Your goal is to accomplish the user's task by navigating the app visually — taking screenshots, reading UI elements, and performing actions.

**Important:** Most action commands (`click`, `tap`, `text`, `key`, `swipe`, `open`) automatically return a screenshot after the action completes. Use the returned `path` with the Read tool to verify the result without a separate `view` call.

## Available Commands

### `native-agent view`
Takes a screenshot, saves it to `/tmp/native-agent-screenshots/`, and returns metadata including the file path.
- The image is resized to 768px wide.
- Use the `path` from the JSON output with the Read tool to view the screen.
- Optional: `native-agent view -o /path/to/file.png` to save a copy to a custom path.
- **Always start by taking a screenshot** to understand the current state.

### `native-agent click <text>`
Clicks an element by its visible text, hint, or content description.
- Searches by XPath: `@text`, `@hint`, and `@content-desc` attributes.
- Optional: `--index <n>` to click the Nth match (0-indexed) when multiple elements share the same text.
- Returns a screenshot after clicking.

```bash
native-agent click "Sign In"
native-agent click "Item" --index 2
```

### `native-agent text <text> [options]`
Types text into an input field.
- By target: `native-agent text "user@example.com" --target "Email"` — finds the field by its visible text, hint, or content description.
- By focus: `native-agent text "user@example.com" --focused` — types into the currently focused element.
- Either `--target` or `--focused` must be provided.
- Returns a screenshot after typing.

### `native-agent tap -x <x> -y <y>`
Taps at a point on the screen using screenshot pixel coordinates.
- `x` and `y` are pixel coordinates from the screenshot image (which is always 768px wide).
- The server automatically converts screenshot coordinates to device coordinates — no manual conversion needed.
- Returns a screenshot after tapping.

```bash
native-agent tap -x 384 -y 832
```

### `native-agent swipe --startX <x> --startY <y> --endX <x> --endY <y>`
Swipes across the screen using screenshot pixel coordinates.
- All coordinates are pixel positions from the screenshot image (which is always 768px wide).
- The server automatically converts screenshot coordinates to device coordinates — no manual conversion needed.
- Returns a screenshot after swiping.

```bash
# Scroll down (on a 768×1664 screenshot)
native-agent swipe --startX 384 --startY 1165 --endX 384 --endY 499

# Scroll up
native-agent swipe --startX 384 --startY 499 --endX 384 --endY 1165
```

### `native-agent open <appId>`
Launches an app by its bundle/package identifier.
- Returns a screenshot after opening the app.

```bash
native-agent open com.android.settings
native-agent open com.apple.mobilesafari
```

### `native-agent key <key>`
Presses a device key.
- Valid keys: `Enter`, `Back`, `Home`, `Tab`, `Delete`, `Up`, `Down`, `Left`, `Right`, `Space`, `Escape`
- Returns a screenshot after pressing the key.

```bash
native-agent key Enter
native-agent key Back
```

### `native-agent get-size`
Returns the actual device viewport dimensions in pixels.

## Workflow

1. **Always screenshot first** with `native-agent view` to see what's on screen.
2. **Prefer `click` by text** when elements have visible text labels — it's the most reliable.
3. **Use `tap` by coordinates** as a fallback for elements where text matching fails (dropdowns, custom widgets, icons). Use the pixel coordinates directly from the screenshot image — no conversion needed.
4. **Use `swipe`** to scroll when UI elements are off-screen. Use screenshot pixel coordinates, same as `tap`.
5. **Check the returned screenshot** after every action — commands return one automatically.
6. **Chain quick actions** — when you're confident, chain sequential commands with `&&`.

## Tips

- Commands return a screenshot automatically, so you can read the returned `path` to verify the action worked without a separate `view` call.
- Dropdown menus rendered by React Native often have text that doesn't match XPath selectors. When `click` fails on a dropdown option, use `tap` with coordinates instead.
- If `click` fails because the element is not found, try scrolling with `swipe` first — the element may be off-screen.
- The screenshot is always 768px wide. When using `tap` or `swipe`, pass the pixel coordinates from the screenshot directly — the server handles the conversion to device coordinates.
- Use `click` with `--index` when there are multiple elements with the same text (e.g., multiple "Add" buttons in a list).
- Use `text` with `--focused` when a field is already focused but hard to identify by text.
- Use `key Back` to navigate back, `key Home` to go to the home screen, or `key Enter` to submit forms.

## Task

$ARGUMENTS

---
name: native-agent
description: Interact with a mobile device (Android or iOS) through the native-agent server. Use when the user asks you to navigate, tap, type, or interact with a mobile app.
argument-hint: "[task description]"
---

# Native Agent - Mobile Device Interaction

You have access to a mobile device (Android or iOS) through a local server at `http://localhost:8647`. Use the endpoints below to interact with the device. Your goal is to accomplish the user's task by navigating the app visually — taking screenshots, reading UI elements, and performing actions.

**Important:** Most action endpoints (`/click`, `/tap`, `/text`, `/key`, `/swipe`, `/open`) automatically return a screenshot after the action completes. Use this to verify the result without a separate `/view` call.

## Available Endpoints

### `GET /view`
Takes a screenshot, saves it to `/tmp/native-agent-screenshots/`, and returns metadata.
- Response: `{ success: true, path: "/tmp/native-agent-screenshots/screenshot-1234.png", width: 768, height: 1664, format: "png", sizeBytes: 12345 }`
- Optional query param `?output=/path/to/file.png` to save a copy to a custom path.
- The image is resized to 768px wide. Use the `path` from the response with the Read tool to view the screen.
- **Always start by taking a screenshot** to understand the current state.

```bash
curl -s http://localhost:8647/view | python3 -c "import sys,json; print(json.load(sys.stdin)['path'])"
```
Then use the Read tool on the returned path to view it.

### `GET /get-size`
Returns the actual device viewport dimensions in pixels.
- Response: `{ width: 1080, height: 2400 }`
- Use this to understand the device's real resolution for coordinate mapping.

### `POST /click`
Clicks an element by its visible text, hint, or content description.
- Body: `{ "target": "Sign In" }`
- Optional: `{ "target": "Item", "index": 1 }` — click the Nth match (0-indexed) when multiple elements share the same text.
- Searches by XPath: `@text`, `@hint`, and `@content-desc` attributes.
- Returns a screenshot after clicking.

### `POST /text`
Types text into an input field.
- By target: `{ "target": "Email", "text": "user@example.com" }` — finds the field by its visible text, hint, or content description.
- By focus: `{ "focused": true, "text": "user@example.com" }` — types into the currently focused element.
- Either `target` or `focused: true` must be provided.
- Returns a screenshot after typing.

### `POST /tap`
Taps at a point on the screen using screenshot pixel coordinates.
- Body: `{ "x": 384, "y": 832 }`
- `x` and `y` are pixel coordinates from the screenshot image (which is always 768px wide).
- The server automatically converts screenshot coordinates to device coordinates — no manual conversion needed.
- Returns a screenshot after tapping.

### `POST /swipe`
Swipes across the screen using normalized coordinates (0.0 to 1.0).
- Body: `{ "start": { "x": 0.5, "y": 0.7 }, "end": { "x": 0.5, "y": 0.3 } }` — swipes from 70% down to 30% down (scrolls content up).
- All coordinate values must be between 0.0 and 1.0, representing percentages of screen width/height.
- Common patterns:
  - **Scroll down**: `{ "start": { "x": 0.5, "y": 0.7 }, "end": { "x": 0.5, "y": 0.3 } }`
  - **Scroll up**: `{ "start": { "x": 0.5, "y": 0.3 }, "end": { "x": 0.5, "y": 0.7 } }`
- Returns a screenshot after swiping.

### `POST /open`
Launches an app by its bundle/package identifier.
- Body: `{ "appId": "com.example.myapp" }`
- Returns a screenshot after opening the app.

### `POST /key`
Presses a device key.
- Body: `{ "key": "Enter" }`
- Valid keys: `Enter`, `Back`, `Home`, `Tab`, `Delete`, `Up`, `Down`, `Left`, `Right`, `Space`, `Escape`
- Returns a screenshot after pressing the key.

## Workflow

1. **Always screenshot first** with `GET /view` to see what's on screen.
2. **Prefer `/click` by text** when elements have visible text labels — it's the most reliable.
4. **Use `/tap` by coordinates** as a fallback for elements where text matching fails (dropdowns, custom widgets, icons). Use the pixel coordinates directly from the screenshot image — no conversion needed.
5. **Use `/swipe`** to scroll when UI elements are off-screen. Use normalized 0-1 coordinates.
6. **Check the returned screenshot** after every action — most endpoints return one automatically.
7. **Chain quick actions** — when you're confident, chain sequential curl calls with `&&`.

## Tips

- Action endpoints return a screenshot automatically, so you can read the returned `path` to verify the action worked without a separate `/view` call.
- Dropdown menus rendered by React Native often have text that doesn't match XPath selectors. When `/click` fails on a dropdown option, use `/tap` with coordinates instead.
- If `/click` fails because the element is not found, try scrolling with `/swipe` first — the element may be off-screen.
- The screenshot is always 768px wide. When using `/tap`, pass the pixel coordinates from the screenshot directly — the server handles the conversion to device coordinates.
- Use `/click` with `index` when there are multiple elements with the same text (e.g., multiple "Add" buttons in a list).
- Use `/text` with `focused: true` when a field is already focused but hard to identify by text.
- Use `/key` with `Back` to navigate back, `Home` to go to the home screen, or `Enter` to submit forms.

## Task

$ARGUMENTS

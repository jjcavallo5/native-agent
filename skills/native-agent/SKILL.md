---
name: native-agent
description: Interact with an Android device through the Appium server. Use when the user asks you to navigate, tap, type, or interact with an Android app.
argument-hint: "[task description]"
---

# Native Agent - Android Device Interaction

You have access to an Android device through a local Appium server at `http://localhost:8647`. Use the endpoints below to interact with the device. Your goal is to accomplish the user's task by navigating the app visually — taking screenshots, reading UI elements, and performing actions.

## Available Endpoints

### `GET /screenshot`
Takes a screenshot and returns it as base64 PNG.
- Response: `{ success: true, base64: "..." }`
- The image is resized to 768px wide. Save it to a temp file and read it to see the screen.
- **Always start by taking a screenshot** to understand the current state.

```bash
curl -s http://localhost:8647/screenshot | python3 -c "import sys,json; data=json.load(sys.stdin); open('/tmp/screen.png','wb').write(__import__('base64').b64decode(data['base64']))"
```
Then use the Read tool on `/tmp/screen.png` to view it.

### `GET /size`
Returns the actual device window dimensions in pixels.
- Response: `{ success: true, width: 1080, height: 2400 }`
- Use this to calculate coordinate mapping from screenshot to device coordinates.

### `POST /click`
Clicks an element by its visible text. Uses XPath `//*[@text="..."]`.
- Body: `{ "element": "Sign In" }`
- The element must be currently visible on screen.
- Waits up to 5 seconds for the element to appear.

### `POST /type`
Types text into an input field identified by its placeholder/current text.
- Body: `{ "element": "Email", "text": "user@example.com" }`
- Finds the field by its visible text (placeholder or current value) and sets the value.

### `POST /tap`
Taps at exact device coordinates. Use for elements that can't be found by text (e.g., dropdown options, custom widgets).
- Body: `{ "x": 540, "y": 800 }`
- Coordinates are in **device pixels**, not screenshot pixels.
- To convert screenshot coordinates to device coordinates, use the scale factor: `device_width / 768` for x, and `device_height / screenshot_height` for y.
- Call `GET /size` first to get the device dimensions.

### `POST /scroll`
Scrolls the screen up or down.
- Body: `{ "direction": "down" }` or `{ "direction": "up" }`
- Use when you need to see content below or above the current viewport (e.g., to reach a "Next" or "Submit" button).

## Workflow

1. **Always screenshot first** to see what's on screen.
2. **Get device size** early with `GET /size` so you can map tap coordinates.
3. **Prefer `/click` by text** when elements have visible text labels — it's the most reliable.
4. **Use `/tap` by coordinates** as a fallback for dropdown items, custom widgets, or elements where text matching fails. To calculate device coordinates from screenshot pixel positions: `device_x = screenshot_x * (device_width / 768)` and `device_y = screenshot_y * (device_height / screenshot_height)`.
5. **Use `/scroll`** when UI elements (like "Next" or "Continue" buttons) are off-screen.
6. **Screenshot after every action** to verify it worked before proceeding.
7. **Chain quick actions** — when you're confident, you can chain sequential calls (e.g., type email, type password, click Sign In) in one bash command using `&&`.

## Tips

- Dropdown menus rendered by React Native often have text that doesn't match XPath `@text` selectors. When `/click` fails on a dropdown option, use `/tap` with coordinates instead.
- After opening a dropdown, tap quickly — some dropdowns auto-close or require immediate interaction.
- If an action fails with "still not displayed after 5000ms", the element text doesn't match exactly or the element is off-screen. Try scrolling or using `/tap`.
- The screenshot is always 768px wide. The device is typically larger (e.g., 1080px). Always account for this scale difference when using `/tap`.

## Task

$ARGUMENTS

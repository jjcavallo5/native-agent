# native-agent

A CLI tool that gives AI agents the context and control they need to interact with mobile applications. Native Agent provides a unified interface for driving Android and iOS devices — tapping, typing, swiping, taking screenshots, and more — all through simple shell commands backed by Appium.

Built for agentic workflows where an AI (like Claude) needs to see and operate a mobile app, but works just as well for scripting and manual testing.

## Installation

Run the install script to set up everything automatically:

```bash
curl -fsSL https://raw.githubusercontent.com/jjcavallo5/native-agent/main/install.sh | sh
```

This will:

1. Ensure Node.js >= 18 is installed
2. Install the `native-agent` CLI globally via npm
3. Install Appium and the appropriate drivers (UiAutomator2 for Android, XCUITest for iOS on macOS)
4. Verify that platform prerequisites (Android SDK, Xcode, Java) are in place

### Prerequisites

**Android**

- Android SDK with `ANDROID_HOME` set
- At least one AVD (Android Virtual Device) configured
- Java runtime
- ADB

**iOS** (macOS only)

- Xcode with iOS Simulator SDK
- `xcrun simctl` available on PATH

## Quick Start

```bash
# 1. Start a device
native-agent device start -p android

# 2. Start the server (connects Appium to the device)
native-agent server start --platform android

# 3. Take a screenshot to see what's on screen
native-agent view

# 4. Interact with the device
native-agent click "Settings"
native-agent text "hello world" --target "Search"
native-agent key Enter

# 5. When you're done
native-agent server stop
native-agent device stop
```

## CLI Reference

### Server Management

#### `native-agent server start`

Start the native-agent server, which launches Appium and connects to the target device.

| Option                      | Description                      | Default     |
| --------------------------- | -------------------------------- | ----------- |
| `--port <port>`             | Port for the native-agent server | `8647`      |
| `--headless`                | Run in headless mode (no GUI)    | `false`     |
| `--device <id>`             | Target a specific device by ID   | auto-detect |
| `-p, --platform <platform>` | `android` or `ios`               | `android`   |

```bash
native-agent server start --platform ios --port 9000
```

#### `native-agent server stop`

Stop the running native-agent server.

| Option          | Description                   | Default |
| --------------- | ----------------------------- | ------- |
| `--port <port>` | Port the server is running on | `8647`  |

```bash
native-agent server stop
```

---

### Device Management

#### `native-agent device start`

Start an emulator (Android) or simulator (iOS).

| Option                      | Description                   | Default |
| --------------------------- | ----------------------------- | ------- |
| `-p, --platform <platform>` | `android` or `ios` (required) | —       |
| `--headless`                | Launch without a GUI window   | `false` |

```bash
native-agent device start -p android --headless
```

#### `native-agent device stop`

Stop the running emulator or simulator.

```bash
native-agent device stop
```

---

### Device Interaction

#### `native-agent click <element>`

Find an element by its text label and click it.

| Argument / Option | Description                            |
| ----------------- | -------------------------------------- |
| `<element text>`  | Text of the element to click           |
| `--index <n>`     | If multiple matches, click the nth one |

```bash
native-agent click "Sign In"
native-agent click "Item" --index 2
```

#### `native-agent tap`

Tap at a specific point on the screen using screenshot pixel coordinates. Screenshots are always 768px wide — use the pixel position from the screenshot image directly. The server converts to device coordinates automatically.

| Option       | Description                                        |
| ------------ | -------------------------------------------------- |
| `-x <value>` | X pixel coordinate in screenshot (768px wide)      |
| `-y <value>` | Y pixel coordinate in screenshot                   |

```bash
native-agent tap -x 384 -y 832
```

#### `native-agent text <text>`

Type text into an input field.

| Argument / Option      | Description                             |
| ---------------------- | --------------------------------------- |
| `<text>`               | The text to type                        |
| `-t, --target <value>` | Label of the input field to type into   |
| `--focused`            | Type into the currently focused element |

```bash
native-agent text "user@example.com" --target "Email"
native-agent text "password123" --focused
```

#### `native-agent key <key>`

Press a key.

Supported keys: `Enter`, `Back`, `Home`, `Tab`, `Delete`, `Up`, `Down`, `Left`, `Right`, `Space`, `Escape`

```bash
native-agent key Enter
native-agent key Back
```

#### `native-agent swipe`

Swipe across the screen using normalized coordinates (0.0–1.0). Useful for scrolling.

| Option     | Description                  |
| ---------- | ---------------------------- |
| `--startX` | Starting horizontal position |
| `--startY` | Starting vertical position   |
| `--endX`   | Ending horizontal position   |
| `--endY`   | Ending vertical position     |

```bash
# Scroll down
native-agent swipe --startX 0.5 --startY 0.8 --endX 0.5 --endY 0.2

# Scroll right
native-agent swipe --startX 0.2 --startY 0.5 --endX 0.8 --endY 0.5
```

#### `native-agent view`

Take a screenshot of the current device state. The image is resized to 768px wide for efficient consumption by AI agents.

| Option                | Description                      | Default                                         |
| --------------------- | -------------------------------- | ----------------------------------------------- |
| `-o, --output <path>` | Save screenshot to a custom path | `/tmp/native-agent-screenshots/<timestamp>.png` |

```bash
native-agent view
native-agent view -o ./current-state.png
```

#### `native-agent get-size`

Get the device viewport dimensions in pixels.

```bash
native-agent get-size
# Output: { width: 1080, height: 2400 }
```

#### `native-agent open <appId>`

Launch an app by its identifier.

| Argument  | Description                               |
| --------- | ----------------------------------------- |
| `<appId>` | Bundle ID (iOS) or package name (Android) |

```bash
native-agent open com.android.settings
native-agent open com.apple.mobilesafari
```

## Architecture

Native Agent is a monorepo with three packages:

```
native-agent/
├── apps/cli          # CLI entry point (commander.js)
├── packages/server   # Express server + Appium WebDriverIO integration
└── packages/devices  # Platform-specific emulator/simulator management
```

The CLI sends HTTP requests to a local Express server (default port 8647), which translates them into Appium/WebDriverIO commands against the connected device. Appium runs on port 4723.

## Using with AI Agents

Native Agent is designed to be used as a tool by AI agents. The CLI commands are simple and composable, and `native-agent view` returns screenshots that multimodal models can interpret. A typical agent loop looks like:

1. `native-agent view` — see the current screen
2. Decide what to do based on the screenshot
3. Execute an action (`click`, `text`, `swipe`, etc.)
4. Repeat

### Agent Skill

This repo includes a [SKILL.md](./skills/native-agent/SKILL.md) that teaches AI agents how to use the native-agent HTTP API. Install it for your agent of choice:

| Agent | Install command |
| --- | --- |
| **Claude Code** | `/plugin install github:jjcavallo5/native-agent` |
| **Codex** | `$skill-installer github:jjcavallo5/native-agent` |
| **OpenCode** | Automatically discovers skills installed by Claude Code or Codex |

Once installed, start the server (`native-agent server start`) and then ask your agent to interact with the device — the skill provides all the instructions it needs.

## License

[MIT](./LICENSE)

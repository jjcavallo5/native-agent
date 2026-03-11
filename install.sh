#!/bin/sh
# install.sh — Install native-agent CLI, Appium, and native drivers
# Usage: curl -fsSL <url>/install.sh | sh
#        NATIVE_AGENT_VERSION=0.1.0 sh install.sh
set -e

# ---------------------------------------------------------------------------
# Configuration (overridable via env vars)
# ---------------------------------------------------------------------------
NATIVE_AGENT_VERSION="${NATIVE_AGENT_VERSION:-latest}"
APPIUM_VERSION="${APPIUM_VERSION:-latest}"
NODE_MIN_MAJOR=18

# ---------------------------------------------------------------------------
# Colors / helpers
# ---------------------------------------------------------------------------
if [ -t 1 ] && command -v tput >/dev/null 2>&1; then
  BOLD=$(tput bold)
  GREEN=$(tput setaf 2)
  YELLOW=$(tput setaf 3)
  RED=$(tput setaf 1)
  CYAN=$(tput setaf 6)
  RESET=$(tput sgr0)
else
  BOLD="" GREEN="" YELLOW="" RED="" CYAN="" RESET=""
fi

info()    { printf "%s[info]%s  %s\n" "$CYAN"   "$RESET" "$1"; }
success() { printf "%s[ok]%s    %s\n" "$GREEN"  "$RESET" "$1"; }
warn()    { printf "%s[warn]%s  %s\n" "$YELLOW" "$RESET" "$1"; }
error()   { printf "%s[error]%s %s\n" "$RED"    "$RESET" "$1"; }
step()    { printf "\n%s==> %s%s\n"   "$BOLD"   "$1"     "$RESET"; }

bail() { error "$1"; exit 1; }

# ---------------------------------------------------------------------------
# OS / arch detection
# ---------------------------------------------------------------------------
detect_platform() {
  OS="$(uname -s)"
  ARCH="$(uname -m)"

  case "$OS" in
    Darwin) PLATFORM="macos" ;;
    Linux)  PLATFORM="linux" ;;
    *)      bail "Unsupported operating system: $OS" ;;
  esac

  case "$ARCH" in
    x86_64)       ARCH="x64" ;;
    arm64|aarch64) ARCH="arm64" ;;
    *)            bail "Unsupported architecture: $ARCH" ;;
  esac

  info "Detected platform: $PLATFORM ($ARCH)"
}

# ---------------------------------------------------------------------------
# Node.js
# ---------------------------------------------------------------------------
check_node() {
  step "Checking for Node.js >= $NODE_MIN_MAJOR"

  if command -v node >/dev/null 2>&1; then
    NODE_VERSION="$(node -v | sed 's/^v//')"
    NODE_MAJOR="$(printf '%s' "$NODE_VERSION" | cut -d. -f1)"

    if [ "$NODE_MAJOR" -ge "$NODE_MIN_MAJOR" ] 2>/dev/null; then
      success "Node.js v$NODE_VERSION found"
      return 0
    else
      warn "Node.js v$NODE_VERSION found, but >= $NODE_MIN_MAJOR is required"
    fi
  else
    warn "Node.js not found"
  fi

  install_node
}

install_node() {
  info "Attempting to install Node.js..."

  # Prefer nvm/fnm to avoid polluting system-level installs
  if command -v fnm >/dev/null 2>&1; then
    info "Installing Node.js via fnm..."
    fnm install "$NODE_MIN_MAJOR"
    fnm use "$NODE_MIN_MAJOR"
  elif command -v nvm >/dev/null 2>&1 || [ -s "$NVM_DIR/nvm.sh" ]; then
    # nvm is a shell function — source it if not already loaded
    if ! command -v nvm >/dev/null 2>&1; then
      NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
      . "$NVM_DIR/nvm.sh"
    fi
    info "Installing Node.js via nvm..."
    nvm install "$NODE_MIN_MAJOR"
    nvm use "$NODE_MIN_MAJOR"
  elif [ "$PLATFORM" = "macos" ]; then
    if command -v brew >/dev/null 2>&1; then
      info "Installing Node.js via Homebrew..."
      brew install node
    else
      bail "No package manager found (tried fnm, nvm, brew). Install Node.js >= $NODE_MIN_MAJOR manually: https://nodejs.org"
    fi
  elif [ "$PLATFORM" = "linux" ]; then
    if command -v apt-get >/dev/null 2>&1; then
      info "Installing Node.js via apt..."
      need_sudo "install Node.js"
      $SUDO apt-get update -qq
      $SUDO apt-get install -y -qq nodejs npm
    elif command -v dnf >/dev/null 2>&1; then
      info "Installing Node.js via dnf..."
      need_sudo "install Node.js"
      $SUDO dnf install -y nodejs npm
    elif command -v yum >/dev/null 2>&1; then
      info "Installing Node.js via yum..."
      need_sudo "install Node.js"
      $SUDO yum install -y nodejs npm
    else
      bail "No package manager found (tried fnm, nvm, apt, dnf, yum). Install Node.js >= $NODE_MIN_MAJOR manually: https://nodejs.org"
    fi
  fi

  # Verify the install worked
  if ! command -v node >/dev/null 2>&1; then
    bail "Node.js installation failed. Install Node.js >= $NODE_MIN_MAJOR manually: https://nodejs.org"
  fi

  NODE_VERSION="$(node -v | sed 's/^v//')"
  NODE_MAJOR="$(printf '%s' "$NODE_VERSION" | cut -d. -f1)"
  if [ "$NODE_MAJOR" -lt "$NODE_MIN_MAJOR" ] 2>/dev/null; then
    bail "Installed Node.js v$NODE_VERSION but >= $NODE_MIN_MAJOR is required. Install manually: https://nodejs.org"
  fi

  success "Node.js v$NODE_VERSION installed"
}

# ---------------------------------------------------------------------------
# sudo helper
# ---------------------------------------------------------------------------
need_sudo() {
  if [ "$(id -u)" -eq 0 ]; then
    SUDO=""
    return 0
  fi

  if command -v sudo >/dev/null 2>&1; then
    SUDO="sudo"
    info "Requesting sudo to $1"
  else
    bail "Root privileges are required to $1 but sudo is not available"
  fi
}

# ---------------------------------------------------------------------------
# npm global install helper
# ---------------------------------------------------------------------------
npm_install_global() {
  PKG="$1"
  VER="$2"

  if [ "$VER" = "latest" ]; then
    SPEC="$PKG"
  else
    SPEC="$PKG@$VER"
  fi

  # Try without sudo first; fall back to sudo if it fails
  if npm install -g "$SPEC" 2>/dev/null; then
    return 0
  fi

  warn "Global npm install failed without elevated permissions, retrying with sudo..."
  need_sudo "install $PKG globally"
  $SUDO npm install -g "$SPEC"
}

# ---------------------------------------------------------------------------
# native-agent CLI
# ---------------------------------------------------------------------------
install_cli() {
  step "Installing native-agent CLI"

  if command -v native-agent >/dev/null 2>&1; then
    CURRENT="$(native-agent --version 2>/dev/null || echo "unknown")"
    if [ "$NATIVE_AGENT_VERSION" = "latest" ]; then
      info "native-agent v$CURRENT already installed, upgrading to latest..."
    else
      info "native-agent v$CURRENT already installed, installing v$NATIVE_AGENT_VERSION..."
    fi
  fi

  npm_install_global "native-agent" "$NATIVE_AGENT_VERSION"
  success "native-agent $(native-agent --version 2>/dev/null || echo '') installed"
}

# ---------------------------------------------------------------------------
# Appium
# ---------------------------------------------------------------------------
install_appium() {
  step "Installing Appium"

  if command -v appium >/dev/null 2>&1; then
    CURRENT="$(appium --version 2>/dev/null || echo "unknown")"
    info "Appium v$CURRENT already installed, upgrading to latest..."
  fi

  npm_install_global "appium" "$APPIUM_VERSION"
  success "Appium $(appium --version 2>/dev/null || echo '') installed"
}

# ---------------------------------------------------------------------------
# Appium drivers
# ---------------------------------------------------------------------------
install_drivers() {
  step "Installing Appium drivers"

  install_driver "uiautomator2"

  if [ "$PLATFORM" = "macos" ]; then
    install_driver "xcuitest"
  else
    info "Skipping XCUITest driver (macOS only)"
  fi
}

install_driver() {
  DRIVER="$1"

  # Check if already installed
  if appium driver list --installed 2>/dev/null | grep -q "$DRIVER"; then
    success "$DRIVER driver already installed, skipping"
    return 0
  fi

  info "Installing $DRIVER driver..."
  if appium driver install "$DRIVER"; then
    success "$DRIVER driver installed"
  else
    warn "Failed to install $DRIVER driver — you can retry manually: appium driver install $DRIVER"
  fi
}

# ---------------------------------------------------------------------------
# Verification
# ---------------------------------------------------------------------------
verify() {
  step "Verifying installation"
  ERRORS=0

  if command -v native-agent >/dev/null 2>&1; then
    success "native-agent $(native-agent --version 2>/dev/null)"
  else
    error "native-agent not found in PATH"
    ERRORS=$((ERRORS + 1))
  fi

  if command -v appium >/dev/null 2>&1; then
    success "appium $(appium --version 2>/dev/null)"
  else
    error "appium not found in PATH"
    ERRORS=$((ERRORS + 1))
  fi

  if [ "$ERRORS" -gt 0 ]; then
    bail "Verification failed — $ERRORS error(s) above"
  fi
}

# ---------------------------------------------------------------------------
# Platform prerequisites check
# ---------------------------------------------------------------------------
check_prerequisites() {
  step "Checking platform prerequisites"
  WARNINGS=0

  # Android SDK
  if [ -z "$ANDROID_HOME" ] && [ -z "$ANDROID_SDK_ROOT" ]; then
    warn "Android SDK not found (\$ANDROID_HOME / \$ANDROID_SDK_ROOT not set)"
    warn "  Android testing requires the Android SDK: https://developer.android.com/studio"
    WARNINGS=$((WARNINGS + 1))
  else
    success "Android SDK found at ${ANDROID_HOME:-$ANDROID_SDK_ROOT}"
  fi

  # Xcode (macOS only)
  if [ "$PLATFORM" = "macos" ]; then
    if command -v xcodebuild >/dev/null 2>&1; then
      success "Xcode $(xcodebuild -version 2>/dev/null | head -1 || echo 'found')"

      # Check that the iOS Simulator SDK and a matching runtime are installed
      # WebDriverAgent requires both to build and run on simulators
      IOS_SIM_SDK_VER=$(xcodebuild -showsdks 2>/dev/null | grep iphonesimulator | tail -1 | sed 's/.*iphonesimulator//')
      if [ -z "$IOS_SIM_SDK_VER" ]; then
        warn "Xcode iOS Simulator SDK not installed"
        warn "  Install it with: xcodebuild -downloadPlatform iOS"
        warn "  Or in Xcode: Settings > Components > download the iOS platform"
        WARNINGS=$((WARNINGS + 1))
      else
        # Extract major.minor from SDK version (e.g. 26.2 -> 26)
        SDK_MAJOR=$(printf '%s' "$IOS_SIM_SDK_VER" | cut -d. -f1)
        # Check if there's a simulator runtime with a matching major version
        MATCHING_RUNTIME=$(xcrun simctl list runtimes ios available 2>/dev/null | grep "iOS ${SDK_MAJOR}\." || true)
        if [ -n "$MATCHING_RUNTIME" ]; then
          success "Xcode iOS Simulator SDK $IOS_SIM_SDK_VER with matching runtime"
        else
          warn "Xcode iOS Simulator SDK is $IOS_SIM_SDK_VER but no matching iOS $SDK_MAJOR.x simulator runtime is installed"
          warn "  xcodebuild cannot target simulators without a matching runtime."
          warn "  Install the matching runtime with: xcodebuild -downloadPlatform iOS"
          warn "  Or in Xcode: Settings > Components > download the iOS $SDK_MAJOR simulator runtime"
          WARNINGS=$((WARNINGS + 1))
        fi
      fi
    else
      warn "Xcode not found"
      warn "  iOS testing requires Xcode: https://developer.apple.com/xcode/"
      WARNINGS=$((WARNINGS + 1))
    fi
  fi

  # Java (needed by Appium UiAutomator2)
  if command -v java >/dev/null 2>&1; then
    success "Java found"
  else
    warn "Java not found"
    warn "  Android testing via UiAutomator2 requires a JDK: https://adoptium.net"
    WARNINGS=$((WARNINGS + 1))
  fi

  if [ "$WARNINGS" -gt 0 ]; then
    info "$WARNINGS optional prerequisite(s) missing — see warnings above"
  fi
}

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
print_summary() {
  printf "\n"
  printf "%s%s" "$BOLD" "$GREEN"
  printf "  ╔══════════════════════════════════════════╗\n"
  printf "  ║   native-agent installed successfully!   ║\n"
  printf "  ╚══════════════════════════════════════════╝\n"
  printf "%s\n" "$RESET"

  printf "  Get started:\n"
  printf "    %snative-agent --help%s\n" "$CYAN" "$RESET"
  printf "\n"

  if [ "$PLATFORM" = "macos" ]; then
    printf "  Run on iOS:      %snative-agent server --platform ios%s\n"     "$CYAN" "$RESET"
  fi
  printf "  Run on Android:  %snative-agent server --platform android%s\n" "$CYAN" "$RESET"
  printf "\n"
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
main() {
  printf "\n%s%snative-agent installer%s\n" "$BOLD" "$CYAN" "$RESET"
  printf "  CLI + Appium + native drivers\n\n"

  detect_platform
  check_node
  install_cli
  install_appium
  install_drivers
  check_prerequisites
  verify
  print_summary
}

main

#!/usr/bin/env bash
set -euo pipefail

# ------------------------------------------------------------
# Configuration
# ------------------------------------------------------------
APP_NAME="Are You The One"
SCHEME="areyoutheone"          # from app.json
BUNDLE_ID="com.areyoutheone.app"

# Screens to capture (deep‑link paths). Adjust if needed.
SCREENS=(
  "splash"
  "signup"
  "home"
  "discovery"
  "chat"
  "profile"
  "help-support"
  "safety"
)

# Devices (iPhone 13‑17 Pro/Pro Max). Must match names shown by `xcrun simctl list devices`.
DEVICES=(
  "iPhone 13 Pro"
  "iPhone 13 Pro Max"
  "iPhone 14 Pro"
  "iPhone 14 Pro Max"
  "iPhone 15 Pro"
  "iPhone 15 Pro Max"
  "iPhone 16 Pro"
  "iPhone 16 Pro Max"
  "iPhone 17 Pro"
  "iPhone 17 Pro Max"
)

# Output directory
OUT_DIR="$(pwd)/screenshots"
mkdir -p "$OUT_DIR"

# ------------------------------------------------------------
# Helper functions
# ------------------------------------------------------------
function boot_device() {
  local name="$1"
  echo "🔧 Booting $name…"
  # Attempt to boot; if already booted, ignore error
  xcrun simctl boot "$name" || true
  sleep 5
}

function install_and_launch() {
  local device_name="$1"
  echo "📦 Building and installing the app on $device_name…"
  # Expo can target a device by its name using --device
  npx expo run:ios --device "$device_name" --no-dev --minify &> /dev/null
  # Give the app time to launch
  sleep 30
}

function capture_screen() {
  local device_name="$1"
  local screen="$2"
  local filename="${APP_NAME// /}_$(echo $screen | tr -d '-')_${device_name// /}_light.png"
  local path="$OUT_DIR/$filename"
  echo "📸 Capturing $screen on $device_name → $filename"
  xcrun simctl io booted screenshot "$path"
}

function shutdown_device() {
  local name="$1"
  echo "🛑 Shutting down $name"
  xcrun simctl shutdown "$name" || true
}

# ------------------------------------------------------------
# Main workflow
# ------------------------------------------------------------
for device_name in "${DEVICES[@]}"; do
  # Boot the device (or create if missing – will error out if not installed)
  boot_device "$device_name"

  install_and_launch "$device_name"

  # Ensure Light appearance
  xcrun simctl ui booted appearance light

  for screen in "${SCREENS[@]}"; do
    url="${SCHEME}://$screen"
    echo "🔗 Opening $url on $device_name"
    xcrun simctl openurl booted "$url" || true
    sleep 4
    capture_screen "$device_name" "$screen"
  done

  shutdown_device "$device_name"

done

echo "✅ All screenshots saved in $OUT_DIR"

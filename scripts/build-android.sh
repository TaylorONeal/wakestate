#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
# Respect explicit toolchain choices; use an installed Homebrew JDK if macOS has no registered JDK.
if [ -z "${JAVA_HOME:-}" ] && [ -d /opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home ]; then
  export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
fi
if [ -z "${ANDROID_HOME:-}" ] && [ -d "$HOME/Library/Android/sdk" ]; then
  export ANDROID_HOME="$HOME/Library/Android/sdk"
fi
npm run build:native
npx cap sync android
cd android
# Release is unsigned until a publisher-owned upload key is provided. Never substitute the debug key.
./gradlew assembleDebug bundleRelease lintDebug testDebugUnitTest --console=plain "$@"

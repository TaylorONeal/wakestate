#!/usr/bin/env bash
set -euo pipefail
# CI-only: emulator is disposable and contains no personal journal or account.
test "${CI:-}" = true || { echo 'This launcher is limited to disposable CI runners.'; exit 1; }
apk=$(find artifacts/build -name '*-debug.apk' -type f -print -quit)
test -n "$apk" || { echo 'Debug APK artifact is missing'; exit 1; }
serial=$(adb devices | awk '$2 == "device" && $1 ~ /^emulator-/ { print $1; exit }')
test -n "$serial" || { echo 'No disposable emulator found'; exit 1; }
adb -s "$serial" install "$apk"
adb -s "$serial" shell am start -W -n com.wakestate.app/.MainActivity
# Wait for bundled WebView assets to draw; this captures onboarding, not a seeded journal.
sleep 10
python3 scripts/store/capture-android.py --serial "$serial" --shot 00-onboarding
adb -s "$serial" shell dumpsys package com.wakestate.app > artifacts/store/android/package.txt
printf '%s\n' "commit=${GITHUB_SHA:-unknown}" 'state=fresh onboarding; no sample journal imported' > artifacts/store/android/capture-state.txt

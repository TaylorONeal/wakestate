#!/usr/bin/env python3
"""Capture a real Android app screen. Requires an explicitly selected test device."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import struct
import subprocess
from datetime import datetime, timezone


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--serial', required=True, help='Disposable device serial from adb devices')
    parser.add_argument('--shot', required=True, choices=['01-today', '02-check-in', '03-sleep', '04-patterns', '05-export'])
    parser.add_argument('--output', type=Path, default=Path('artifacts/store/android'))
    args = parser.parse_args()
    adb = ['adb', '-s', args.serial]
    if subprocess.check_output(adb + ['get-state'], text=True).strip() != 'device':
        raise SystemExit('Selected device is not available.')
    focus = subprocess.check_output(adb + ['shell', 'dumpsys', 'window'], text=True)
    if not any(re.search(r'(mCurrentFocus|mFocusedApp).*\bcom\.wakestate\.app/', line) for line in focus.splitlines()):
        raise SystemExit('WakeState must be visible in the foreground. No screenshot captured.')
    png = subprocess.check_output(adb + ['exec-out', 'screencap', '-p'])
    if png[:8] != b'\x89PNG\r\n\x1a\n' or png[12:16] != b'IHDR' or len(png) < 24:
        raise SystemExit('Device did not return a valid PNG header.')
    width, height = struct.unpack('>II', png[16:24])
    if not (320 <= width <= 3840 and 320 <= height <= 3840 and max(width, height) <= 2 * min(width, height)):
        raise SystemExit(f'Capture {width}x{height} needs store-dimension review; nothing saved. Use a suitable portrait test device.')
    args.output.mkdir(parents=True, exist_ok=True)
    target = args.output / f'{args.shot}.png'
    metadata = target.with_suffix('.json')
    if target.exists() or metadata.exists():
        raise SystemExit('Capture already exists. Choose another output directory to retain provenance.')
    target.write_bytes(png)
    metadata.write_text(json.dumps({
        'source': 'adb exec-out screencap -p', 'platform': 'Android',
        'package': 'com.wakestate.app', 'shot': args.shot,
        'capturedAt': datetime.now(timezone.utc).isoformat(),
        'width': width, 'height': height, 'sha256': hashlib.sha256(png).hexdigest(),
        'reviewStatus': 'pending: inspect for synthetic data only, clipping, permissions and notifications',
    }, indent=2) + '\n')
    print(f'Saved {target} ({width}x{height}); review before using in a store listing.')


if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""Render existing Android-owned vectors for iOS. Requires CairoSVG and Pillow."""
from io import BytesIO
from pathlib import Path
import xml.etree.ElementTree as ET
import cairosvg
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ANDROID = ROOT / "android/app/src/main/res"
ASSETS = ROOT / "ios/App/App/Assets.xcassets"
NS = "{http://schemas.android.com/apk/res/android}"
vector = ET.parse(ANDROID / "drawable/wakestate_mark.xml").getroot()
background = ET.parse(ANDROID / "values/ic_launcher_background.xml").getroot().find("color").text
svg = ET.Element("svg", xmlns="http://www.w3.org/2000/svg", viewBox="0 0 108 108")
ET.SubElement(svg, "rect", width="108", height="108", fill=background)
for path in vector.findall("path"):
    ET.SubElement(svg, "path", fill=path.get(NS + "fillColor"), d=path.get(NS + "pathData"))
source = ET.tostring(svg)
outputs = [(ASSETS / "AppIcon.appiconset/AppIcon-512@2x.png", 1024)]
outputs += [(ASSETS / "Splash.imageset" / name, size) for name, size in
            [("launch-mark.png", 160), ("launch-mark@2x.png", 320), ("launch-mark@3x.png", 480)]]
for destination, size in outputs:
    png = cairosvg.svg2png(bytestring=source, output_width=size, output_height=size)
    Image.open(BytesIO(png)).convert("RGB").save(destination)
    print(destination.relative_to(ROOT))

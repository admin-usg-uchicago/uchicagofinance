"""Generate og-image.png (1200x630) by pairing the UChicago wordmark with 'USG Allocations'.

Run from repo root:  python3 Frontend/scripts/build_og_image.py
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

PUBLIC = Path(__file__).resolve().parent.parent / "public"
LOGO = PUBLIC / "University Logo_2Color_DarkGreystone_WhiteFill_RGB.png"
OUT = PUBLIC / "og-image.png"

W, H = 1200, 630
MAROON = (128, 0, 0)
BG = (255, 255, 255)

canvas = Image.new("RGB", (W, H), BG)

logo = Image.open(LOGO).convert("RGBA")
target_logo_w = 880
scale = target_logo_w / logo.width
logo_resized = logo.resize((target_logo_w, int(logo.height * scale)), Image.LANCZOS)
logo_x = (W - logo_resized.width) // 2
logo_y = 130
canvas.paste(logo_resized, (logo_x, logo_y), logo_resized)

draw = ImageDraw.Draw(canvas)
title_font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Georgia Bold.ttf", 88)
tag_font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Georgia.ttf", 28)

title = "USG Allocations"
tag = "Funding Transparency  ·  uchicagousg.org"

tb = draw.textbbox((0, 0), title, font=title_font)
tw = tb[2] - tb[0]
draw.text(((W - tw) // 2, 430), title, fill=MAROON, font=title_font)

gb = draw.textbbox((0, 0), tag, font=tag_font)
gw = gb[2] - gb[0]
draw.text(((W - gw) // 2, 545), tag, fill=(110, 110, 110), font=tag_font)

canvas.save(OUT, "PNG", optimize=True)
print(f"wrote {OUT} ({OUT.stat().st_size // 1024} KB)")

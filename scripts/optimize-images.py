#!/usr/bin/env python3
"""Shrink everything in public/ to web-sane dimensions and weight.

Why this exists: the site shipped with 8 photos totalling 14MB — one was
4032px wide and 4MB. Customers open this on a phone, often on mobile data. A
4MB hero photo is the difference between a page that loads and one they back
out of, and no amount of copy fixes that.

Run it after dropping new photos into public/:

    npm run optimize-images

Safe to re-run — anything already within the limits is skipped, so it will
not recompress (and degrade) the same file twice.

Settings were chosen by measuring, not guessing. On the worst source photo
(4032x2268, 4MB): 1600px/q78 -> 441KB, 1920px/q78 -> 616KB. 1600px is ample
for any slot on this page, retina included.
"""

import os
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is required:  python3 -m pip install --user Pillow")

HERE = os.path.dirname(os.path.abspath(__file__))
PUBLIC = os.path.join(os.path.dirname(HERE), "public")

MAX_EDGE = 1600      # plenty for any slot on this page, retina included
QUALITY = 78         # visually indistinguishable from 90+ on photographs
BUDGET_KB = 500      # per-image ceiling; warn above it
KEEP_AS_IS = {"logo.png"}   # small graphic, needs its transparency

PHOTO_EXTS = (".jpg", ".jpeg", ".png")


def kb(path):
    return os.path.getsize(path) // 1024


def main():
    if not os.path.isdir(PUBLIC):
        sys.exit(f"No public/ directory at {PUBLIC}")

    files = sorted(f for f in os.listdir(PUBLIC) if f.lower().endswith(PHOTO_EXTS))
    if not files:
        sys.exit("No images found in public/")

    print(f"Optimising public/  (max {MAX_EDGE}px, quality {QUALITY})\n")

    before_total = after_total = 0
    renamed = []
    over = []

    for name in files:
        path = os.path.join(PUBLIC, name)
        before = os.path.getsize(path)
        before_total += before

        if name in KEEP_AS_IS:
            after_total += before
            print(f"  skip     {name:18} {kb(path):>5}KB  (kept as-is)")
            continue

        im = Image.open(path)
        w, h = im.size
        is_png = name.lower().endswith(".png")

        # Already small enough and already JPEG? Leave it alone — recompressing
        # an optimised file makes it worse, which is exactly what happened when
        # this script first ran over a purpose-built share image.
        if not is_png and max(w, h) <= MAX_EDGE and before <= BUDGET_KB * 1024:
            after_total += before
            print(f"  ok       {name:18} {kb(path):>5}KB  ({w}x{h}) already fine")
            continue

        im = im.convert("RGB")
        im.thumbnail((MAX_EDGE, MAX_EDGE), Image.LANCZOS)

        # A photograph saved as PNG is the most common size mistake there is —
        # PNG cannot compress photographic detail, so a 1264x848 shot lands at
        # 2MB. Re-save as JPEG and drop the original.
        out_name = os.path.splitext(name)[0] + ".jpg" if is_png else name
        out_path = os.path.join(PUBLIC, out_name)

        # save() writes no EXIF unless asked — which also strips the GPS tags
        # phones embed. That matters here: these are photos of customers'
        # houses, and the coordinates of someone's home should not ship inside
        # a marketing image.
        im.save(out_path, "JPEG", quality=QUALITY, optimize=True, progressive=True)

        if is_png:
            os.remove(path)
            renamed.append((name, out_name))

        after = os.path.getsize(out_path)
        after_total += after
        size = after // 1024
        flag = "  ⚠️ " if size > BUDGET_KB else "  ✓  "
        if size > BUDGET_KB:
            over.append(out_name)
        print(f"{flag}    {out_name:18} {size:>5}KB  ({im.size[0]}x{im.size[1]}) "
              f"was {before // 1024}KB")

    print(f"\n  total: {before_total // 1024}KB → {after_total // 1024}KB", end="")
    if before_total:
        print(f"   ({100 * (before_total - after_total) // before_total}% smaller)")
    else:
        print()

    if renamed:
        print("\n  ⚠️  PNG → JPG, update any code referencing these:")
        for old, new in renamed:
            print(f"       {old}  →  {new}")

    if over:
        print(f"\n  ⚠️  Over the {BUDGET_KB}KB budget: {', '.join(over)}")
        print("       Crop tighter, or accept it for a full-bleed hero shot.")


if __name__ == "__main__":
    main()

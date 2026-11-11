#!/usr/bin/env bash
# Rebuild skills/pixel-world/engine/pixelfx.bundle.js from a pixelfx checkout (MIT, https://github.com/patch-gg/pixelfx).
#   bash tools/bundle-pixelfx.sh /path/to/pixelfx [commit]
# Review the pixelfx diff before rebuilding: the bundle runs inside the render page.
set -euo pipefail
SRC=$(cd "$1" && pwd); ROOT=$(cd "$(dirname "$0")/.." && pwd); TMP=$(mktemp -d)
[ -n "${2:-}" ] && git -C "$SRC" checkout -q "$2"
cat > "$TMP/entry.js" <<JS
import { createFx, createFrame, clearFrame, composite } from '$SRC/src/core/index.js';
import * as ALL from '$SRC/src/fx/index.js';
window.PIXELFX = { createFx, createFrame, clearFrame, composite, ALL };
JS
(cd "$TMP" && npm init -y >/dev/null && npm i -s esbuild@0.24.0 && npx esbuild entry.js --bundle --minify --format=iife --outfile=out.js)
OUT="$ROOT/skills/pixel-world/engine/pixelfx.bundle.js"
{ echo "/*! pixelfx ($(git -C "$SRC" rev-parse --short HEAD)) bundled with esbuild. MIT License, Copyright (c) 2026 Patch, Copyright (c) 2026 Hugo Duprez. Parts adapt Sprite Fusion pixel-art VFX (MIT, Hugo Duprez) and Hollow Crown (MIT, rehan-remade). */"; cat "$TMP/out.js"; } > "$OUT"
rm -rf "$TMP"; echo "wrote $OUT"

#!/usr/bin/env sh
# 从 chrono-synth-os 拷贝已编译的 @chrono/* 包到本仓库的 packages/
# 仅拷贝 dist/ + package.json，不拷贝源码或 node_modules
# 提交时 packages/ 应一起提交，以保证 CI 不需要跨仓库访问
set -e

OS_PACKAGES="../chrono-synth-os/packages"

if [ ! -d "$OS_PACKAGES" ]; then
  echo "Error: $OS_PACKAGES not found. Run this from chrono-synth-web/ with chrono-synth-os as sibling." >&2
  exit 1
fi

for pkg in contracts design-tokens sync-engine kernel-testkit; do
  src="$OS_PACKAGES/$pkg"
  dst="packages/$pkg"

  if [ ! -d "$src/dist" ]; then
    echo "Warning: $src/dist not found — run 'npm run build' in chrono-synth-os first." >&2
    continue
  fi

  rm -rf "$dst"
  mkdir -p "$dst"
  cp "$src/package.json" "$dst/package.json"
  cp -r "$src/dist" "$dst/dist"
  echo "  Copied $pkg"
done

echo "Done. Remember to commit packages/ after updating chrono-synth-os."

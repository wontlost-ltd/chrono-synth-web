#!/usr/bin/env sh
# 将 chrono-synth-os 的 packages/ 复制到本仓库，供 file: deps 和 tsconfig paths 使用
set -e

OS_PACKAGES="../chrono-synth-os/packages"

if [ -d "$OS_PACKAGES" ]; then
  echo "Copying @chrono packages from $OS_PACKAGES..."
  rm -rf packages
  cp -r "$OS_PACKAGES" packages
  echo "Done."
else
  echo "Warning: $OS_PACKAGES not found. If packages/ already exists, skipping."
  if [ ! -d "packages" ]; then
    echo "Error: packages/ missing and chrono-synth-os sibling not found." >&2
    exit 1
  fi
fi

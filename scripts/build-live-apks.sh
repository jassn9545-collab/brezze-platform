#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
build_date="$(date +%F)"
output_dir="${1:-$repo_root/deliverables/client-live-renamed-$build_date}"
node "$repo_root/scripts/check-mobile-branding.cjs"
mkdir -p "$output_dir"
output_dir="$(cd -- "$output_dir" && pwd)"

for role in customer provider; do
  app_directory="$(node -p "require(process.argv[1]).apps[process.argv[2]].directory" "$repo_root/mobile-apps.json" "$role")"
  apk_prefix="$(node -p "require(process.argv[1]).apps[process.argv[2]].apkPrefix" "$repo_root/mobile-apps.json" "$role")"
  (
    cd "$repo_root/$app_directory/android"
    ./gradlew :app:assembleStandalone -PreactNativeArchitectures=armeabi-v7a,arm64-v8a --max-workers=2 --build-cache --console=plain
  )
  cp "$repo_root/$app_directory/android/app/build/outputs/apk/standalone/app-standalone.apk" "$output_dir/$apk_prefix-Live-$build_date.apk"
done
cp "$repo_root/mobile-apps.json" "$output_dir/mobile-apps.json"
python3 "$repo_root/scripts/verify-live-apks.py" "$output_dir"
echo "Live standalone APKs: $output_dir"

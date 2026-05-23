#!/usr/bin/env bash
# 从公开网络下载 EPIC-005 测试样例（可重复执行）
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
JPEG_DIR="$ROOT/jpeg"
HEIC_DIR="$ROOT/heic"
BROKEN_DIR="$ROOT/broken"
MISSING_ONLY=false
[[ "${1:-}" == "--missing-only" ]] && MISSING_ONLY=true

mkdir -p "$JPEG_DIR" "$HEIC_DIR" "$BROKEN_DIR"

dl() {
  local url="$1" out="$2"
  if $MISSING_ONLY && [[ -f "$out" && -s "$out" ]]; then
    echo "SKIP (exists) $(basename "$out")"
    return 0
  fi
  if curl -fsSL --connect-timeout 15 --max-time 90 -o "$out" "$url"; then
    echo "OK   $(basename "$out") ($(wc -c < "$out" | tr -d ' ') bytes)"
  else
    echo "FAIL $(basename "$out")"
    rm -f "$out"
    return 1
  fi
}

CDN="https://cdn.jsdelivr.net/gh/ianare/exif-samples@master/jpg"
HEIF="https://cdn.jsdelivr.net/gh/nokiatech/heif@gh-pages/content/images"

echo "=== JPEG (exif-samples via jsDelivr) ==="
dl "$CDN/Canon_40D.jpg"              "$JPEG_DIR/S-JPEG-01_Canon_40D_EXIF.jpg" || true
dl "$CDN/Canon_40D.jpg"              "$JPEG_DIR/S-JPEG-11_Canon_MakerNote.jpg" || true
dl "$CDN/Nikon_D70.jpg"              "$JPEG_DIR/S-JPEG-12_Nikon_MakerNote.jpg" || true
dl "$CDN/Sony_HDR-HC3.jpg"           "$JPEG_DIR/S-JPEG-13_Sony_MakerNote.jpg" || true
dl "$CDN/Olympus_C8080WZ.jpg"        "$JPEG_DIR/S-JPEG-04_Olympus_ICC.jpg" || true
dl "$CDN/Pentax_K10D.jpg"            "$JPEG_DIR/S-JPEG-14_Pentax_MakerNote.jpg" || true
dl "$CDN/Canon_PowerShot_S40.jpg"    "$JPEG_DIR/S-JPEG-05_Photoshop_IPTC.jpg" || true
dl "$CDN/Canon_40D_photoshop_import.jpg" "$JPEG_DIR/S-JPEG-05b_Photoshop_import.jpg" || true
dl "$CDN/Kodak_CX7530.jpg"           "$JPEG_DIR/S-JPEG-03_Kodak_EXIF.jpg" || true
dl "$CDN/Fujifilm_FinePix_E500.jpg"  "$JPEG_DIR/S-JPEG-16_Fujifilm_MakerNote.jpg" || true
dl "$CDN/Panasonic_DMC-FZ30.jpg"     "$JPEG_DIR/S-JPEG-17_Panasonic_MakerNote.jpg" || true
dl "$CDN/long_description.jpg"      "$JPEG_DIR/S-JPEG-15_long_description.jpg" || true
dl "$CDN/corrupted.jpg"              "$JPEG_DIR/S-JPEG-09_corrupted.jpg" || true
dl "$CDN/Ricoh_Caplio_RR330.jpg"      "$JPEG_DIR/S-JPEG-18_Ricoh.jpg" || true
dl "$CDN/Samsung_Digimax_i50_MP3.jpg"  "$JPEG_DIR/S-JPEG-19_Samsung.jpg" || true
dl "https://cdn.jsdelivr.net/gh/mathiasbynens/small@master/jpeg.jpg" \
                                     "$JPEG_DIR/S-JPEG-02_JFIF_small.jpg" || true

echo "=== HEIC (Nokia heif gh-pages) ==="
dl "$HEIF/autumn_1440x960.heic"      "$HEIC_DIR/S-HEIC-01_autumn.heic" || true

echo "=== 合成损坏样例 ==="
if [[ -f "$JPEG_DIR/S-JPEG-01_Canon_40D_EXIF.jpg" ]]; then
  head -c 80000 "$JPEG_DIR/S-JPEG-01_Canon_40D_EXIF.jpg" > "$BROKEN_DIR/S-JPEG-10_truncated.jpg"
  echo "OK   S-JPEG-10_truncated.jpg (synthetic)"
fi

echo "=== 完成 ==="
echo "JPEG: $(find "$JPEG_DIR" -type f | wc -l | tr -d ' ')  HEIC: $(find "$HEIC_DIR" -type f | wc -l | tr -d ' ')  broken: $(find "$BROKEN_DIR" -type f | wc -l | tr -d ' ')"
echo "详见 manifest.md；缺口样例请按 README 手动补全。"

# EPIC-005 测试样例文件

本目录存放 **JPEG / HEIC** 解析器的验收用样例，文件名前缀与 `FEAT-002` / `FEAT-003` 中的 **样例 ID**（`S-JPEG-*`、`S-HEIC-*`）对应。

## 目录结构

```
test-assets/
├── jpeg/           # JPEG 样例
├── heic/           # HEIC/HEIF 样例
├── broken/         # 故意损坏/截断样例
├── manifest.md     # 样例 ID ↔ 文件 ↔ 来源 ↔ 覆盖目录项
├── download-test-assets.sh   # 从网络重新拉取/补全
└── _sources/       # （可选）脚本克隆的上游仓库，已 gitignore
```

## 快速使用

```bash
cd specs/epics/EPIC-005-web-image-parser/test-assets
./download-test-assets.sh          # 下载/补全
# 或仅补全缺失项
./download-test-assets.sh --missing-only
```

## 来源与许可

| 来源 | 许可/说明 | 用途 |
|------|-----------|------|
| [ianare/exif-samples](https://github.com/ianare/exif-samples) | 开源样例集（以仓库为准） | JPEG + EXIF/MakerNote 多厂商 |
| [nokiatech/heif](https://github.com/nokiatech/heif) gh-pages | Nokia HEIF 示范图 | 基础 HEIC 容器 |
| [mathiasbynens/small](https://github.com/mathiasbynens/small) | 极小测试文件 | 最小 JFIF |
| 本仓库 `broken/` | 由完整文件截断生成 | 损坏/截断场景 |

**请勿**将含个人隐私的真实照片提交入库；仅使用公开测试图。

## 当前缺口（需手动或后续脚本补全）

以下场景公开资源较少，建议自行拍摄或从设备导出后放入对应路径，并在 `manifest.md` 登记：

| 样例 ID | 说明 |
|---------|------|
| S-HEIC-03 | Live Photo / 运动影像（图+视频对） |
| S-HEIC-11 | 含**音轨**的视频 HEIC |
| S-HEIC-16 | 人像模式**深度图** |
| S-JPEG-08 | Motion JPEG |
| S-JPEG-06 | MPO 多图对象 |

补全后运行验收时更新 `manifest.md` 的「状态」列。

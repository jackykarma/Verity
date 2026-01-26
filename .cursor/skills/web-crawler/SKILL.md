---
name: web-crawler
description: 从网站爬取文章、音频、图片等内容到本地。支持配置多种网站，内置 BBC 6 Minute English 配置。当用户要求爬取网页内容、下载文章、抓取音频、批量下载网站资源时使用。
---

# Web Crawler Skill

从指定网站爬取内容（文章、音频、图片等）到本地目录。

## 快速开始

### 1. 检查依赖

确保已安装 Python 依赖：

```bash
pip install requests beautifulsoup4 lxml
```

### 2. 执行爬取

运行爬虫脚本：

```bash
python .cursor/skills/web-crawler/scripts/crawler.py --config <配置名> --output <输出目录> [--days <天数>]
```

**参数说明：**
- `--config`: 配置名称（如 `bbc-6-minute`）或配置文件路径
- `--output`: 输出目录路径
- `--days`: 时间范围（天数），默认 30 天
- `--limit`: 最大条目数，默认无限制

## 内置配置

### BBC 6 Minute English

爬取 BBC Learning English 的 6 Minute English 节目文章和音频。

**使用示例：**

```bash
# 爬取过去 30 天的内容到 docs/bbc-6-minutes/
python .cursor/skills/web-crawler/scripts/crawler.py --config bbc-6-minute --output docs/bbc-6-minutes --days 30
```

**爬取内容：**
- 文章标题和发布日期
- 完整文章内容（HTML 转 Markdown）
- 音频文件（MP3）
- 词汇表

**输出结构：**
```
docs/bbc-6-minutes/
├── index.md                    # 目录索引
├── 2024-01-15-topic-title/
│   ├── article.md              # 文章内容
│   ├── audio.mp3               # 音频文件
│   └── vocabulary.md           # 词汇表
└── ...
```

## 创建自定义配置

在 `configs/` 目录下创建 JSON 配置文件：

```json
{
  "name": "site-name",
  "description": "网站描述",
  "base_url": "https://example.com",
  "list_page": {
    "url": "/articles",
    "item_selector": "article.item",
    "title_selector": "h2 a",
    "link_selector": "h2 a",
    "date_selector": ".date",
    "date_format": "%Y-%m-%d"
  },
  "detail_page": {
    "title_selector": "h1",
    "content_selector": ".article-body",
    "audio_selector": "audio source",
    "image_selector": ".featured-image img"
  },
  "download": {
    "audio": true,
    "images": false,
    "delay_seconds": 1
  }
}
```

### 配置字段说明

| 字段 | 说明 |
|------|------|
| `base_url` | 网站根 URL |
| `list_page.url` | 列表页路径 |
| `list_page.item_selector` | 条目容器 CSS 选择器 |
| `list_page.title_selector` | 标题选择器（相对于条目） |
| `list_page.link_selector` | 链接选择器 |
| `list_page.date_selector` | 日期选择器 |
| `list_page.date_format` | 日期解析格式 |
| `detail_page.*_selector` | 详情页各元素选择器 |
| `download.audio` | 是否下载音频 |
| `download.images` | 是否下载图片 |
| `download.delay_seconds` | 请求间隔（秒） |

## 使用流程

```
任务进度：
- [ ] 步骤 1: 确认目标网站和时间范围
- [ ] 步骤 2: 检查/安装依赖
- [ ] 步骤 3: 选择或创建配置
- [ ] 步骤 4: 执行爬取命令
- [ ] 步骤 5: 验证输出结果
```

### 步骤 1: 确认目标

从用户输入中提取：
- 目标网站（使用内置配置或需要新建）
- 时间范围（转换为天数）
- 输出目录

### 步骤 2: 检查依赖

```bash
pip show requests beautifulsoup4 lxml
```

如果缺少依赖，提示用户安装。

### 步骤 3: 选择配置

内置配置列表：
- `bbc-6-minute` - BBC 6 Minute English

如果目标网站没有内置配置，需要：
1. 分析网站结构
2. 创建新的配置文件
3. 保存到 `configs/` 目录

### 步骤 4: 执行爬取

构建并执行命令，监控进度输出。

### 步骤 5: 验证结果

检查输出目录：
- 确认文件已下载
- 检查 index.md 目录文件
- 抽查部分内容完整性

## 注意事项

1. **请求频率**: 默认每次请求间隔 1 秒，避免对目标网站造成压力
2. **网络问题**: 脚本会自动重试失败的请求（最多 3 次）
3. **增量爬取**: 已存在的文件会跳过，支持断点续爬
4. **编码问题**: 自动检测并处理网页编码

## 常见问题

### Q: 爬取失败，提示连接超时？

检查网络连接，或增加超时时间：
```bash
python scripts/crawler.py --config bbc-6-minute --output docs/bbc --timeout 30
```

### Q: 某些内容没有被爬取？

1. 检查网站是否需要登录
2. 检查选择器是否正确
3. 查看日志输出定位问题

### Q: 如何只下载文章不下载音频？

修改配置文件中的 `download.audio` 为 `false`，或使用命令行参数：
```bash
python scripts/crawler.py --config bbc-6-minute --output docs/bbc --no-audio
```

## 相关资源

- 配置文件目录: `.cursor/skills/web-crawler/configs/`
- 爬虫脚本: `.cursor/skills/web-crawler/scripts/crawler.py`

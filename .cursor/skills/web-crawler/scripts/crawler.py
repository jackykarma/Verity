#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Web Crawler - 通用网页内容爬取工具

支持从配置文件定义的网站爬取文章、音频、图片等内容。
"""

import argparse
import json
import os
import re
import sys
import time
from datetime import datetime, timedelta
from pathlib import Path
from urllib.parse import urljoin, urlparse
import html

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("错误: 请先安装依赖")
    print("运行: pip install requests beautifulsoup4 lxml")
    sys.exit(1)

# 脚本所在目录
SCRIPT_DIR = Path(__file__).parent.parent
CONFIGS_DIR = SCRIPT_DIR / "configs"

# 默认请求头
DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}


class WebCrawler:
    """通用网页爬虫"""

    def __init__(self, config: dict, output_dir: str, days: int = 30, 
                 limit: int = None, timeout: int = 30, no_audio: bool = False):
        self.config = config
        self.output_dir = Path(output_dir)
        self.cutoff_date = datetime.now() - timedelta(days=days)
        self.limit = limit
        self.timeout = timeout
        self.no_audio = no_audio
        self.session = requests.Session()
        self.session.headers.update(DEFAULT_HEADERS)
        self.delay = config.get("download", {}).get("delay_seconds", 1)
        
        # 创建输出目录
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # 统计信息
        self.stats = {
            "total": 0,
            "downloaded": 0,
            "skipped": 0,
            "failed": 0
        }

    def fetch(self, url: str, retries: int = 3) -> requests.Response:
        """获取网页内容，支持重试"""
        for attempt in range(retries):
            try:
                response = self.session.get(url, timeout=self.timeout)
                response.raise_for_status()
                return response
            except requests.RequestException as e:
                if attempt < retries - 1:
                    print(f"  重试 ({attempt + 1}/{retries}): {e}")
                    time.sleep(2 ** attempt)
                else:
                    raise

    def parse_date(self, date_str: str, date_format: str = None) -> datetime:
        """解析日期字符串"""
        if not date_str:
            return None
        
        date_str = date_str.strip()
        
        # 尝试指定格式
        if date_format:
            try:
                return datetime.strptime(date_str, date_format)
            except ValueError:
                pass
        
        # 尝试常见格式
        formats = [
            "%Y-%m-%d",
            "%d %B %Y",
            "%d %b %Y",
            "%B %d, %Y",
            "%d/%m/%Y",
            "%Y/%m/%d",
            "%d-%m-%Y",
        ]
        
        for fmt in formats:
            try:
                return datetime.strptime(date_str, fmt)
            except ValueError:
                continue
        
        return None
    
    def extract_date_from_url(self, url: str) -> datetime:
        """从 URL 中提取日期（BBC 6 Minute English 格式: ep-YYMMDD）"""
        if not url:
            return None
        
        # 匹配 BBC 格式: ep-YYMMDD 或 /YYMMDD
        match = re.search(r'(?:ep-|/)(\d{6})(?:/|$)', url)
        if match:
            date_code = match.group(1)
            try:
                year = int("20" + date_code[:2])
                month = int(date_code[2:4])
                day = int(date_code[4:6])
                return datetime(year, month, day)
            except ValueError:
                pass
        
        return None

    def slugify(self, text: str) -> str:
        """将文本转换为 URL 友好的 slug"""
        text = text.lower()
        text = re.sub(r'[^\w\s-]', '', text)
        text = re.sub(r'[-\s]+', '-', text)
        return text.strip('-')[:50]

    def html_to_markdown(self, soup: BeautifulSoup) -> str:
        """将 HTML 转换为 Markdown"""
        if soup is None:
            return ""
        
        # 处理段落
        for p in soup.find_all('p'):
            p.insert_before('\n\n')
            p.insert_after('\n\n')
        
        # 处理标题
        for i in range(1, 7):
            for h in soup.find_all(f'h{i}'):
                h.insert_before(f'\n\n{"#" * i} ')
                h.insert_after('\n\n')
        
        # 处理列表
        for ul in soup.find_all(['ul', 'ol']):
            for li in ul.find_all('li'):
                li.insert_before('\n- ')
        
        # 处理粗体和斜体
        for tag in soup.find_all(['strong', 'b']):
            tag.insert_before('**')
            tag.insert_after('**')
        
        for tag in soup.find_all(['em', 'i']):
            tag.insert_before('*')
            tag.insert_after('*')
        
        # 处理链接
        for a in soup.find_all('a'):
            href = a.get('href', '')
            text = a.get_text()
            if href and text:
                a.replace_with(f'[{text}]({href})')
        
        text = soup.get_text()
        # 清理多余空白
        text = re.sub(r'\n{3,}', '\n\n', text)
        text = re.sub(r' +', ' ', text)
        
        return text.strip()

    def get_list_items(self) -> list:
        """获取列表页的所有条目"""
        items = []
        list_config = self.config["list_page"]
        base_url = self.config["base_url"]
        list_url = urljoin(base_url, list_config["url"])
        
        page = 1
        max_pages = 50  # 防止无限循环
        
        while page <= max_pages:
            # 构建分页 URL
            pagination = list_config.get("pagination", {})
            if pagination.get("type") == "page_param":
                param = pagination.get("param", "page")
                separator = "&" if "?" in list_url else "?"
                url = f"{list_url}{separator}{param}={page}"
            else:
                url = list_url if page == 1 else None
            
            if not url:
                break
            
            print(f"正在获取列表页 {page}: {url}")
            
            try:
                response = self.fetch(url)
                soup = BeautifulSoup(response.content, 'lxml')
            except Exception as e:
                print(f"  获取列表页失败: {e}")
                break
            
            # 查找条目
            item_selector = list_config["item_selector"]
            page_items = soup.select(item_selector)
            
            if not page_items:
                print(f"  未找到更多条目，停止分页")
                break
            
            found_old = False
            for item in page_items:
                # 提取标题
                title_elem = item.select_one(list_config["title_selector"])
                title = title_elem.get_text().strip() if title_elem else "Untitled"
                
                # 提取链接
                link_elem = item.select_one(list_config["link_selector"])
                link = link_elem.get("href") if link_elem else None
                if link:
                    link = urljoin(base_url, link)
                
                # 提取日期
                date_elem = item.select_one(list_config.get("date_selector", ""))
                date_str = None
                if date_elem:
                    # 尝试从属性获取日期
                    date_attr = list_config.get("date_attr")
                    if date_attr:
                        date_str = date_elem.get(date_attr)
                    if not date_str:
                        date_str = date_elem.get_text()
                
                date = self.parse_date(date_str, list_config.get("date_format"))
                
                # 如果没有从页面提取到日期，尝试从 URL 提取
                if not date and link:
                    date = self.extract_date_from_url(link)
                
                # 检查日期范围
                if date and date < self.cutoff_date:
                    found_old = True
                    continue
                
                items.append({
                    "title": title,
                    "link": link,
                    "date": date
                })
                
                # 检查限制
                if self.limit and len(items) >= self.limit:
                    return items
            
            # 如果找到了超出日期范围的条目，停止分页
            if found_old and pagination.get("type") != "page_param":
                break
            
            # 检查是否还有下一页
            if pagination.get("type") != "page_param":
                break
            
            page += 1
            time.sleep(self.delay)
        
        return items

    def download_item(self, item: dict) -> bool:
        """下载单个条目的详细内容"""
        title = item["title"]
        link = item["link"]
        date = item["date"]
        
        if not link:
            print(f"  跳过（无链接）: {title}")
            return False
        
        # 如果没有日期，尝试从 URL 提取
        if not date:
            date = self.extract_date_from_url(link)
        
        # 生成文件夹名
        date_str = date.strftime("%Y-%m-%d") if date else "unknown-date"
        slug = self.slugify(title)
        folder_name = f"{date_str}-{slug}"
        item_dir = self.output_dir / folder_name
        
        # 检查是否已存在
        article_file = item_dir / "article.md"
        if article_file.exists():
            print(f"  跳过（已存在）: {title}")
            self.stats["skipped"] += 1
            return True
        
        print(f"  下载: {title}")
        
        try:
            response = self.fetch(link)
            soup = BeautifulSoup(response.content, 'lxml')
        except Exception as e:
            print(f"    获取详情页失败: {e}")
            self.stats["failed"] += 1
            return False
        
        # 创建目录
        item_dir.mkdir(parents=True, exist_ok=True)
        
        detail_config = self.config["detail_page"]
        
        # 提取标题 - 优先使用列表页标题，详情页标题作为备选
        title_elem = soup.select_one(detail_config.get("title_selector", "h1"))
        page_title = title_elem.get_text().strip() if title_elem else ""
        # 如果详情页标题是通用标题（如 "Learning English"），使用列表页的标题
        generic_titles = ["learning english", "bbc learning english", "6 minute english"]
        if page_title.lower() in generic_titles or not page_title:
            full_title = title
        else:
            full_title = page_title
        
        # 提取正文内容
        content_elem = soup.select_one(detail_config.get("content_selector", "article"))
        content_md = self.html_to_markdown(content_elem) if content_elem else ""
        
        # 提取词汇表
        vocab_elem = soup.select_one(detail_config.get("vocabulary_selector", ""))
        vocab_md = self.html_to_markdown(vocab_elem) if vocab_elem else ""
        
        # 提取音频
        audio_url = None
        if not self.no_audio and self.config.get("download", {}).get("audio", True):
            audio_selectors = detail_config.get("audio_selector", "").split(", ")
            for selector in audio_selectors:
                selector = selector.strip()
                if not selector:
                    continue
                audio_elem = soup.select_one(selector)
                if audio_elem:
                    audio_url = audio_elem.get("src") or audio_elem.get("href")
                    if audio_url:
                        audio_url = urljoin(link, audio_url)
                        break
        
        # 提取 PDF 工作表
        worksheet_url = None
        if self.config.get("download", {}).get("pdf_worksheet", False):
            worksheet_selectors = detail_config.get("pdf_worksheet_selector", "").split(", ")
            for selector in worksheet_selectors:
                selector = selector.strip()
                if not selector:
                    continue
                worksheet_elem = soup.select_one(selector)
                if worksheet_elem:
                    worksheet_url = worksheet_elem.get("href")
                    if worksheet_url:
                        worksheet_url = urljoin(link, worksheet_url)
                        break
        
        # 提取 PDF 转写稿
        transcript_url = None
        if self.config.get("download", {}).get("pdf_transcript", False):
            transcript_selectors = detail_config.get("pdf_transcript_selector", "").split(", ")
            for selector in transcript_selectors:
                selector = selector.strip()
                if not selector:
                    continue
                transcript_elem = soup.select_one(selector)
                if transcript_elem:
                    transcript_url = transcript_elem.get("href")
                    if transcript_url:
                        transcript_url = urljoin(link, transcript_url)
                        break
        
        # 写入文章
        article_content = f"""# {full_title}

**日期**: {date_str}
**来源**: [{link}]({link})

---

{content_md}
"""
        
        with open(article_file, 'w', encoding='utf-8') as f:
            f.write(article_content)
        print(f"    [OK] 文章已保存")
        
        # 写入词汇表
        if vocab_md:
            vocab_file = item_dir / "vocabulary.md"
            with open(vocab_file, 'w', encoding='utf-8') as f:
                f.write(f"# 词汇表 - {full_title}\n\n{vocab_md}")
            print(f"    [OK] 词汇表已保存")
        
        # 下载音频
        if audio_url:
            audio_file = item_dir / "audio.mp3"
            try:
                print(f"    下载音频: {audio_url}")
                audio_response = self.fetch(audio_url)
                with open(audio_file, 'wb') as f:
                    f.write(audio_response.content)
                print(f"    [OK] 音频已保存 ({len(audio_response.content) // 1024} KB)")
            except Exception as e:
                print(f"    [FAIL] 音频下载失败: {e}")
        
        # 下载 PDF 工作表
        if worksheet_url:
            worksheet_file = item_dir / "worksheet.pdf"
            try:
                print(f"    下载工作表: {worksheet_url}")
                worksheet_response = self.fetch(worksheet_url)
                with open(worksheet_file, 'wb') as f:
                    f.write(worksheet_response.content)
                print(f"    [OK] 工作表已保存 ({len(worksheet_response.content) // 1024} KB)")
            except Exception as e:
                print(f"    [FAIL] 工作表下载失败: {e}")
        
        # 下载 PDF 转写稿
        if transcript_url:
            transcript_file = item_dir / "transcript.pdf"
            try:
                print(f"    下载转写稿: {transcript_url}")
                transcript_response = self.fetch(transcript_url)
                with open(transcript_file, 'wb') as f:
                    f.write(transcript_response.content)
                print(f"    [OK] 转写稿已保存 ({len(transcript_response.content) // 1024} KB)")
            except Exception as e:
                print(f"    [FAIL] 转写稿下载失败: {e}")
        
        self.stats["downloaded"] += 1
        return True

    def generate_index(self):
        """生成目录索引文件"""
        index_file = self.output_dir / "index.md"
        
        # 收集所有文章
        articles = []
        for item_dir in sorted(self.output_dir.iterdir(), reverse=True):
            if item_dir.is_dir():
                article_file = item_dir / "article.md"
                if article_file.exists():
                    # 提取标题
                    with open(article_file, 'r', encoding='utf-8') as f:
                        first_line = f.readline().strip()
                        title = first_line.lstrip('# ') if first_line.startswith('#') else item_dir.name
                    
                    has_audio = (item_dir / "audio.mp3").exists()
                    articles.append({
                        "dir": item_dir.name,
                        "title": title,
                        "has_audio": has_audio
                    })
        
        # 生成索引内容
        content = f"""# {self.config.get('name', 'Content')} Archive

> 自动生成于 {datetime.now().strftime('%Y-%m-%d %H:%M')}
> 共 {len(articles)} 篇文章

---

"""
        
        for article in articles:
            audio_badge = " [audio]" if article["has_audio"] else ""
            content += f"- [{article['title']}]({article['dir']}/article.md){audio_badge}\n"
        
        with open(index_file, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"\n[OK] 索引已生成: {index_file}")

    def run(self):
        """执行爬取"""
        print(f"\n{'='*60}")
        print(f"Web Crawler - {self.config.get('name', 'Unknown')}")
        print(f"{'='*60}")
        print(f"输出目录: {self.output_dir}")
        print(f"时间范围: {self.cutoff_date.strftime('%Y-%m-%d')} 至今")
        if self.limit:
            print(f"最大条目: {self.limit}")
        print(f"{'='*60}\n")
        
        # 获取列表
        print("步骤 1/3: 获取文章列表...")
        items = self.get_list_items()
        self.stats["total"] = len(items)
        
        if not items:
            print("未找到符合条件的文章")
            return
        
        print(f"\n找到 {len(items)} 篇文章\n")
        
        # 下载每个条目
        print("步骤 2/3: 下载内容...")
        for i, item in enumerate(items, 1):
            print(f"\n[{i}/{len(items)}] {item['title']}")
            self.download_item(item)
            time.sleep(self.delay)
        
        # 生成索引
        print("\n步骤 3/3: 生成索引...")
        self.generate_index()
        
        # 打印统计
        print(f"\n{'='*60}")
        print("爬取完成!")
        print(f"  总计: {self.stats['total']}")
        print(f"  下载: {self.stats['downloaded']}")
        print(f"  跳过: {self.stats['skipped']}")
        print(f"  失败: {self.stats['failed']}")
        print(f"{'='*60}")


def load_config(config_name: str) -> dict:
    """加载配置文件"""
    # 如果是路径，直接加载
    if os.path.exists(config_name):
        with open(config_name, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    # 否则从 configs 目录查找
    config_file = CONFIGS_DIR / f"{config_name}.json"
    if config_file.exists():
        with open(config_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    raise FileNotFoundError(f"配置文件未找到: {config_name}")


def main():
    parser = argparse.ArgumentParser(
        description="Web Crawler - 通用网页内容爬取工具",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  # 爬取 BBC 6 Minute English 过去 30 天的内容
  python crawler.py --config bbc-6-minute --output docs/bbc-6-minutes

  # 爬取过去 7 天，最多 10 篇
  python crawler.py --config bbc-6-minute --output docs/bbc --days 7 --limit 10

  # 使用自定义配置文件
  python crawler.py --config /path/to/config.json --output docs/output
        """
    )
    
    parser.add_argument(
        "--config", "-c",
        required=True,
        help="配置名称（如 bbc-6-minute）或配置文件路径"
    )
    
    parser.add_argument(
        "--output", "-o",
        required=True,
        help="输出目录路径"
    )
    
    parser.add_argument(
        "--days", "-d",
        type=int,
        default=30,
        help="时间范围（天数），默认 30"
    )
    
    parser.add_argument(
        "--limit", "-l",
        type=int,
        default=None,
        help="最大条目数，默认无限制"
    )
    
    parser.add_argument(
        "--timeout", "-t",
        type=int,
        default=30,
        help="请求超时时间（秒），默认 30"
    )
    
    parser.add_argument(
        "--no-audio",
        action="store_true",
        help="不下载音频文件"
    )
    
    args = parser.parse_args()
    
    try:
        config = load_config(args.config)
    except FileNotFoundError as e:
        print(f"错误: {e}")
        print(f"\n可用配置:")
        for f in CONFIGS_DIR.glob("*.json"):
            print(f"  - {f.stem}")
        sys.exit(1)
    
    crawler = WebCrawler(
        config=config,
        output_dir=args.output,
        days=args.days,
        limit=args.limit,
        timeout=args.timeout,
        no_audio=args.no_audio
    )
    
    crawler.run()


if __name__ == "__main__":
    main()

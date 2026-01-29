#!/usr/bin/env python3
"""
Mermaid 图表导出工具
从 Markdown 文件中提取 Mermaid 图表并导出为 PNG 图片
"""

import re
import os
import sys
import argparse
import subprocess
import tempfile
from pathlib import Path
from typing import List, Tuple, Optional


class MermaidExporter:
    """Mermaid 图表导出器"""

    def __init__(self, width: int = 1920, height: int = 1080, 
                 theme: str = 'default', background: str = 'white', scale: int = 1):
        self.width = width
        self.height = height
        self.theme = theme
        self.background = background
        self.scale = scale
        self._check_mermaid_cli()

    def _check_mermaid_cli(self):
        """检查 Mermaid CLI 是否安装"""
        # 在 Windows 下使用 mmdc.cmd
        mmdc_cmd = 'mmdc.cmd' if sys.platform == 'win32' else 'mmdc'
        self.mmdc_cmd = mmdc_cmd
        
        try:
            result = subprocess.run([mmdc_cmd, '--version'], 
                                    capture_output=True, text=True, check=True, shell=True)
            print(f"✓ Mermaid CLI 已安装: {result.stdout.strip()}")
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("✗ 错误: 未找到 Mermaid CLI (mmdc)")
            print("\n请执行以下命令安装:")
            print("  npm install -g @mermaid-js/mermaid-cli")
            sys.exit(1)

    def extract_mermaid_blocks(self, markdown_content: str) -> List[Tuple[str, str]]:
        """
        从 Markdown 内容中提取 Mermaid 代码块
        
        返回: [(图表名称, Mermaid代码), ...]
        """
        # 匹配 ```mermaid ... ``` 代码块
        pattern = r'```mermaid\s*\n(.*?)```'
        matches = re.finditer(pattern, markdown_content, re.DOTALL)
        
        blocks = []
        lines = markdown_content.split('\n')
        
        for idx, match in enumerate(matches, 1):
            mermaid_code = match.group(1).strip()
            
            # 尝试从 Mermaid 代码中提取标题
            title = self._extract_title_from_code(mermaid_code)
            
            # 如果没有标题，尝试从前面的 Markdown 标题中提取
            if not title:
                title = self._extract_title_from_context(markdown_content, match.start())
            
            # 如果还是没有标题，使用默认编号
            if not title:
                title = f"mermaid-图表-{idx}"
            
            blocks.append((title, mermaid_code))
        
        return blocks

    def _extract_title_from_code(self, mermaid_code: str) -> Optional[str]:
        """从 Mermaid 代码中提取标题"""
        # 尝试匹配 %%{title: "标题"}%%
        title_pattern = r'%%\{[^}]*title:\s*["\']([^"\']+)["\']\s*[^}]*\}%%'
        match = re.search(title_pattern, mermaid_code)
        if match:
            return match.group(1).strip()
        return None

    def _extract_title_from_context(self, content: str, code_block_pos: int) -> Optional[str]:
        """从代码块前面的上下文中提取标题"""
        # 获取代码块前面的内容
        before_content = content[:code_block_pos]
        lines = before_content.split('\n')
        
        # 从后往前查找标题（#, ##, ### 等）
        for line in reversed(lines[-10:]):  # 只检查前10行
            line = line.strip()
            if line.startswith('#'):
                # 移除 # 符号，提取标题
                title = re.sub(r'^#+\s*', '', line).strip()
                if title:
                    return title
        
        return None

    def export_to_png(self, mermaid_code: str, output_path: str) -> bool:
        """
        将 Mermaid 代码导出为 PNG 图片
        
        Args:
            mermaid_code: Mermaid 图表代码
            output_path: 输出 PNG 文件路径
        
        Returns:
            是否成功
        """
        # 创建临时文件保存 Mermaid 代码
        with tempfile.NamedTemporaryFile(mode='w', suffix='.mmd', 
                                          delete=False, encoding='utf-8') as tmp_file:
            tmp_file.write(mermaid_code)
            tmp_file_path = tmp_file.name

        try:
            # 构建 mmdc 命令
            cmd = [
                self.mmdc_cmd,
                '-i', tmp_file_path,
                '-o', output_path,
                '-w', str(self.width),
                '-H', str(self.height),
                '-t', self.theme,
                '-b', self.background,
                '-s', str(self.scale)
            ]
            
            # 执行命令
            result = subprocess.run(cmd, capture_output=True, text=True, shell=True)
            
            if result.returncode == 0:
                return True
            else:
                print(f"  ✗ 导出失败: {result.stderr}")
                return False
                
        except Exception as e:
            print(f"  ✗ 导出异常: {str(e)}")
            return False
        finally:
            # 清理临时文件
            try:
                os.unlink(tmp_file_path)
            except:
                pass

    def process_file(self, markdown_path: str, output_dir: Optional[str] = None) -> int:
        """
        处理单个 Markdown 文件
        
        Args:
            markdown_path: Markdown 文件路径
            output_dir: 输出目录（None 表示与 Markdown 同级）
        
        Returns:
            成功导出的图表数量
        """
        markdown_path = Path(markdown_path)
        
        if not markdown_path.exists():
            print(f"✗ 文件不存在: {markdown_path}")
            return 0
        
        # 读取 Markdown 内容
        try:
            with open(markdown_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f"✗ 读取文件失败: {e}")
            return 0
        
        # 提取 Mermaid 代码块
        blocks = self.extract_mermaid_blocks(content)
        
        if not blocks:
            print(f"✓ {markdown_path.name}: 未找到 Mermaid 图表")
            return 0
        
        print(f"\n处理文件: {markdown_path}")
        print(f"找到 {len(blocks)} 个 Mermaid 图表\n")
        
        # 确定输出目录
        if output_dir:
            output_path = Path(output_dir)
        else:
            # 在 Markdown 文件同级目录下创建子目录
            # 使用文件名（不含扩展名）作为子目录名
            subdir_name = markdown_path.stem + '-images'
            output_path = markdown_path.parent / subdir_name
        
        output_path.mkdir(parents=True, exist_ok=True)
        print(f"输出目录: {output_path}\n")
        
        # 导出每个图表
        success_count = 0
        for title, code in blocks:
            # 清理文件名（移除非法字符）
            safe_title = re.sub(r'[<>:"/\\|?*]', '-', title)
            png_path = output_path / f"{safe_title}.png"
            
            print(f"导出: {safe_title}.png ... ", end='', flush=True)
            
            if self.export_to_png(code, str(png_path)):
                print("✓")
                success_count += 1
            else:
                print("✗")
        
        print(f"\n完成! {success_count}/{len(blocks)} 个图表已保存到: {output_path}")
        return success_count

    def process_directory(self, dir_path: str, recursive: bool = False, 
                          output_dir: Optional[str] = None) -> int:
        """
        处理目录下的所有 Markdown 文件
        
        Args:
            dir_path: 目录路径
            recursive: 是否递归处理子目录
            output_dir: 输出目录
        
        Returns:
            成功导出的图表总数
        """
        dir_path = Path(dir_path)
        
        if not dir_path.is_dir():
            print(f"✗ 不是有效的目录: {dir_path}")
            return 0
        
        # 查找所有 Markdown 文件
        pattern = '**/*.md' if recursive else '*.md'
        md_files = list(dir_path.glob(pattern))
        
        if not md_files:
            print(f"✓ 目录中未找到 Markdown 文件: {dir_path}")
            return 0
        
        print(f"找到 {len(md_files)} 个 Markdown 文件")
        
        total_count = 0
        for md_file in md_files:
            count = self.process_file(str(md_file), output_dir)
            total_count += count
        
        print(f"\n总计导出 {total_count} 个图表")
        return total_count


def main():
    """命令行入口"""
    parser = argparse.ArgumentParser(
        description='从 Markdown 文件中导出 Mermaid 图表为 PNG 图片',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  # 导出单个文件
  python export_mermaid.py design.md
  
  # 导出到指定目录
  python export_mermaid.py design.md --output-dir ./images/
  
  # 递归处理整个目录
  python export_mermaid.py ./docs/ --recursive
  
  # 自定义图片大小和主题
  python export_mermaid.py design.md --width 2560 --height 1440 --theme dark
        """
    )
    
    parser.add_argument('path', help='Markdown 文件或目录路径')
    parser.add_argument('--output-dir', '-o', help='输出目录（默认：Markdown 文件同级目录）')
    parser.add_argument('--width', '-w', type=int, default=1920, help='图片宽度（默认：1920）')
    parser.add_argument('--height', '-H', type=int, default=1080, help='图片高度（默认：1080）')
    parser.add_argument('--theme', '-t', default='default', 
                        choices=['default', 'dark', 'forest', 'neutral'],
                        help='Mermaid 主题（默认：default）')
    parser.add_argument('--background', '-b', default='white', help='背景颜色（默认：white）')
    parser.add_argument('--scale', '-s', type=int, default=1, help='缩放比例（默认：1）')
    parser.add_argument('--recursive', '-r', action='store_true', help='递归处理子目录')
    
    args = parser.parse_args()
    
    # 创建导出器
    exporter = MermaidExporter(
        width=args.width,
        height=args.height,
        theme=args.theme,
        background=args.background,
        scale=args.scale
    )
    
    # 处理路径
    path = Path(args.path)
    
    if path.is_file():
        exporter.process_file(str(path), args.output_dir)
    elif path.is_dir():
        exporter.process_directory(str(path), args.recursive, args.output_dir)
    else:
        print(f"✗ 无效的路径: {path}")
        sys.exit(1)


if __name__ == '__main__':
    main()

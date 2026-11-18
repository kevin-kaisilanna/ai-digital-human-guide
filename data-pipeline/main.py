"""数据导入 CLI 入口 —— 解析参考数据 → JSON"""

import json
import sys
from pathlib import Path

# 项目根目录
ROOT = Path(__file__).resolve().parent.parent

# 参考数据目录
REF_DIR = ROOT / "示范景区公开资料包"

# 输出目录
OUT_DIR = ROOT / "src" / "data"


def main():
    print("=" * 50)
    print("景区导览 AI 数字人 — 数据导入流水线")
    print("=" * 50)

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    # 导入解析器
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    from parsers.word_parser import parse_docx
    from parsers.excel_parser import parse_xlsx, get_summary

    # ─── 文件 1: 灵山胜境：历史、文化、景点特色与个性化游览指南 ───
    guide_file = REF_DIR / "灵山胜境：历史、文化、景点特色与个性化游览指南.docx"
    if guide_file.exists():
        print(f"\n📄 解析: {guide_file.name}")
        entries = parse_docx(str(guide_file))
        print(f"   → 提取 {len(entries)} 条知识段落")
        _save_json(OUT_DIR / "knowledge-guide.json", entries)
    else:
        print(f"⚠️  文件不存在: {guide_file}")

    # ─── 文件 2: 灵山胜境 景点结构化数据集 ───
    dataset_file = REF_DIR / "灵山胜境 景点结构化数据集.docx"
    if dataset_file.exists():
        print(f"\n📄 解析: {dataset_file.name}")
        entries = parse_docx(str(dataset_file))
        print(f"   → 提取 {len(entries)} 条景点结构化数据")
        _save_json(OUT_DIR / "knowledge-spots.json", entries)
    else:
        print(f"⚠️  文件不存在: {dataset_file}")

    # ─── 文件 3: 景点景区旅游数据行为分析数据 ───
    excel_file = REF_DIR / "景点景区旅游数据行为分析数据.xlsx"
    if excel_file.exists():
        print(f"\n📊 解析: {excel_file.name} (大文件，仅读取摘要)")
        # 先拿摘要
        summary = get_summary(str(excel_file))
        _save_json(OUT_DIR / "visitor-analytics-summary.json", summary)

        for sheet_name, info in summary["sheets"].items():
            print(f"   Sheet [{sheet_name}]: {info['total_rows']} 行, {len(info['headers'])} 列")
            print(f"   列名: {', '.join(info['headers'][:8])}...")
    else:
        print(f"⚠️  文件不存在: {excel_file}")

    print(f"\n✅ 完成！输出目录: {OUT_DIR}")
    _list_output(OUT_DIR)


def _save_json(filepath: Path, data):
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    size_kb = filepath.stat().st_size / 1024
    print(f"   → 已保存: {filepath.name} ({size_kb:.1f} KB)")


def _list_output(out_dir: Path):
    print()
    for f in sorted(out_dir.iterdir()):
        if f.suffix == ".json":
            size_kb = f.stat().st_size / 1024
            print(f"  📁 {f.name} ({size_kb:.1f} KB)")


if __name__ == "__main__":
    main()

"""Excel (.xlsx) 解析器 —— 提取表格数据"""

from pathlib import Path
from openpyxl import load_workbook


def parse_xlsx(filepath: str, max_rows: int | None = None) -> list[dict]:
    """
    解析 Excel 文件，第一行作为列名。
    返回: [{col_name: cell_value}]
    """
    wb = load_workbook(filepath, read_only=True, data_only=True)
    results = []

    for sheet_name in wb.sheetnames:
        ws = wb[sheet_name]
        rows_iter = ws.iter_rows(values_only=True)

        # 第一行作为列名
        try:
            headers = [str(h).strip() if h else f"col_{i}" for i, h in enumerate(next(rows_iter))]
        except StopIteration:
            continue

        for row in rows_iter:
            if all(v is None for v in row):
                continue
            record = {}
            for i, value in enumerate(row):
                if i < len(headers):
                    record[headers[i]] = str(value) if value is not None else ""
            results.append(record)

            if max_rows and len(results) >= max_rows:
                break

        if max_rows and len(results) >= max_rows:
            break

    wb.close()
    return results


def get_summary(filepath: str) -> dict:
    """获取 Excel 文件摘要（列名 + 行数 + 样本）"""
    wb = load_workbook(filepath, read_only=True, data_only=True)

    sheets_info = {}
    for sheet_name in wb.sheetnames:
        ws = wb[sheet_name]
        rows_iter = ws.iter_rows(values_only=True)

        try:
            headers = [str(h).strip() if h else f"col_{i}" for i, h in enumerate(next(rows_iter))]
        except StopIteration:
            sheets_info[sheet_name] = {"headers": [], "sample_rows": [], "total_rows": 0}
            continue

        samples = []
        count = 0
        for row in rows_iter:
            if all(v is None for v in row):
                continue
            count += 1
            if len(samples) < 5:
                samples.append({headers[i]: str(v) if v is not None else "" for i, v in enumerate(row) if i < len(headers)})

        sheets_info[sheet_name] = {
            "headers": headers,
            "sample_rows": samples,
            "total_rows": count,
        }

    wb.close()
    return {
        "filename": Path(filepath).name,
        "sheets": sheets_info,
    }

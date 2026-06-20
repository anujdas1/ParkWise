#!/usr/bin/env python
"""
load_model_data.py – Imports pre‑computed model output files into MongoDB.

Usage:
  python -m backend.load_model_data

The script reads CSV, JSON and HTML files from the model_outputs directories
and inserts them into dedicated collections. It uses the same DB connection
logic from `backend.db`.
"""
import os
import csv
import json
from pathlib import Path
from typing import List, Dict

from backend.db import client, DB_NAME

# Base directory where the model output files live
BASE_DIR = Path(__file__).parent / "model_outputs"

def _read_csv(file_path: Path) -> List[Dict]:
    with file_path.open("r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        rows = []
        for row in reader:
            cleaned = {}
            for k, v in row.items():
                key = k.strip()
                try:
                    cleaned[key] = float(v)
                except (ValueError, TypeError):
                    cleaned[key] = v.strip() if v else v
            rows.append(cleaned)
        return rows

def _read_json(file_path: Path) -> Dict:
    with file_path.open("r", encoding="utf-8") as f:
        return json.load(f)

def _read_html(file_path: Path) -> str:
    return file_path.read_text(encoding="utf-8")

def _insert_collection(collection_name: str, documents):
    db = client[DB_NAME]
    coll = db[collection_name]
    if isinstance(documents, list):
        if documents:
            coll.delete_many({})  # clear old data
            coll.insert_many(documents)
    else:
        coll.delete_many({})
        coll.insert_one({"content": documents})
    print(f"[load_model_data] Inserted into {collection_name} – {len(documents) if isinstance(documents, list) else 1} record(s)")

def main():
    # Hotspot prediction outputs
    hotspot_dir = BASE_DIR / "Hotspot prediction"
    _insert_collection("forecast", _read_csv(hotspot_dir / "forecast_72h_full (1).csv"))
    _insert_collection("top_hotspots", _read_csv(hotspot_dir / "top_hotspots_next_72h (1).csv"))
    _insert_collection("patrol_priority", _read_csv(hotspot_dir / "patrol_priority_by_shift (1).csv"))
    _insert_collection("model_report", _read_json(hotspot_dir / "model_evaluation_report (1).json"))

    # Congestion model outputs
    congestion_dir = BASE_DIR / "congestion model"
    _insert_collection("congestion_heatmap", _read_html(congestion_dir / "eis_heatmap.html"))
    _insert_collection("congestion_zone_summary", _read_csv(congestion_dir / "zone_eis_summary.csv"))
    _insert_collection("congestion_top_hotspots", _read_html(congestion_dir / "top20_hotspots_detailed.html"))

if __name__ == "__main__":
    main()

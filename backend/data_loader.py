"""
ParkWise Data Loader
====================
Bulk-import violation records from a CSV file into the MongoDB 'violations'
collection.  Supports:
    • Automatic date parsing for datetime columns
    • Duplicate detection (skips rows whose `id` already exists)
    • Batch insertion for performance
    • Dry-run mode (--dry-run) to preview without writing

Usage
-----
    python -m backend.data_loader path/to/violations.csv
    python -m backend.data_loader path/to/violations.csv --dry-run
    python -m backend.data_loader path/to/violations.csv --batch-size 500
"""

import argparse
import csv
import sys
from datetime import datetime
from typing import Any, Dict, List, Optional

from backend.db import get_collection

# ---- Column schema (matches the user's dataset) ----
EXPECTED_COLUMNS = [
    "id", "latitude", "longitude", "location", "vehicle_number",
    "vehicle_type", "description", "violation_type", "offence_code",
    "created_datetime", "closed_datetime", "modified_datetime",
    "device_id", "created_by_id", "center_code", "police_station",
    "data_sent_to_scita", "junction_name", "action_taken_timestamp",
    "data_sent_to_scita_timestamp", "updated_vehicle_number",
    "updated_vehicle_type", "validation_status", "validation_timestamp",
]

# Columns that should be parsed as datetime objects
DATETIME_COLUMNS = {
    "created_datetime", "closed_datetime", "modified_datetime",
    "action_taken_timestamp", "data_sent_to_scita_timestamp",
    "validation_timestamp",
}

# Columns that should be parsed as floats
FLOAT_COLUMNS = {"latitude", "longitude"}


# ---- Helpers ----

def _parse_datetime(value: str) -> Optional[datetime]:
    """Try common datetime formats and return a datetime or None."""
    if not value or value.strip() == "":
        return None
    for fmt in (
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%d %H:%M:%S.%f",
        "%Y-%m-%dT%H:%M:%S.%f",
        "%d-%m-%Y %H:%M:%S",
        "%d/%m/%Y %H:%M:%S",
        "%m/%d/%Y %H:%M:%S",
        "%Y-%m-%d",
    ):
        try:
            return datetime.strptime(value.strip(), fmt)
        except ValueError:
            continue
    # Return the raw string if we can't parse it
    return value.strip()


def _parse_float(value: str) -> Optional[float]:
    """Convert to float, returning None for empty/invalid values."""
    if not value or value.strip() == "":
        return None
    try:
        return float(value.strip())
    except ValueError:
        return None


def _clean_row(row: Dict[str, str]) -> Dict[str, Any]:
    """Convert raw CSV row strings into typed values."""
    cleaned: Dict[str, Any] = {}
    for key, value in row.items():
        key = key.strip().lower()
        if key in DATETIME_COLUMNS:
            cleaned[key] = _parse_datetime(value)
        elif key in FLOAT_COLUMNS:
            cleaned[key] = _parse_float(value)
        else:
            cleaned[key] = value.strip() if value else None
    return cleaned


def _get_existing_ids(collection) -> set:
    """Fetch the set of 'id' values already in the collection."""
    cursor = collection.find({}, {"id": 1, "_id": 0})
    return {doc["id"] for doc in cursor if "id" in doc}


# ---- Main loader ----

def load_csv(
    filepath: str,
    batch_size: int = 200,
    dry_run: bool = False,
) -> Dict[str, int]:
    """
    Read *filepath* and insert rows into MongoDB.

    Returns a summary dict: {inserted, skipped, errors, total}.
    """
    collection = get_collection()
    existing_ids = _get_existing_ids(collection)

    stats = {"inserted": 0, "skipped": 0, "errors": 0, "total": 0}
    batch: List[Dict[str, Any]] = []

    with open(filepath, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)

        # Validate header
        if reader.fieldnames:
            header = [h.strip().lower() for h in reader.fieldnames]
            missing = set(EXPECTED_COLUMNS) - set(header)
            if missing:
                print(f"⚠  Warning: CSV is missing columns: {missing}")
                print(f"   Found columns: {header}")

        for row_num, raw_row in enumerate(reader, start=2):  # row 1 = header
            stats["total"] += 1
            try:
                record = _clean_row(raw_row)

                # Skip duplicates
                record_id = record.get("id")
                if record_id and record_id in existing_ids:
                    stats["skipped"] += 1
                    continue

                batch.append(record)

                # Flush batch
                if len(batch) >= batch_size:
                    if not dry_run:
                        collection.insert_many(batch, ordered=False)
                    stats["inserted"] += len(batch)
                    print(f"   ✓ Inserted batch ({stats['inserted']} so far)")
                    batch = []

            except Exception as exc:
                stats["errors"] += 1
                print(f"   ✗ Row {row_num}: {exc}")

        # Insert remaining rows
        if batch:
            if not dry_run:
                collection.insert_many(batch, ordered=False)
            stats["inserted"] += len(batch)

    return stats


# ---- CLI ----

def main():
    parser = argparse.ArgumentParser(
        description="Import violation CSV data into ParkWise MongoDB.",
    )
    parser.add_argument("csv_file", help="Path to the CSV file to import")
    parser.add_argument(
        "--batch-size", type=int, default=200,
        help="Number of records per insert batch (default: 200)",
    )
    parser.add_argument(
        "--dry-run", action="store_true",
        help="Parse and validate without writing to the database",
    )
    args = parser.parse_args()

    mode = "DRY RUN" if args.dry_run else "LIVE"
    print(f"\n🚀 ParkWise Data Loader [{mode}]")
    print(f"   File : {args.csv_file}")
    print(f"   Batch: {args.batch_size}\n")

    stats = load_csv(args.csv_file, args.batch_size, args.dry_run)

    print(f"\n📊 Summary")
    print(f"   Total rows : {stats['total']}")
    print(f"   Inserted   : {stats['inserted']}")
    print(f"   Skipped    : {stats['skipped']} (duplicates)")
    print(f"   Errors     : {stats['errors']}")

    if args.dry_run:
        print("\n   ℹ  Dry-run mode – nothing was written to the database.")
    print()


if __name__ == "__main__":
    main()

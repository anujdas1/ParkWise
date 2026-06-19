"""
ParkWise Model API Routes
=========================
Serves pre-computed hotspot detection model outputs:
    • /forecast       – 72-hour zone-level EIS forecast
    • /top-hotspots   – Top 8 highest-risk zones in the next 72 hours
    • /patrol-priority – Patrol priority ranking by shift
    • /model-report   – Model evaluation metrics (AUC, MAE, RMSE)
"""

import csv
import json
import os
from flask import Blueprint, jsonify, request

model_bp = Blueprint("model", __name__)

# Base directory for model output files
MODEL_DIR = os.path.join(os.path.dirname(__file__), "model_outputs")


def _read_csv(filename: str) -> list[dict]:
    """Read a CSV file and return a list of dicts."""
    filepath = os.path.join(MODEL_DIR, filename)
    with open(filepath, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        rows = []
        for row in reader:
            # Convert numeric fields
            cleaned = {}
            for k, v in row.items():
                k = k.strip()
                try:
                    cleaned[k] = float(v)
                except (ValueError, TypeError):
                    cleaned[k] = v.strip() if v else v
            rows.append(cleaned)
    return rows


def _read_json(filename: str) -> dict:
    """Read a JSON file and return its contents."""
    filepath = os.path.join(MODEL_DIR, filename)
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


# ─────────────────────── Forecast ───────────────────────

@model_bp.route("/forecast", methods=["GET"])
def forecast():
    """
    Return hourly EIS forecasts for all zones over the next 72 hours.

    Query params
    ------------
    zone_id : str   – filter by zone (optional)
    limit   : int   – max rows (default 500)
    """
    data = _read_csv("forecast_72h_full.csv")

    zone_id = request.args.get("zone_id")
    if zone_id:
        data = [r for r in data if r.get("zone_id") == zone_id]

    limit = request.args.get("limit", 500, type=int)
    data = data[:limit]

    return jsonify({
        "forecast": data,
        "total": len(data),
        "description": "72-hour zone-level predicted EIS and occurrence probability",
    })


# ─────────────────────── Top hotspots ───────────────────────

@model_bp.route("/top-hotspots", methods=["GET"])
def top_hotspots():
    """
    Return the top predicted hotspots for the next 72 hours,
    ranked by cumulative predicted EIS.
    """
    data = _read_csv("top_hotspots_next_72h.csv")

    return jsonify({
        "hotspots": data,
        "total": len(data),
        "description": "Top zones by cumulative predicted EIS over next 72 hours",
    })


# ─────────────────────── Patrol priority ───────────────────────

@model_bp.route("/patrol-priority", methods=["GET"])
def patrol_priority():
    """
    Return patrol priority rankings broken down by shift.

    Query params
    ------------
    shift : str  – filter by shift name, e.g. "morning (06:00-14:00)"
    date  : str  – filter by shift_date, e.g. "2024-04-09"
    limit : int  – max rows (default 200)
    """
    data = _read_csv("patrol_priority_by_shift.csv")

    shift = request.args.get("shift")
    if shift:
        data = [r for r in data if shift.lower() in str(r.get("shift", "")).lower()]

    date = request.args.get("date")
    if date:
        data = [r for r in data if r.get("shift_date") == date]

    limit = request.args.get("limit", 200, type=int)
    data = data[:limit]

    return jsonify({
        "patrol_priority": data,
        "total": len(data),
        "description": "Zone patrol priority ranked by predicted EIS per shift",
    })


# ─────────────────────── Model evaluation ───────────────────────

@model_bp.route("/model-report", methods=["GET"])
def model_report():
    """Return model evaluation metrics."""
    report = _read_json("model_evaluation_report.json")
    return jsonify({
        "model_evaluation": report,
        "description": "Hurdle model performance vs. naive baseline",
    })

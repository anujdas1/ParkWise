"""ParkWise Model API Routes
=========================
Serves model outputs directly from MongoDB collections.
"""

from flask import Blueprint, jsonify, request, current_app
from .db import get_collection_by_name

model_bp = Blueprint("model", __name__)

# Utility to fetch documents from a collection
def _fetch_from_collection(name: str, filter_query: dict = None, limit: int = 0):
    coll = get_collection_by_name(name)
    cursor = coll.find(filter_query or {})
    if limit:
        cursor = cursor.limit(limit)
    results = []
    for doc in cursor:
        doc['_id'] = str(doc.get('_id'))
        results.append(doc)
    return results

# ─────────────────────── Forecast ───────────────────────
@model_bp.route("/forecast", methods=["GET"]) 
def forecast():
    """Return hourly EIS forecasts for all zones over the next 72 hours.
    Query params:
    - zone_id: filter by zone (optional)
    - limit: max rows (default 500)
    """
    filter_query = {}
    zone_id = request.args.get("zone_id")
    if zone_id:
        filter_query["zone_id"] = zone_id
    limit = request.args.get("limit", 500, type=int)
    data = _fetch_from_collection("forecast", filter_query, limit)
    return jsonify({
        "forecast": data,
        "total": len(data),
        "description": "72-hour zone-level predicted EIS and occurrence probability",
    })

# ─────────────────────── Top hotspots ───────────────────────
@model_bp.route("/top-hotspots", methods=["GET"]) 
def top_hotspots():
    """Return the top predicted hotspots for the next 72 hours, ranked by cumulative predicted EIS."""
    data = _fetch_from_collection("top_hotspots")
    return jsonify({
        "hotspots": data,
        "total": len(data),
        "description": "Top zones by cumulative predicted EIS over next 72 hours",
    })

# ─────────────────────── Patrol priority ───────────────────────
@model_bp.route("/patrol-priority", methods=["GET"]) 
def patrol_priority():
    """Return patrol priority rankings broken down by shift.
    Query params:
    - shift: filter by shift name (case‑insensitive substring)
    - date: filter by shift_date
    - limit: max rows (default 200)
    """
    filter_query = {}
    shift = request.args.get("shift")
    if shift:
        filter_query["shift"] = {"$regex": shift, "$options": "i"}
    date = request.args.get("date")
    if date:
        filter_query["shift_date"] = date
    limit = request.args.get("limit", 200, type=int)
    data = _fetch_from_collection("patrol_priority", filter_query, limit)
    return jsonify({
        "patrol_priority": data,
        "total": len(data),
        "description": "Zone patrol priority ranked by predicted EIS per shift",
    })

# ─────────────────────── Model evaluation ───────────────────────
@model_bp.route("/model-report", methods=["GET"]) 
def model_report():
    """Return model evaluation metrics."""
    coll = get_collection_by_name("model_evaluation")
    doc = coll.find_one({})
    if doc:
        doc['_id'] = str(doc.get('_id'))
    return jsonify({
        "model_evaluation": doc,
        "description": "Hurdle model performance vs. naive baseline",
    })

# ─────────────────────── Congestion Model ───────────────────────
@model_bp.route("/congestion/heatmap", methods=["GET"]) 
def congestion_heatmap():
    """Return the EIS heatmap HTML for congestion model."""
    coll = get_collection_by_name("congestion_heatmap")
    doc = coll.find_one({})
    html_content = doc.get("html", "") if doc else ""
    return current_app.response_class(html_content, mimetype="text/html")

@model_bp.route("/congestion/zone-summary", methods=["GET"]) 
def congestion_zone_summary():
    """Return zone EIS summary as JSON list of dicts."""
    data = _fetch_from_collection("congestion_zone_summary")
    return jsonify({
        "zone_summary": data,
        "description": "Zone EIS summary for congestion model",
    })

@model_bp.route("/congestion/top-hotspots", methods=["GET"]) 
def congestion_top_hotspots():
    """Return top 20 hotspots detailed HTML for congestion model."""
    coll = get_collection_by_name("congestion_top_hotspots")
    doc = coll.find_one({})
    html_content = doc.get("html", "") if doc else ""
    return current_app.response_class(html_content, mimetype="text/html")

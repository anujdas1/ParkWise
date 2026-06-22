"""DarogaDesk Model API Routes
=========================
Serves model outputs directly from MongoDB collections.
"""

from flask import Blueprint, jsonify, request, current_app
from .db import get_collection_by_name

model_bp = Blueprint("model", __name__)

_ZONE_MAP_CACHE = None

def _get_zone_map():
    global _ZONE_MAP_CACHE
    if _ZONE_MAP_CACHE is None:
        try:
            coll = get_collection_by_name("zone_lookup")
            _ZONE_MAP_CACHE = {str(d.get("zone_id")): d.get("zone_name") for d in coll.find({})}
        except Exception:
            _ZONE_MAP_CACHE = {}
    return _ZONE_MAP_CACHE

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
        
    zone_map = _get_zone_map()
    for doc in results:
        if "zone_id" in doc:
            zid = str(doc["zone_id"])
            if zid in zone_map:
                doc["zone_name"] = zone_map[zid]

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
    """Return patrol priority rankings broken down by shift, sorted by predicted_EIS descending.
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

    coll = get_collection_by_name("patrol_priority")
    cursor = coll.find(filter_query or {})
    if limit:
        cursor = cursor.limit(limit)
    raw = []
    for doc in cursor:
        doc['_id'] = str(doc.get('_id'))
        raw.append(doc)
    # so highest-risk zones always appear first regardless of MongoDB insertion order
    from collections import defaultdict
    shift_groups = defaultdict(list)
    for doc in raw:
        shift_groups[doc.get("shift", "")].append(doc)

    sorted_data = []
    for shift_name in sorted(shift_groups.keys()):          # alphabetical shift order
        group = shift_groups[shift_name]
        group.sort(key=lambda d: d.get("predicted_EIS", 0), reverse=True)  # highest EIS first
        sorted_data.extend(group)

    zone_map = _get_zone_map()
    for doc in sorted_data:
        if "zone_id" in doc:
            zid = str(doc["zone_id"])
            if zid in zone_map:
                doc["zone_name"] = zone_map[zid]

    return jsonify({
        "patrol_priority": sorted_data,
        "total": len(sorted_data),
        "description": "Zone patrol priority ranked by predicted EIS per shift",
    })

# ─────────────────────── Model evaluation  # ── Enforcement Quality ──
@model_bp.route("/enforcement-quality", methods=["GET"])
def enforcement_quality():
    """Return enforcement quality scores grouped by zone."""
    try:
        coll = get_collection_by_name("enforcement_quality")
        data = list(coll.find({}, {"_id": 0, "zone_name": 1, "total_violations": 1, "rejection_rate": 1, "quality_score": 1, "action": 1}))
        if data:
            # Sort by total_eis descending for consistency
            data.sort(key=lambda x: x.get("rejection_rate", 0), reverse=True)
            return jsonify({"data": data})
    except Exception as e:
        print(f"Error fetching enforcement_quality: {e}")

    return jsonify({"data": []})

# ── Model evaluation ──
@model_bp.route("/model-report", methods=["GET"]) 
def model_report():
    """Return model evaluation metrics."""
    coll = get_collection_by_name("model_report")
    doc = coll.find_one({})
    evaluation = doc.get("content", doc) if doc else {}
    if isinstance(evaluation, dict):
        evaluation.pop("_id", None)
    return jsonify({
        "model_evaluation": evaluation,
        "description": "Hurdle model performance vs. naive baseline",
    })

# ─────────────────────── Congestion Model ───────────────────────
@model_bp.route("/congestion/heatmap", methods=["GET"]) 
def congestion_heatmap():
    """Return the EIS heatmap HTML for congestion model."""
    coll = get_collection_by_name("congestion_heatmap")
    doc = coll.find_one({})
    html_content = doc.get("content", doc.get("html", "")) if doc else ""
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
    html_content = doc.get("content", doc.get("html", "")) if doc else ""
    return current_app.response_class(html_content, mimetype="text/html")




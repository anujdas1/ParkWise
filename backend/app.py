from flask import Flask, request, jsonify, send_from_directory
from backend.models import CRIRequest, IPSRequest, EISRequest
from backend.logic import compute_cri, compute_ips, compute_eis
from backend.db import get_collection
from backend.model_routes import model_bp
import os

# Base directory for the repository
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

# Initialize Flask with static folder pointing to the frontend
app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path="")

# Basic CORS headers for local development if needed
@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response

# Register the model-output blueprint
app.register_blueprint(model_bp)

# ─────────────────────── Static Frontend Serving ───────────────────────

@app.route("/")
def serve_index():
    """Serve the main frontend dashboard."""
    return send_from_directory(app.static_folder, "index.html")

@app.route("/<path:path>")
def serve_static(path):
    """Serve other static files (HTML, JS, CSS)."""
    return send_from_directory(app.static_folder, path)


# ─────────────────────── Health check & API root ───────────────────────

@app.route('/api', methods=['GET'])
def api_index():
    """Root health-check endpoint."""
    return jsonify({
        "service": "ParkWise Impact Matrix API",
        "status": "running",
        "endpoints": [
            "/", "/cri", "/ips", "/eis", "/hotspots", "/stats",
            "/forecast", "/top-hotspots", "/patrol-priority", "/model-report",
        ],
    })


# ─────────────────────── Core metric endpoints ───────────────────────

@app.route('/cri', methods=['POST'])
def cri_endpoint():
    """Compute the Congestion Risk Index for a single data point."""
    data = request.get_json()
    cri_req = CRIRequest(**data)
    cri_val = compute_cri(
        vehicle_type=cri_req.vehicle_type,
        violation_type=cri_req.violation_type,
        t_peak=cri_req.t_peak,
        w_blocked=cri_req.w_blocked,
        w_total=cri_req.w_total,
        network_factor=cri_req.network_factor,
    )
    return jsonify({"cri": cri_val})


@app.route('/ips', methods=['POST'])
def ips_endpoint():
    """Compute the Intervention Priority Score."""
    data = request.get_json()
    ips_req = IPSRequest(**data)
    ips_val = compute_ips(cri=ips_req.cri, actionability=ips_req.actionability)
    return jsonify({"ips": ips_val})


@app.route('/eis', methods=['POST'])
def eis_endpoint():
    """Compute the Enforcement Impact Score."""
    data = request.get_json()
    eis_req = EISRequest(**data)
    eis_val = compute_eis(ips=eis_req.ips, officer_hours=eis_req.officer_hours)
    return jsonify({"eis": eis_val})


# ─────────────────────── Hotspot analysis ───────────────────────

@app.route('/hotspots', methods=['GET'])
def hotspots_endpoint():
    """
    Aggregate violations by location/junction_name and rank by CRI.

    Query params
    ------------
    limit : int   – max hotspots to return (default 20)
    """
    limit = request.args.get("limit", 20, type=int)
    collection = get_collection()

    pipeline = [
        # Group by junction_name (or location as fallback)
        {"$group": {
            "_id": {"$ifNull": ["$junction_name", "$location"]},
            "count": {"$sum": 1},
            "avg_lat": {"$avg": {"$toDouble": {"$ifNull": ["$latitude", "0"]}}},
            "avg_lng": {"$avg": {"$toDouble": {"$ifNull": ["$longitude", "0"]}}},
            "vehicle_types": {"$addToSet": "$vehicle_type"},
            "violation_types": {"$addToSet": "$violation_type"},
        }},
        {"$sort": {"count": -1}},
        {"$limit": limit},
    ]

    raw_hotspots = list(collection.aggregate(pipeline))

    # Enrich each hotspot with a simplified CRI estimate
    hotspots = []
    for h in raw_hotspots:
        # Use the most common vehicle/violation type for a rough CRI
        vtype = h["vehicle_types"][0] if h["vehicle_types"] else "car"
        viol = h["violation_types"][0] if h["violation_types"] else "default"
        cri_estimate = compute_cri(
            vehicle_type=vtype,
            violation_type=viol,
            t_peak=1.3,           # moderate peak assumption
            w_blocked=2.0,        # default 2 m blocked
            w_total=6.0,          # default 6 m road
            network_factor=1.5 if h["count"] > 10 else 1.0,
        )
        hotspots.append({
            "location": h["_id"],
            "violation_count": h["count"],
            "latitude": h["avg_lat"],
            "longitude": h["avg_lng"],
            "vehicle_types": h["vehicle_types"],
            "violation_types": h["violation_types"],
            "cri_estimate": round(cri_estimate, 2),
        })

    # Sort by CRI (highest risk first)
    hotspots.sort(key=lambda x: x["cri_estimate"], reverse=True)

    return jsonify({"hotspots": hotspots, "total": len(hotspots)})


# ─────────────────────── Collection stats ───────────────────────

@app.route('/stats', methods=['GET'])
def stats_endpoint():
    """Return basic statistics about the violations collection."""
    collection = get_collection()
    total = collection.count_documents({})

    # Count distinct locations and vehicle types
    locations = collection.distinct("junction_name")
    vehicle_types = collection.distinct("vehicle_type")
    violation_types = collection.distinct("violation_type")

    return jsonify({
        "total_records": total,
        "unique_locations": len(locations),
        "vehicle_types": vehicle_types,
        "violation_types": violation_types,
    })


# ─────────────────────── Entry point ───────────────────────

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

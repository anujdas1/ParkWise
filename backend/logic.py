from typing import Dict

# ----- Multiplier tables -----
VEHICLE_MULTIPLIER: Dict[str, float] = {
    "HGV": 3.0,
    "car": 1.0,
    "scooter": 0.5,
    # fallback for unknown types
    "default": 1.0,
}

VIOLATION_MULTIPLIER: Dict[str, float] = {
    "double_parking": 2.0,
    "main_road": 1.5,
    "footpath": 0.2,
    # fallback
    "default": 1.0,
}

def _lookup(mapping: Dict[str, float], key: str) -> float:
    """Return the multiplier for *key* or the default entry if missing."""
    return mapping.get(key.lower(), mapping.get("default", 1.0))

def compute_cri(
    vehicle_type: str,
    violation_type: str,
    t_peak: float,
    w_blocked: float,
    w_total: float,
    network_factor: float,
) -> float:
    """Calculate the Congestion Risk Index (CRI).

    Formula (from the Impact Matrix document)::
        CRI = (Vtype × Vviolation × Tpeak) × (1 + (Wblocked / Wtotal)) × Cnetwork

    Parameters
    ----------
    vehicle_type: str
        e.g., "HGV", "car", "scooter".
    violation_type: str
        e.g., "double_parking", "main_road", "footpath".
    t_peak: float
        Peak factor (1.0 off‑peak, >1 during rush hour).
    w_blocked: float
        Width of the road blocked (meters).
    w_total: float
        Total road width (meters).
    network_factor: float
        Importance multiplier for the network node (e.g., 2.0 for intersections).
    """
    vtype_mul = _lookup(VEHICLE_MULTIPLIER, vehicle_type)
    vviol_mul = _lookup(VIOLATION_MULTIPLIER, violation_type)
    width_factor = 1 + (w_blocked / w_total) if w_total != 0 else 1
    cri = (vtype_mul * vviol_mul * t_peak) * width_factor * network_factor
    return cri

def compute_ips(cri: float, actionability: float) -> float:
    """Intervention Priority Score (IPS).

    Simple multiplicative model – can be refined later.
    """
    return cri * actionability

def compute_eis(ips: float, officer_hours: float) -> float:
    """Enforcement Impact Score (EIS).

    Represents total congestion‑risk reduction per officer‑hour.
    """
    if officer_hours == 0:
        return 0.0
    return ips / officer_hours

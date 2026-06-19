from pydantic import BaseModel, Field

class CRIRequest(BaseModel):
    vehicle_type: str = Field(..., description="Vehicle category, e.g., 'HGV', 'car', 'scooter'")
    violation_type: str = Field(..., description="Violation category, e.g., 'double_parking', 'main_road', 'footpath'")
    t_peak: float = Field(..., description="Peak factor (1.0 off‑peak, >1 during rush hour)")
    w_blocked: float = Field(..., description="Width of road blocked by the vehicle (meters)")
    w_total: float = Field(..., description="Total road width (meters)")
    network_factor: float = Field(..., description="Network importance multiplier (e.g., 2.0 for intersections)")

class IPSRequest(BaseModel):
    cri: float = Field(..., description="Congestion Risk Index value")
    actionability: float = Field(..., description="Actionability score (0‑1)")

class EISRequest(BaseModel):
    ips: float = Field(..., description="Intervention Priority Score")
    officer_hours: float = Field(..., description="Available officer‑hours for deployment")

from flask import Flask, request, jsonify
# from flasgger import Swagger  # Disabled: incompatible with Flask 3.x
from backend.models import CRIRequest, IPSRequest, EISRequest

app = Flask(__name__)
# Swagger(app)  # Swagger UI disabled; can be added with compatible package

from backend.logic import compute_cri, compute_ips, compute_eis

# Duplicate app initialization removed; original app defined above
# Swagger(app)  # Swagger UI disabled due to compatibility issues

@app.route('/cri', methods=['POST'])
def cri_endpoint():
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
    data = request.get_json()
    ips_req = IPSRequest(**data)
    ips_val = compute_ips(cri=ips_req.cri, actionability=ips_req.actionability)
    return jsonify({"ips": ips_val})

@app.route('/eis', methods=['POST'])
def eis_endpoint():
    data = request.get_json()
    eis_req = EISRequest(**data)
    eis_val = compute_eis(ips=eis_req.ips, officer_hours=eis_req.officer_hours)
    return jsonify({"eis": eis_val})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

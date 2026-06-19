# Backend Quick‑Start Guide

## Prerequisites
- Python 3.12 or newer installed.
- Access to the MongoDB Atlas cluster (the connection string is already baked in the code). If you want to use a different URI, set the `MONGO_URI` environment variable before starting the server.

## Installation
```powershell
# Navigate to the backend directory
cd C:\Users\forco\Desktop\ParkWise\ParkWise\backend

# (Optional) create a virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1   # PowerShell
# or   .\.venv\Scripts\activate.bat   # cmd

# Install dependencies
pip install -r requirements.txt
```

## Running the API
```powershell
# Ensure the environment variable is set (skip if you are happy with the default URI)
$env:MONGO_URI = "mongodb+srv://<username>:<password>@cluster0.cb3rzh6.mongodb.net/?appName=Cluster0"

# Start the Flask server
python -m backend.app
```
The API will be available at **http://127.0.0.1:5000**.

## Swagger UI
Open a browser and go to `http://127.0.0.1:5000/apidocs` to explore the three endpoints (`/cri`, `/ips`, `/eis`). Each endpoint expects a JSON payload matching the Pydantic models defined in `models.py`.

## Loading Your Traffic Data (optional)
If you have a CSV/JSON file with the columns you supplied:
```
id, latitude, longitude, location, vehicle_number, vehicle_type, description, violation_type, offence_code, created_datetime, closed_datetime, modified_datetime, device_id, created_by_id, center_code, police_station, data_sent_to_scita, junction_name, action_taken_timestamp, data_sent_to_scita_timestamp, updated_vehicle_number, updated_vehicle_type, validation_status, validation_timestamp
```
You can insert records manually via the MongoDB Compass UI or write a short script that:
1. Reads the file with **pandas**.
2. Calls `db.insert_record(record)` for each row.
A minimal loader can be added later (`data_loader.py`).

## Next Development Steps
1. **Add a data‑loader script** (`data_loader.py`) to bulk‑import your CSV/JSON into MongoDB.
2. **Implement forecasting** – replace the placeholder linear‑regression with Prophet or XGBoost when you’re ready.
3. **Write unit tests** in a `tests/` folder to ensure the calculation functions stay correct.
4. **Containerise** – use the provided `Dockerfile` (you can add it later) for easy deployment.
5. **Extend the API** – add endpoints for `/forecast` and `/simulate` as the product grows.

---
Feel free to ask for any of the above items to be generated, or let me know if you’d like to run the server now.

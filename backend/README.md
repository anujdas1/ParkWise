# ParkWise Backend ⚙️

This directory contains the Python Flask backend for the ParkWise application. It is responsible for directly connecting to MongoDB Atlas, parsing machine-learning output models, and serving the JSON payloads natively to the pure HTML/JS frontend.

## Prerequisites
- **Python 3.12** or newer installed.
- **MongoDB Access**: The application connects to a MongoDB Atlas cluster. The connection string is baked into the code (`db.py`). If you want to use a different URI, set the `MONGO_URI` environment variable before starting the server.

## Installation
```powershell
# Navigate to the backend directory
cd backend

# Create a virtual environment
python -m venv .venv

# Activate it (PowerShell)
.\.venv\Scripts\Activate.ps1   

# Install dependencies
pip install -r requirements.txt
```

## Running the API
The easiest way to run the platform is from the root `ParkWise` directory:
```powershell
# Start the Flask server module
python -m backend.app
```
The API and frontend will automatically be served at **http://127.0.0.1:5000**.

## Core Endpoints
The backend exposes various routes used by the frontend under `model_routes.py`. These natively stream from MongoDB collections:
- `/api/model/forecast`
- `/api/model/top-hotspots`
- `/api/model/patrol-priority`
- `/api/model/enforcement-quality`
- `/api/model/congestion/heatmap`

*Note: The frontend HTML/CSS/JS is served as static files via `app.py` directly from the `../frontend` folder for immediate development turnaround.*

## Data Integration
Our data models dynamically fetch from the cloud MongoDB. If you need to re-seed or push data to a new cluster, leverage Python scripts (like the ones we used to upload `mock_data`) to map your CSVs into native MongoDB collections via PyMongo (`db.py`).

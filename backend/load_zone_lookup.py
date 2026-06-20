import csv
import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
MONGO_URI = os.getenv('MONGO_URI')
if not MONGO_URI:
    raise RuntimeError('MONGO_URI not set in .env')

client = MongoClient(MONGO_URI)
MONGO_DB_NAME = os.getenv('MONGO_DB_NAME') or 'parkwise'
db = client[MONGO_DB_NAME]

# Path to the CSV containing zone_id to place name mapping
CSV_PATH = os.path.join(os.path.dirname(__file__), 'model_outputs', 'jan to may police violation_anonymized791b166.csv')

if not os.path.isfile(CSV_PATH):
    raise FileNotFoundError(f'CSV file not found at {CSV_PATH}')

collection = db['zone_lookup']
# Optional: clear existing data
collection.delete_many({})

unique_zones = {}
with open(CSV_PATH, newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        lat = row.get('latitude')
        lon = row.get('longitude')
        if lat and lon:
            try:
                lat_num = float(lat)
                lon_num = float(lon)
                # Round to nearest 0.005
                lat_bucket = round(lat_num * 200) / 200
                lon_bucket = round(lon_num * 200) / 200
                
                # Format to match the model's zone_id string (e.g., '12.84_77.645')
                # Python's default str(float) is what the model used (e.g., 13.0 -> "13.0")
                lat_str = str(lat_bucket)
                lon_str = str(lon_bucket)
                zone_id = f"{lat_str}_{lon_str}"
                
                # Prefer junction_name if valid, else location
                j_name = row.get('junction_name')
                loc = row.get('location')
                
                zone_name = None
                if j_name and j_name.strip() and j_name.strip().lower() != 'no junction' and j_name.strip().lower() != 'null':
                    zone_name = j_name.strip()
                elif loc and loc.strip() and loc.strip().lower() != 'null':
                    zone_name = loc.strip()
                    # optionally clean up long addresses by keeping the first part
                    zone_name = zone_name.split(',')[0]
                
                if zone_id and zone_name:
                    unique_zones[str(zone_id)] = zone_name
            except ValueError:
                pass

docs = [{'zone_id': zid, 'zone_name': zname} for zid, zname in unique_zones.items()]
if docs:
    collection.insert_many(docs)

print(f'Inserted {len(docs)} unique zone lookup records into MongoDB')

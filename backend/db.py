import os
from pymongo import MongoClient
from pymongo.collection import Collection

# Retrieve the connection URI from the environment. Fallback to localhost if not set.
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

# Database and collection names – you can adjust via env vars if needed.
DB_NAME = os.getenv("MONGO_DB_NAME", "parkwise")
COLLECTION_NAME = os.getenv("MONGO_COLLECTION", "violations")

client = MongoClient(MONGO_URI)
_db = client[DB_NAME]
_collection: Collection = _db[COLLECTION_NAME]

def get_collection() -> Collection:
    """Return the MongoDB collection used for storing violation records."""
    return _collection

def insert_record(record: dict) -> str:
    """Insert a single record into the collection and return its ObjectId string."""
    result = _collection.insert_one(record)
    return str(result.inserted_id)

def find_records(filter_query: dict = None, limit: int = 100):
    """Retrieve records matching *filter_query* (default all) up to *limit* rows."""
    if filter_query is None:
        filter_query = {}
    cursor = _collection.find(filter_query).limit(limit)
    return list(cursor)

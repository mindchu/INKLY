import os
from dotenv import load_dotenv
from pymongo import MongoClient
import json
from bson import ObjectId

# Helper to serialize ObjectId
class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return json.JSONEncoder.default(self, o)

# Load env vars
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Adjust if .env is in backend or parent, assuming it's in backend root or similar based on dbconn.py
# dbconn.py does: os.path.dirname(os.path.dirname(os.path.abspath(__file__))) which is backend root
# So if this script is in backend/, .env is in backend/ too?
# Let's look at dbconn.py again.
# dbconn.py is in backend/util/dbconn.py. 
# BASE_DIR there is os.path.dirname(os.path.dirname(...)) = backend/
# ENV_FILE is os.path.join(BASE_DIR, '.env') = backend/.env

# So if I put this script in backend/, then .env is just .env
load_dotenv('.env')

user = os.getenv("MONGO_USER")
password = os.getenv("MONGO_PASS")

# uri = f"mongodb://{user}:{password}@localhost:27017/"
# Let's use the same logic as dbconn.py to be safe, but we can also just inspect dbconn.py logic
# Actually, I can just import the connection from util.dbconn if I want, but that might have side effects if it initializes things.
# Better to copy the connection logic to be standalone.

uri = f"mongodb://{user}:{password}@localhost:27017/" if user and password else "mongodb://localhost:27017/"

print(f"Connecting to: {uri}")

try:
    client = MongoClient(uri)
    db = client.inkly
    
    print(f"\nConnected to database: {db.name}")
    
    collections = db.list_collection_names()
    print(f"Collections found: {collections}")
    
    for col_name in collections:
        print(f"\n--- Collection: {col_name} ---")
        collection = db[col_name]
        count = collection.count_documents({})
        print(f"Total documents: {count}")
        
        cursor = collection.find().limit(20)
        for doc in cursor:
            print(json.dumps(doc, cls=JSONEncoder, indent=2))

except Exception as e:
    print(f"Error: {e}")

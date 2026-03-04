import os
from dotenv import load_dotenv
from pymongo import MongoClient
import gridfs

# Load variables from .env into the environment
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_FILE = os.path.join(BASE_DIR, '.env')
load_dotenv(ENV_FILE)

user = os.getenv("MONGO_USER")
password = os.getenv("MONGO_PASS")

# Construct the URI using f-strings
if user and password:
    uri = f"mongodb://{user}:{password}@localhost:27017/"
else:
    uri = "mongodb://localhost:27017/"

# Fallback mechanism for local dev resilience
try:
    client = MongoClient(uri, serverSelectionTimeoutMS=2000)
    # Trigger connection
    client.admin.command('ping')
except Exception:
    # If auth fails or server unreachable with auth, try unauthenticated
    uri = "mongodb://localhost:27017/"
    client = MongoClient(uri, serverSelectionTimeoutMS=2000)

db = client.inkly
fs = gridfs.GridFS(db)

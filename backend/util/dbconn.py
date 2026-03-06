import os
import time
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
    primary_uri = f"mongodb://{user}:{password}@localhost:27017/"
else:
    primary_uri = "mongodb://localhost:27017/"

fallback_uri = "mongodb://localhost:27017/"

# Actively look for a database connection until successful
while True:
    try:
        client = MongoClient(primary_uri, serverSelectionTimeoutMS=2000)
        # Trigger connection
        client.admin.command('ping')
        print("Successfully connected to the database.")
        break
    except Exception as e:
        print(f"Failed to connect using primary URI: {e}")
        # If auth fails or server unreachable with auth, try unauthenticated
        try:
            print("Trying unauthenticated fallback...")
            client = MongoClient(fallback_uri, serverSelectionTimeoutMS=2000)
            client.admin.command('ping')
            print("Successfully connected to the database (unauthenticated).")
            break
        except Exception as e_fallback:
            print(f"Database connection failed. Retrying in 2 seconds...")
            time.sleep(2)

db = client.inkly
fs = gridfs.GridFS(db)

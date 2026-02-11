import os
from dotenv import load_dotenv
from pymongo import MongoClient

# Load variables from .env into the environment
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_FILE = os.path.join(BASE_DIR, '.env')
load_dotenv(ENV_FILE)

user = os.getenv("MONGO_USER")
password = os.getenv("MONGO_PASS")

# Construct the URI using f-strings
uri = f"mongodb://{user}:{password}@localhost:27017/"

client = MongoClient(uri)
db = client.inkly
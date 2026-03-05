from typing import List, Optional

from fastapi import logger
from util.dbconn import db
from datetime import datetime

def get_popular_tags(limit: int = 20) -> List[dict]:
    """
    Fetches popular tags from the database. 
    Returns an empty list if no tags exist.
    Raises an Exception if the system fails.
    """
    try:
        db_tags = list(db.tags.find().sort("use_count", -1).limit(limit))
        if not db_tags:
            return []  # Return empty list if DB is functional but empty

        for tag in db_tags:
            tag["_id"] = str(tag["_id"])
            
        return db_tags

    except Exception as e:
        logger.error(f"Database error while fetching tags: {e}")
        raise ConnectionError("Could not retrieve tags from the database.") 

def ensure_tags_exist(tags: List[str], created_by: Optional[str] = None):
    """
    Ensures tags exist using an atomic upsert to prevent race conditions.
    """
    for tag_name in tags:
        tag_name = tag_name.strip()
        if not tag_name:
            continue
            
        # Atomic Upsert: 
        # 1. Try to find by name.
        # 2. If found, increment use_count.
        # 3. If NOT found, create with initial metadata.
        db.tags.update_one(
            {"name": tag_name},
            {
                "$inc": {"use_count": 1},
                "$setOnInsert": {
                    "created_by": created_by,
                    "created_at": datetime.utcnow()
                }
            },
            upsert=True
        )


from typing import List
from util.dbconn import db

def get_popular_tags(limit: int = 20) -> List[str]:
    """
    Returns a list of popular tags by fetching them from the database.
    Sorts by use_count descending. Fallbacks to a curated list if none found.
    """
    db_tags = list(db.tags.find().sort("use_count", -1).limit(limit))
    if db_tags:
        return [t["name"] for t in db_tags]
    
    return [
        "Technology", "Programming", "Science", "Politics", 
        "Health", "Education", "World News", "Books", 
        "Psychology", "business", "Design", "Art", 
        "Music", "History", "Philosophy", "Self-Improvement",
        "Environment", "Economics", "Literature", "Movies"
    ]

def ensure_tags_exist(tags: List[str]):
    """
    Ensures that the provided tags exist in the tags collection and increments their usage count.
    """
    for tag in tags:
        # Normalize tag (optional, e.g., lowercase)
        # tag = tag.strip().lower() # Let's keep it as provided for now but stripping is good
        tag = tag.strip()
        if not tag:
            continue
            
        db.tags.update_one(
            {"name": tag},
            {"$inc": {"use_count": 1}},
            upsert=True
        )

def update_user_interests(google_id: str, tags: List[str]) -> bool:
    """
    Updates the interested_tags for a given user.
    """
    result = db.users.update_one(
        {"google_id": google_id},
        {"$set": {"interested_tags": tags}}
    )
    return result.modified_count > 0 or result.matched_count > 0

from typing import List, Optional
from util.dbconn import db
from obj.tag import Tag
from datetime import datetime

def get_popular_tags(limit: int = 20) -> List[dict]:
    """
    Returns a list of popular tags by fetching them from the database.
    Sorts by use_count descending. Fallbacks to a curated list if none found.
    """
    db_tags = list(db.tags.find().sort("use_count", -1).limit(limit))
    if db_tags:
        for tag in db_tags:
            tag["_id"] = str(tag["_id"])
        return db_tags
    
    # Fallback to defaults with enriched structure
    default_names = [
        "Technology", "Programming", "Science", "Politics", 
        "Health", "Education", "World News", "Books", 
        "Psychology", "business", "Design", "Art", 
        "Music", "History", "Philosophy", "Self-Improvement",
        "Environment", "Economics", "Literature", "Movies"
    ]
    return [Tag(name=name).to_dict() for name in default_names]

def ensure_tags_exist(tags: List[str], created_by: Optional[str] = None):
    """
    Ensures that the provided tags exist in the tags collection and increments their usage count.
    If a tag doesn't exist, it's created with metadata.
    """
    for tag_name in tags:
        tag_name = tag_name.strip()
        if not tag_name:
            continue
            
        # Check if tag exists
        existing_tag = db.tags.find_one({"name": tag_name})
        
        if existing_tag:
            # Increment use count
            db.tags.update_one(
                {"name": tag_name},
                {"$inc": {"use_count": 1}}
            )
        else:
            # Create new enriched tag
            new_tag = Tag(
                name=tag_name, 
                created_by=created_by,
                use_count=1
            )
            db.tags.insert_one(new_tag.to_dict())


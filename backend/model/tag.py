import pymongo
from datetime import datetime
from typing import List, Dict, Any
from util.dbconn import db


tags_col = db.tags
# This index tells MongoDB to keep a pre-sorted list of tags by popularity in memory.
tags_col.create_index([("usage_count", pymongo.DESCENDING)])

class TagManager:
    """
    Manages the Tag collection. 
    Tags use their lowercased name as the _id to prevent duplicates natively.
    """

    @staticmethod
    def search_tags(search_term: str = "", limit: int = 5) -> List[Dict[str, Any]]:
        """
        Provides autocomplete suggestions for the frontend.
        - If search_term is empty: returns the top 5 most popular tags overall.
        - If search_term has text: returns the top 5 matching tags, sorted by popularity.
        """
        query = {}
        if search_term:
            clean_term = search_term.strip()
            # Regex: '^' means "starts with". 'i' means case-insensitive.
            # Example: Typing "ja" matches "JavaScript" and "Java".
            query = {"_id": {"$regex": f"^{clean_term}", "$options": "i"}}

        # Query the database, sort by usage_count (Move to Front logic), and limit to 5
        cursor = tags_col.find(query).sort("usage_count", pymongo.DESCENDING).limit(limit)
        
        return list(cursor)

    @staticmethod
    def process_tags(raw_tag_names: List[str]) -> List[str]:
        """
        Takes the final list of tags selected/typed by the user.
        Creates any new ones, bumps the popularity of existing ones, 
        and returns the clean list of IDs to save to the User or Post.
        """
        processed_tag_ids = []
        
        for name in raw_tag_names:
            if not name.strip():
                continue  # Skip any accidental empty strings
                
            clean_name = name.strip()
            normalized_id = clean_name.lower()  # " Machine Learning " -> "machine learning"
            processed_tag_ids.append(normalized_id)

            # The "Upsert" Operation
            tags_col.update_one(
                {"_id": normalized_id},
                {
                    # $setOnInsert: Only triggers if the tag is completely new
                    "$setOnInsert": {
                        "display_name": clean_name,  # Saves the original casing (e.g., "iOS")
                        "created_at": datetime.now()
                    },
                    # $inc: Triggers EVERY time. This adds +1 to popularity!
                    "$inc": {"usage_count": 1},
                    # $set: Updates the timestamp so we know it's still active
                    "$set": {"last_used_at": datetime.now()}
                },
                upsert=True
            )
            
        return processed_tag_ids
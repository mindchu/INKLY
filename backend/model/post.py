import uuid
import pymongo
from enum import Enum
from datetime import datetime
from typing import List, Dict, Any, Optional

from util.dbconn import db
from model.tag import TagManager

posts_col = db.posts
likes_col = db.post_likes

# Create a Text Index for 'search_post'
posts_col.create_index([("title", pymongo.TEXT), ("content", pymongo.TEXT)])
posts_col.create_index([("forum_type", pymongo.ASCENDING), ("created_at", pymongo.DESCENDING)])

class ForumType(str, Enum):
    NOTE = "note"
    DISCUSSION = "discussion"

class SortBy(str, Enum):
    NEWEST = "created_at"
    RECENTLY_UPDATED = "updated_at"
    MOST_LIKED = "like_count"
    MOST_VIEWED = "view_count"

class Post:
    @staticmethod
    def create_post(
        author_id: str, 
        forum_type: str,
        title: str, 
        content: str, 
        raw_tags: List[str] = None, 
        attachment_url: str = ""
    ) -> str:
        
        # Validate the forum type
        if forum_type not in [ForumType.NOTE, ForumType.DISCUSSION]:
            raise ValueError(f"Invalid forum_type. Must be '{ForumType.NOTE}' or '{ForumType.DISCUSSION}'")

        post_id = str(uuid.uuid4())
        clean_tags = TagManager.process_tags(raw_tags or [])
        
        post_data = {
            "_id": post_id,
            "author_id": author_id,
            "forum_type": forum_type, # <--- SAVED TO DB
            "title": title.strip(),
            "content": content.strip(),
            "tags": clean_tags,
            "attachment_url": attachment_url, 
            "like_count": 0,
            "view_count": 0,
            "share_count": 0,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        
        posts_col.insert_one(post_data)
        return post_id
    
    @staticmethod
    def increment_view(post_id: str):
        """Adds +1 to the view count."""
        posts_col.update_one({"_id": post_id}, {"$inc": {"view_count": 1}})

    @staticmethod
    def edit_post(post_id: str, author_id: str, new_title: str, new_content: str, new_raw_tags: List[str] = None) -> bool:
        """
        Updates a post ONLY if the user requesting the edit is the author.
        """
        clean_tags = TagManager.process_tags(new_raw_tags or [])
        
        result = posts_col.update_one(
            {"_id": post_id, "author_id": author_id},
            {"$set": {
                "title": new_title.strip(),
                "content": new_content.strip(),
                "tags": clean_tags,
                "updated_at": datetime.now()
            }}
        )
        return result.modified_count > 0

    @staticmethod
    def delete_post(post_id: str, author_id: str) -> bool:
        """
        Deletes the post and cleans up associated likes.
        """
        result = posts_col.delete_one({"_id": post_id, "author_id": author_id})
        
        if result.deleted_count > 0:
            likes_col.delete_many({"post_id": post_id})
            return True
        return False

    @staticmethod
    def toggle_like(post_id: str, user_id: str) -> dict:
        """
        If they haven't liked it, like it. If they have, unlike it.
        Updates the post's like_count automatically.
        """
        like_doc = {"post_id": post_id, "user_id": user_id}
        existing_like = likes_col.find_one(like_doc)

        if existing_like:
            # Unlike: Remove the document and decrease the post's count
            likes_col.delete_one(like_doc)
            posts_col.update_one({"_id": post_id}, {"$inc": {"like_count": -1}})
            return {"status": "unliked"}
        else:
            # Like: Add the document and increase the post's count
            likes_col.insert_one({**like_doc, "created_at": datetime.now()})
            posts_col.update_one({"_id": post_id}, {"$inc": {"like_count": 1}})
            return {"status": "liked"}

    @staticmethod
    def share_post(post_id: str) -> str:
        """
        Increments the share count and returns a theoretical URL to copy.
        """
        posts_col.update_one({"_id": post_id}, {"$inc": {"share_count": 1}})
        # SOON TO BE IMPLEMENTED: Generate a real shareable link that redirects to the post page.
        return f"https://yourdomain.com/post/{post_id}"

    @staticmethod
    def search_posts(
        keyword: str = None, 
        tag_filter: str = None, 
        forum_type: str = None,
        sort_by: SortBy = SortBy.NEWEST
    ) -> List[dict]:
        
        query = {}
        
        if keyword:
            query["$text"] = {"$search": keyword}
        if tag_filter:
            query["tags"] = tag_filter.strip().lower()
        if forum_type:
            query["forum_type"] = forum_type

        # Build the dynamic sort criteria
        # We use pymongo.DESCENDING (-1) so the highest/newest is always at the top
        sort_criteria = [(sort_by.value, pymongo.DESCENDING)]

        # Edge case: If they search by keyword, MongoDB needs to know if text relevance matters
        if keyword:
            if sort_by == SortBy.NEWEST:
                # Default text search: Most relevant text match first, then newest
                sort_criteria = [("score", {"$meta": "textScore"}), ("created_at", pymongo.DESCENDING)]
            else:
                # If they explicitly ask for MOST_LIKED on a keyword search, 
                # sort by likes first, then use text relevance as a tie-breaker
                sort_criteria = [(sort_by.value, pymongo.DESCENDING), ("score", {"$meta": "textScore"})]

        cursor = posts_col.find(query)
        
        # Apply our dynamic sort
        cursor = cursor.sort(sort_criteria).limit(50)
            
        return list(cursor)
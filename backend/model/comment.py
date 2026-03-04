import uuid
import pymongo
from datetime import datetime
from typing import List, Optional

from backend.util.dbconn import db

comments_col = db.comments
comment_likes_col = db.comment_likes
posts_col = db.posts  # Needed to update the post's comment_count

# Create an index to make loading comments for a specific post
comments_col.create_index([("post_id", pymongo.ASCENDING), ("created_at", pymongo.ASCENDING)])

class Comment:
    
    @staticmethod
    def add_comment(post_id: str, author_id: str, content: str, parent_comment_id: Optional[str] = None) -> str:
        """
        Adds a top-level comment OR a reply if parent_comment_id is provided.
        """
        comment_id = str(uuid.uuid4())
        
        comment_data = {
            "_id": comment_id,
            "post_id": post_id,
            "author_id": author_id,
            "parent_comment_id": parent_comment_id, # None = Top level comment, UUID = Reply
            "content": content.strip(),
            "like_count": 0,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        
        comments_col.insert_one(comment_data)
        
        # Increment the comment count on the original post
        posts_col.update_one({"_id": post_id}, {"$inc": {"comment_count": 1}})
        
        return comment_id

    @staticmethod
    def edit_comment(comment_id: str, author_id: str, new_content: str) -> bool:
        """
        Updates the comment text. Validates the author_id for security.
        """
        result = comments_col.update_one(
            {"_id": comment_id, "author_id": author_id},
            {"$set": {
                "content": new_content.strip(),
                "updated_at": datetime.now()
            }}
        )
        return result.modified_count > 0

    @staticmethod
    def delete_comment(comment_id: str, author_id: str, post_id: str) -> bool:
        """
        Reddit-style Soft Delete: 
        Instead of erasing the document (which breaks reply threads), 
        we scrub the content and author so the replies still make sense.
        """
        result = comments_col.update_one(
            {"_id": comment_id, "author_id": author_id},
            {"$set": {
                "content": "[Deleted by user]",
                "author_id": None, # Disconnect the user
                "updated_at": datetime.now()
            }}
        )
        
        if result.modified_count > 0:
            # We also decrease the post's comment count
            posts_col.update_one({"_id": post_id}, {"$inc": {"comment_count": -1}})
            # Clean up the likes for this specific comment to save space
            comment_likes_col.delete_many({"comment_id": comment_id})
            return True
            
        return False

    # like methods
    @staticmethod
    def toggle_like(comment_id: str, user_id: str) -> dict:
        """
        Exact same toggle logic we used for Posts
        """
        like_doc = {"comment_id": comment_id, "user_id": user_id}
        existing_like = comment_likes_col.find_one(like_doc)

        if existing_like:
            comment_likes_col.delete_one(like_doc)
            comments_col.update_one({"_id": comment_id}, {"$inc": {"like_count": -1}})
            return {"status": "unliked"}
        else:
            comment_likes_col.insert_one({**like_doc, "created_at": datetime.now()})
            comments_col.update_one({"_id": comment_id}, {"$inc": {"like_count": 1}})
            return {"status": "liked"}

    # get comment
    @staticmethod
    def get_post_comments(post_id: str) -> List[dict]:
        """
        Fetches all comments for a post. 
        Your frontend will use the `parent_comment_id` to visually nest the replies
        """
        cursor = comments_col.find({"post_id": post_id}).sort("created_at", pymongo.ASCENDING)
        return list(cursor)
# backend/model/admin.py

# backend/model/admin.py

from datetime import datetime
from typing import List

from backend.util.dbconn import db

users_col = db.users
posts_col = db.posts
comments_col = db.comments
tags_col = db.tags
likes_col = db.post_likes

class AdminManager:
    
    @staticmethod
    def combine_tags(old_tag_names: List[str], new_display_name: str) -> str:
        """
        Merges multiple tags into one.
        Example: old_tag_names=["Physic", "Physics"], new_display_name="Physic/Physics"
        """
        # Normalize the input
        old_ids = [name.strip().lower() for name in old_tag_names]
        new_id = new_display_name.strip().lower()
        
        # Calculate the combined popularity (usage_count) of the old tags
        old_tags = list(tags_col.find({"_id": {"$in": old_ids}}))
        combined_count = sum(t.get("usage_count", 1) for t in old_tags)
        
        # Create or update the NEW tag with the combined popularity
        tags_col.update_one(
            {"_id": new_id},
            {
                "$setOnInsert": {
                    "display_name": new_display_name.strip(),
                    "created_at": datetime.now()
                },
                "$inc": {"usage_count": combined_count},
                "$set": {"last_used_at": datetime.now()}
            },
            upsert=True
        )

        # Update ALL Posts: Remove old tags, add new tag
        posts_col.update_many(
            {"tags": {"$in": old_ids}},
            {
                "$pull": {"tags": {"$in": old_ids}},
                "$addToSet": {"tags": new_id} # $addToSet ensures no duplicates
            }
        )

        # Update ALL Users' interest_tags: Remove old tags, add new tag
        users_col.update_many(
            {"interest_tags": {"$in": old_ids}},
            {
                "$pull": {"interest_tags": {"$in": old_ids}},
                "$addToSet": {"interest_tags": new_id}
            }
        )

        # Delete the old tags from the database (unless the new tag IS one of the old ones)
        tags_to_delete = [tag_id for tag_id in old_ids if tag_id != new_id]
        if tags_to_delete:
            tags_col.delete_many({"_id": {"$in": tags_to_delete}})
            
        return new_id

    # delete method
    @staticmethod
    def delete_any_post(post_id: str) -> bool:
        """
        Admin override to delete a post, bypassing the author check.
        Also cleans up all associated likes and comments.
        """
        result = posts_col.delete_one({"_id": post_id})
        
        if result.deleted_count > 0:
            likes_col.delete_many({"post_id": post_id})
            comments_col.delete_many({"post_id": post_id}) # Delete the comment section too
            return True
        return False

    @staticmethod
    def delete_any_comment(comment_id: str) -> bool:
        """
        Admin override to completely remove a comment (not a soft-delete).
        """
        # find comment so we know which post to decrement the count for
        comment = comments_col.find_one({"_id": comment_id})
        if not comment:
            return False
            
        result = comments_col.delete_one({"_id": comment_id})
        
        if result.deleted_count > 0:
            # Fix the post's comment count
            posts_col.update_one({"_id": comment["post_id"]}, {"$inc": {"comment_count": -1}})
            # Delete likes for this comment
            db.comment_likes.delete_many({"comment_id": comment_id})
            return True
        return False
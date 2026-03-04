import uuid
from datetime import datetime
from typing import Dict, Any, List
from backend.util.dbconn import db
from backend.model.tag import TagManager

users_col = db.users
follows_col = db.follows
bookmarks_col = db.bookmarks

class User:
    def __init__(self, google_id: str, email: str, username: str, avatar_url: str = "", role: str = "user", _id: str = None):
        self.id = _id or str(uuid.uuid4())
        self.google_id = google_id
        self.email = email
        self.username = username
        self.avatar_url = avatar_url
        self.role = role
        self.profile = {} 
        self.created_at = datetime.now()
        self.last_login = datetime.now()
        self.interest_tags: List[str] = []

    def to_dict(self) -> dict:
        """Formats the object for MongoDB insertion (called by auth.py)"""
        return {
            "_id": self.id,
            "google_id": self.google_id,
            "email": self.email,
            "username": self.username,
            "avatar_url": self.avatar_url,
            "role": self.role,
            "profile": self.profile,
            "created_at": self.created_at,
            "last_login": self.last_login,
            "interest_tags": self.interest_tags
        }

    @classmethod
    def from_google_info(cls, user_info: dict):
        """
        Takes the user_info dictionary from your auth.py and returns a new User instance.
        """
        return cls(
            google_id=user_info.get("sub"),
            email=user_info.get("email"),
            username=user_info.get("name"),
            avatar_url=user_info.get("picture", ""),
            role="user"
        )

    def edit_profile(self, new_data: Dict[str, Any]):
        self.profile.update(new_data)
        users_col.update_one(
            {"_id": self.id},
            {"$set": {"profile": self.profile}}
        )

    def update_interests(self, raw_tags: List[str]):
        """
        Called when a user finishes onboarding or edits their profile.
        """
        clean_tags = TagManager.process_tags(raw_tags)
        self.interest_tags = clean_tags
        users_col.update_one(
            {"_id": self.id},
            {"$set": {"interest_tags": self.interest_tags}}
        )

    # follow methods
    def follow_user(self, target_user_id: str):
        follow_doc = {
            "_id": str(uuid.uuid4()),
            "follower_id": self.id,
            "followed_id": target_user_id,
            "created_at": datetime.now()
        }
        follows_col.update_one(
            {"follower_id": self.id, "followed_id": target_user_id}, 
            {"$set": follow_doc}, 
            upsert=True
        )

    def unfollow_user(self, target_user_id: str):
        follows_col.delete_one({"follower_id": self.id, "followed_id": target_user_id})

    def search_followed_users(self, search_term: str) -> List[dict]:
        following_cursor = follows_col.find({"follower_id": self.id}, {"followed_id": 1})
        following_ids = [doc["followed_id"] for doc in following_cursor]

        results = users_col.find({
            "_id": {"$in": following_ids},
            "username": {"$regex": search_term, "$options": "i"} 
        })
        return list(results)

    # bookmark methods
    def bookmark_post(self, post_id: str):
        bookmark_doc = {
            "_id": str(uuid.uuid4()),
            "user_id": self.id,
            "post_id": post_id,
            "created_at": datetime.now()
        }
        bookmarks_col.update_one(
            {"user_id": self.id, "post_id": post_id},
            {"$set": bookmark_doc},
            upsert=True
        )

    def delete_bookmark(self, post_id: str):
        bookmarks_col.delete_one({"user_id": self.id, "post_id": post_id})

    def search_bookmarks(self) -> List[str]:
        cursor = bookmarks_col.find({"user_id": self.id}).sort("created_at", -1)
        return [doc["post_id"] for doc in cursor]

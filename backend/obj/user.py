from typing import Optional, List, Set
from datetime import datetime

class User:
    def __init__(
        self, 
        username: str,
        email: str,
        google_id: str,  # Required: Only login method
        profile_picture_url: Optional[str] = None,
        interested_tags: Optional[List[str]] = None,
        bio: Optional[str] = "",
        created_at: Optional[str] = None
    ):
        # Identity & Profile
        self.username = username
        self.email = email
        self.google_id = google_id # Primary Key for Google OAuth
        self.profile_picture_url = profile_picture_url
        self.interested_tags = interested_tags or []
        self.bio = bio
        self.created_at = created_at or datetime.now().isoformat()

        # Reputation (Reddit-style Karma)
        self.post_karma = 0        # Reputation from Document uploads
        self.discussion_karma = 0  # Reputation from Topic discussions
        self.comment_karma = 0     # Reputation from Comments

        # Content Tracking (Scribd-style Library)
        self.uploaded_doc_ids: Set[str] = set()    # Documents published in 'Post'
        self.discussion_ids: Set[str] = set()      # Topics started in 'Discussion'
        self.bookmark_ids: Set[str] = set()        # Saved items from either forum
        
        # Social Graph
        self.follower_ids: Set[str] = set()
        self.following_ids: Set[str] = set()

    def to_dict(self):
        return {
            "username": self.username,
            "email": self.email,
            "google_id": self.google_id,
            "profile_picture_url": self.profile_picture_url,
            "interested_tags": self.interested_tags,
            "bio": self.bio,
            "post_karma": self.post_karma,
            "discussion_karma": self.discussion_karma,
            "comment_karma": self.comment_karma,
            "uploaded_doc_ids": list(self.uploaded_doc_ids),
            "discussion_ids": list(self.discussion_ids),
            "bookmark_ids": list(self.bookmark_ids),
            "follower_ids": list(self.follower_ids),
            "following_ids": list(self.following_ids),
            "created_at": self.created_at
        }
    
    @classmethod
    def from_dict(cls, data):
        user = cls(
            username=data.get("username"),
            email=data.get("email"),
            google_id=data.get("google_id"),
            profile_picture_url=data.get("profile_picture_url"),
            interested_tags=data.get("interested_tags"),
            bio=data.get("bio", ""),
            created_at=data.get("created_at")
        )
        user.post_karma = data.get("post_karma", 0)
        user.discussion_karma = data.get("discussion_karma", 0)
        user.comment_karma = data.get("comment_karma", 0)
        user.uploaded_doc_ids = set(data.get("uploaded_doc_ids", []))
        user.discussion_ids = set(data.get("discussion_ids", []))
        user.bookmark_ids = set(data.get("bookmark_ids", []))
        user.follower_ids = set(data.get("follower_ids", []))
        user.following_ids = set(data.get("following_ids", []))
        return user

    @classmethod
    def from_google_info(cls, user_info):
        return cls(
            username=user_info.get('name'),
            email=user_info.get('email'),
            google_id=user_info.get('sub'),
            profile_picture_url=user_info.get('picture')
        )

    def __repr__(self):
        return f"<User(username='{self.username}', email='{self.email}')>"
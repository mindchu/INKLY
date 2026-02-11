import uuid
from typing import Optional, List, Set
from datetime import datetime

class BaseContent:
    def __init__(
        self,
        author_id: str,
        text: str,
        file_paths: Optional[List[str]] = None,
        _id: Optional[str] = None,
        created_at: Optional[str] = None,
        liked_by_user_ids: Optional[List[str]] = None
    ):
        self.content_id = _id or str(uuid.uuid4())
        self.author_id = author_id
        self.text = text
        self.file_paths = file_paths or []
        self.created_at = created_at or datetime.utcnow().isoformat()
        # Convert list from Mongo back to Set for O(1) lookups
        self.liked_by_user_ids: Set[str] = set(liked_by_user_ids or [])

    @property
    def like_count(self) -> int:
        return len(self.liked_by_user_ids)

    def to_dict(self, include_secrets: bool = False) -> dict:
        """Common dictionary mapping for all content types."""
        data = {
            "_id": self.content_id,
            "author_id": self.author_id,
            "text": self.text,
            "file_paths": self.file_paths,
            "created_at": self.created_at,
            "like_count": self.like_count
        }
        if include_secrets:
            data["liked_by_user_ids"] = list(self.liked_by_user_ids)
        return data

# --- Specific Classes ---

class Post(BaseContent):
    def __init__(self, title: str, author_id: str, text: str, tags: Optional[List[str]] = None, **kwargs):
        super().__init__(author_id, text, **kwargs)
        self.title = title
        self.tags = tags or []
        self.download_count = kwargs.get("download_count", 0)
        self.comment_ids = kwargs.get("comment_ids", [])

    def to_dict(self, include_secrets: bool = False) -> dict:
        data = super().to_dict(include_secrets)
        data.update({
            "title": self.title,
            "type": "post",
            "tags": self.tags,
            "download_count": self.download_count,
            "comment_ids": self.comment_ids
        })
        return data

    @classmethod
    def from_dict(cls, data: dict):
        return cls(**data)

class Discussion(BaseContent):
    def __init__(self, title: str, author_id: str, text: str, tags: Optional[List[str]] = None, **kwargs):
        super().__init__(author_id, text, **kwargs)
        self.title = title
        self.tags = tags or []
        self.comment_ids = kwargs.get("comment_ids", [])

    def to_dict(self, include_secrets: bool = False) -> dict:
        data = super().to_dict(include_secrets)
        data.update({
            "title": self.title,
            "type": "discussion",
            "tags": self.tags,
            "comment_ids": self.comment_ids
        })
        return data

    @classmethod
    def from_dict(cls, data: dict):
        return cls(**data)

class Comment(BaseContent):
    def __init__(self, parent_id: str, author_id: str, text: str, **kwargs):
        super().__init__(author_id, text, **kwargs)
        self.parent_id = parent_id
        self.reply_ids = kwargs.get("reply_ids", [])

    def to_dict(self, include_secrets: bool = False) -> dict:
        data = super().to_dict(include_secrets)
        data.update({
            "parent_id": self.parent_id,
            "type": "comment",
            "reply_ids": self.reply_ids
        })
        return data

    @classmethod
    def from_dict(cls, data: dict):
        return cls(**data)
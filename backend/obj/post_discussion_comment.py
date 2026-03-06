import uuid
from typing import Optional, List
from datetime import datetime, timezone

class BaseContent:
    def __init__(
        self,
        author_id: str,
        text: str,
        file_paths: Optional[List[str]] = None,
        _id: Optional[str] = None,
        created_at: Optional[str] = None,
        like_count: int = 0
    ):
        self.content_id = _id or str(uuid.uuid4())
        self.author_id = author_id
        self.text = text
        self.file_paths = file_paths or []
        # Use timezone-aware UTC
        self.created_at = created_at or datetime.now(timezone.utc).isoformat()
        self.like_count = like_count

    def to_dict(self) -> dict:
        """Common dictionary mapping for all content types."""
        return {
            "_id": self.content_id,
            "author_id": self.author_id,
            "text": self.text,
            "file_paths": self.file_paths,
            "created_at": self.created_at,
            "like_count": self.like_count
        }

# --- Specific Classes ---

class Post(BaseContent):
    def __init__(self, title: str, author_id: str, text: str, tags: Optional[List[str]] = None, **kwargs):
        # Pop _id if it exists in kwargs to avoid double-passing to super
        _id = kwargs.pop("_id", None)
        super().__init__(author_id, text, _id=_id, **kwargs)
        self.title = title
        self.tags = tags or []
        self.comment_ids = kwargs.get("comment_ids", [])

    def to_dict(self) -> dict:
        data = super().to_dict()
        data.update({
            "title": self.title,
            "type": "post",
            "tags": self.tags,
            "comment_ids": self.comment_ids
        })
        return data

    @classmethod
    def from_dict(cls, data: dict):
        return cls(**data)

class Discussion(BaseContent):
    def __init__(self, title: str, author_id: str, text: str, tags: Optional[List[str]] = None, **kwargs):
        _id = kwargs.pop("_id", None)
        super().__init__(author_id, text, _id=_id, **kwargs)
        self.title = title
        self.tags = tags or []
        self.comment_ids = kwargs.get("comment_ids", [])

    def to_dict(self) -> dict:
        data = super().to_dict()
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
        _id = kwargs.pop("_id", None)
        super().__init__(author_id, text, _id=_id, **kwargs)
        self.parent_id = parent_id
        self.reply_ids = kwargs.get("reply_ids", [])

    def to_dict(self, include_secrets: bool = False) -> dict:
        try:
            data = super().to_dict(include_secrets=include_secrets)
        except TypeError:
            data = super().to_dict() 
            
        data.update({
            "parent_id": self.parent_id,
            "type": "comment",
            "reply_ids": self.reply_ids
        })
        return data

    @classmethod
    def from_dict(cls, data: dict):
        return cls(**data)
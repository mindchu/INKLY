from pydantic import BaseModel, Field
from typing import List, Optional

class CommentRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=1000)
    parent_id: Optional[str] = None

class ContentCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    text: str = Field(..., min_length=1, max_length=5000)
    type: str
    tags: List[str] = []

class ContentUpdate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    text: str = Field(..., min_length=1, max_length=5000)

from pydantic import BaseModel
from typing import List

class UserInterests(BaseModel):
    tags: List[str]

class ProfileUpdate(BaseModel):
    username: str
    bio: str
    interests: List[str] = []

class BioUpdate(BaseModel):
    bio: str

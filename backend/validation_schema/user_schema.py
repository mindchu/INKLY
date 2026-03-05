from pydantic import BaseModel
from typing import List

class ProfileUpdate(BaseModel):
    username: str
    bio: str
    interests: List[str] = []

class BioUpdate(BaseModel):
    bio: str

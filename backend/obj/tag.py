from typing import Optional
from datetime import datetime
import random

class Tag:
    def __init__(
        self,
        name: str,
        description: Optional[str] = "",
        color: Optional[str] = None,
        created_at: Optional[str] = None,
        created_by: Optional[str] = None,
        use_count: int = 0
    ):
        self.name = name
        self.description = description
        self.color = color or self._generate_random_color()
        self.created_at = created_at or datetime.utcnow().isoformat()
        self.created_by = created_by
        self.use_count = use_count

    def _generate_random_color(self) -> str:
        """Generates a pleasant pastel color."""
        # Selection of soft, pleasant colors
        colors = [
            "#E8F0E5", "#F5F7EF", "#EEF2E1", "#E3E8D9", 
            "#D9E6D4", "#F0F5ED", "#CDE9CE", "#E8FFDF"
        ]
        return random.choice(colors)

    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "description": self.description,
            "color": self.color,
            "created_at": self.created_at,
            "created_by": self.created_by,
            "use_count": self.use_count
        }

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            name=data.get("name"),
            description=data.get("description", ""),
            color=data.get("color"),
            created_at=data.get("created_at"),
            created_by=data.get("created_by"),
            use_count=data.get("use_count", 0)
        )

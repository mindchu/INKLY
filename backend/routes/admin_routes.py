from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List

from model.admin import AdminManager
from model.user import User
from routes.user_routes import get_current_user

router = APIRouter(prefix="/api/admin", tags=["Admin"])

def get_admin_user(user: User = Depends(get_current_user)) -> User:
    """
    First checks if the user is logged in (via get_current_user).
    Then checks if they have the admin role. 
    If not, it kicks them out with a 403 Forbidden error before the route even runs!
    """
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Stop right there! Admin privileges required.")
    return user

class CombineTagsRequest(BaseModel):
    old_tags: List[str]  # e.g., ["Physic", "Physics"]
    new_tag: str         # e.g., "Physic/Physics"

@router.post("/tags/combine")
async def combine_tags(data: CombineTagsRequest, admin: User = Depends(get_admin_user)):
    """
    Merges multiple similar tags into one, updating all users and posts instantly.
    Only accessible by admins.
    """
    if len(data.old_tags) < 2:
        raise HTTPException(status_code=400, detail="You must provide at least two tags to combine.")

    new_tag_id = AdminManager.combine_tags(
        old_tag_names=data.old_tags, 
        new_display_name=data.new_tag
    )
    
    return {
        "message": f"Successfully combined tags into '{data.new_tag}'", 
        "new_tag_id": new_tag_id
    }

@router.delete("/posts/{post_id}")
async def force_delete_post(post_id: str, admin: User = Depends(get_admin_user)):
    """
    Absolute deletion of any post and all its comments. Bypasses author checks.
    """
    success = AdminManager.delete_any_post(post_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Post not found")
        
    return {"message": "Post and all associated data permanently deleted by Admin."}

@router.delete("/comments/{comment_id}")
async def force_delete_comment(comment_id: str, admin: User = Depends(get_admin_user)):
    """
    Absolute deletion of a comment. (Not a soft-delete). Fixes the post's comment count too.
    """
    success = AdminManager.delete_any_comment(comment_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Comment not found")
        
    return {"message": "Comment permanently deleted by Admin."}
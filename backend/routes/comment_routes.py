from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional

from model.comment import Comment, comments_col
from model.user import User
from routes.user_routes import get_current_user

router = APIRouter(tags=["Comments"])

class CommentCreate(BaseModel):
    content: str
    parent_comment_id: Optional[str] = None  # Frontend sends this ONLY if it's a reply

class CommentEdit(BaseModel):
    content: str

@router.get("/api/posts/{post_id}/comments")
async def get_comments(post_id: str):
    """
    Fetches all comments for a specific post.
    The frontend will use the `parent_comment_id` field on each comment to thread them visually!
    """
    comments = Comment.get_post_comments(post_id)
    return {"comments": comments}

@router.post("/api/posts/{post_id}/comments")
async def add_new_comment(post_id: str, data: CommentCreate, user: User = Depends(get_current_user)):
    """Creates a new top-level comment or a threaded reply."""
    comment_id = Comment.add_comment(
        post_id=post_id,
        author_id=user.id,
        content=data.content,
        parent_comment_id=data.parent_comment_id
    )
    return {"message": "Comment added successfully", "comment_id": comment_id}

@router.put("/api/comments/{comment_id}")
async def edit_existing_comment(comment_id: str, data: CommentEdit, user: User = Depends(get_current_user)):
    """Edits a comment. Fails if the logged-in user isn't the author."""
    success = Comment.edit_comment(
        comment_id=comment_id, 
        author_id=user.id, 
        new_content=data.content
    )
    
    if not success:
        raise HTTPException(status_code=403, detail="Not authorized or comment not found")
        
    return {"message": "Comment updated successfully"}

@router.delete("/api/comments/{comment_id}")
async def delete_existing_comment(comment_id: str, user: User = Depends(get_current_user)):
    """
    Soft-deletes a comment (changes text to '[Deleted by user]').
    We have to fetch the comment first to know which post it belongs to, 
    so we can safely decrease the post's comment_count!
    """
    comment = comments_col.find_one({"_id": comment_id})
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    success = Comment.delete_comment(
        comment_id=comment_id, 
        author_id=user.id, 
        post_id=comment["post_id"]
    )
    
    if not success:
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")
        
    return {"message": "Comment deleted successfully"}

@router.post("/api/comments/{comment_id}/like")
async def toggle_comment_like(comment_id: str, user: User = Depends(get_current_user)):
    """Likes or unlikes a comment for the logged-in user."""
    result = Comment.toggle_like(comment_id=comment_id, user_id=user.id)
    return {"message": f"Comment {result['status']}"}
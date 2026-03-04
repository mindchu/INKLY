from fastapi import APIRouter, Depends, HTTPException, Query, Body
from pydantic import BaseModel
from typing import List, Optional

from model.post import Post, posts_col, ForumType, SortBy
from model.user import User
from routes.user_routes import get_current_user # Reusing our security check!

router = APIRouter(prefix="/api/posts", tags=["Posts"])

class PostCreate(BaseModel):
    title: str
    content: str
    forum_type: ForumType  # Validates that they only send "note" or "discussion"
    tags: List[str] = []
    attachment_url: str = "" # Send the URL after uploading via the FileManager

class PostEdit(BaseModel):
    title: str
    content: str
    tags: List[str] = []

@router.get("/")
async def get_posts(
    keyword: Optional[str] = Query(None, description="Search term"),
    tag: Optional[str] = Query(None, description="Filter by a specific tag"),
    forum: Optional[ForumType] = Query(None, description="Filter by note or discussion"),
    sort: SortBy = Query(SortBy.NEWEST, description="How to sort the results")
):
    """
    The main feed. The frontend can mix and match any of these query parameters!
    Example: /api/posts?forum=note&sort=like_count&tag=python
    """
    posts = Post.search_posts(
        keyword=keyword,
        tag_filter=tag,
        forum_type=forum.value if forum else None,
        sort_by=sort
    )
    return {"posts": posts}

@router.get("/{post_id}")
async def get_single_post(post_id: str):
    """Fetches a single post to display on its own page and increments the view count."""
    post = posts_col.find_one({"_id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    # Fire the view counter
    Post.increment_view(post_id)
    
    # Update the dictionary manually so the frontend gets the new view count instantly
    post["view_count"] += 1 
    return {"post": post}

@router.post("/")
async def create_new_post(data: PostCreate, user: User = Depends(get_current_user)):
    """Creates a new post. Requires the user to be logged in."""
    post_id = Post.create_post(
        author_id=user.id,
        forum_type=data.forum_type.value,
        title=data.title,
        content=data.content,
        raw_tags=data.tags,
        attachment_url=data.attachment_url
    )
    return {"message": "Post created successfully", "post_id": post_id}

@router.put("/{post_id}")
async def edit_existing_post(post_id: str, data: PostEdit, user: User = Depends(get_current_user)):
    """Updates a post. The model ensures only the author can do this."""
    success = Post.edit_post(
        post_id=post_id,
        author_id=user.id,
        new_title=data.title,
        new_content=data.content,
        new_raw_tags=data.tags
    )
    
    if not success:
        raise HTTPException(status_code=403, detail="Not authorized to edit this post or post not found")
        
    return {"message": "Post updated successfully"}

@router.delete("/{post_id}")
async def delete_existing_post(post_id: str, user: User = Depends(get_current_user)):
    """Deletes a post. The model ensures only the author can do this."""
    success = Post.delete_post(post_id=post_id, author_id=user.id)
    
    if not success:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post or post not found")
        
    return {"message": "Post deleted successfully"}

@router.post("/{post_id}/like")
async def toggle_post_like(post_id: str, user: User = Depends(get_current_user)):
    """Likes or unlikes a post for the logged-in user."""
    result = Post.toggle_like(post_id=post_id, user_id=user.id)
    return {"message": f"Post {result['status']}"}

@router.post("/{post_id}/share")
async def share_post(post_id: str):
    """Increments the share counter. Doesn't require login."""
    share_url = Post.share_post(post_id)
    return {"message": "Share count incremented", "url": share_url}
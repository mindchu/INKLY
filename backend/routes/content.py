from fastapi import APIRouter, Request, HTTPException, UploadFile, File, Form, Query
from typing import List, Optional
import uuid
from middleware.auth import require_auth
from middleware.validate import validate
from validation_schema.content_schema import ContentCreate, CommentRequest, ContentUpdate
from util import content as content_util, files as file_util, tags as tags_util
from util.dbconn import db

router = APIRouter(tags=["content"])

@router.get("/tags/popular")
async def get_popular_tags():
    return {"tags": tags_util.get_popular_tags()}

@router.get("/tags/all")
async def get_all_tags():
    # Fetch all tags from the tags collection with full metadata
    all_tags = list(db.tags.find().sort("name", 1))
    for t in all_tags:
        t["_id"] = str(t["_id"])
    return {"tags": all_tags}

@router.post("/content")
async def create_new_content(
    request: Request,
    title: str = Form(...),
    text: str = Form(...),
    type: str = Form(...),
    tags: List[str] = Form([]),
    files: List[UploadFile] = File(None)
):
    require_auth(request)
    # Validate form data using the dictionary approach
    form_data = {
        "title": title,
        "text": text,
        "type": type,
        "tags": tags
    }
    validated_content = validate(form_data, ContentCreate)
    
    user = request.session.get('user')
    content_id = str(uuid.uuid4())
    file_paths = []
    
    if files:
        for file in files:
            filename = file_util.save_upload(file, user['username'])
            file_paths.append(filename)
            
    content_data = {
        "title": title,
        "text": text,
        "type": type,
        "tags": tags,
        "file_paths": file_paths
    }
    
    result = content_util.create_content(content_data, user['google_id'], _id=content_id)
    if result:
        return {"success": True, "data": result}
    else:
        raise HTTPException(status_code=500, detail="Failed to create content")

@router.get("/uploads/{filename}")
async def get_uploaded_file(filename: str):
    from fastapi.responses import StreamingResponse
    from util.dbconn import fs
    
    grid_out = fs.find_one({"filename": filename})
    if not grid_out:
        raise HTTPException(status_code=404, detail="File not found")
    
    def iterfile():
        yield from grid_out
        
    content_type = grid_out.metadata.get("content_type", "application/octet-stream") if grid_out.metadata else "application/octet-stream"
    return StreamingResponse(iterfile(), media_type=content_type)

@router.get("/content/recommended")
async def get_recommended(request: Request, sort: str = 'likes', tags: Optional[List[str]] = Query(None), type: Optional[str] = Query(None), skip: int = Query(0), limit: int = Query(10)):
    user = request.session.get('user')
    user_id = user['google_id'] if user else None
    recommended = content_util.get_recommended_content(user_id, sort_by=sort, filter_tags=tags, content_type=type, skip=skip, limit=limit)
    return {"data": recommended}

@router.get("/content/{content_id}")
async def get_content_detail(content_id: str, request: Request):
    user = request.session.get('user')
    user_id = user['google_id'] if user else None
    
    item = content_util.get_content_by_id(content_id, user_id=user_id)
    if not item:
        raise HTTPException(status_code=404, detail="Content not found")
    comments = content_util.get_comment_tree(content_id)
    return {"data": item, "comments": comments}

@router.get("/bookmarks")
async def get_bookmarks_route(request: Request):
    user = require_auth(request)
    bookmarks = content_util.get_user_bookmarks(user['google_id'])
    return {"data": bookmarks}

@router.get("/search")
async def search_content(
    request: Request,
    q: str = Query("", description="Search text"),
    tags: List[str] = Query(None, description="Filter by tags"),
    exclude_tags: List[str] = Query(None, description="Exclude tags"),
    sort_by: str = Query("recent", description="recent or popular"),
    scope: str = Query("all", description="search scope: all, bookmarks, following, or owned"),
    skip: int = Query(0, description="Number of items to skip"),
    limit: int = Query(10, description="Max number of items to return")
):
    user = request.session.get('user')
    user_id = user['google_id'] if user else None
    results = content_util.get_search_results(user_id, q, tags, exclude_tags, sort_by, scope, skip, limit)
    return {"data": results}


@router.post("/content/{content_id}/comment")
async def add_comment(content_id: str, comment_data: dict, request: Request):
    user = require_auth(request)
    comment_req = validate(comment_data, CommentRequest)
    # Use parent_id from request if provided, otherwise default to content_id
    parent_id = comment_req.parent_id if comment_req.parent_id else content_id
    result = content_util.create_comment(parent_id, user['google_id'], comment_req.text)
    if result:
        return {"success": True, "data": result}
    else:
        raise HTTPException(status_code=500, detail="Failed to create comment")

@router.post("/content/{content_id}/like")
async def toggle_content_like(content_id: str, request: Request):
    user = require_auth(request)
    result = content_util.toggle_like(content_id, user['google_id'])
    if result is None:
        raise HTTPException(status_code=404, detail="Content not found")
    return {"success": True, "is_liked": result}

@router.delete("/content/{content_id}")
async def delete_content(content_id: str, request: Request):
    user = require_auth(request)
    result = content_util.delete_content(content_id, user['google_id'])
    if not result:
        raise HTTPException(status_code=403, detail="Not authorized or content not found")
    return {"success": True}

@router.put("/content/{content_id}")
async def update_content_route(content_id: str, content_data: dict, request: Request):
    user = require_auth(request)
    update_req = validate(content_data, ContentUpdate)
    
    # Check ownership
    doc = db.posts.find_one({"_id": content_id})
    collection = db.posts
    if not doc:
        doc = db.discussions.find_one({"_id": content_id})
        collection = db.discussions
    
    if not doc:
        raise HTTPException(status_code=404, detail="Content not found")
        
    if doc.get('author_id') != user['google_id']:
        raise HTTPException(status_code=403, detail="Not authorized to edit this content")
        
    update_data = {"title": update_req.title, "text": update_req.text}
    
    # Regenerate embedding if title changed
    if doc.get('title') != update_req.title:
        from util.embeddings import embedding_manager
        update_data['title_embedding'] = embedding_manager.generate_embedding(update_req.title)
    
    db.posts.update_one({"_id": content_id}, {"$set": update_data})
    db.discussions.update_one({"_id": content_id}, {"$set": update_data})
    
    return {"success": True}

@router.delete("/content/{content_id}/comment/{comment_id}")
async def delete_comment(content_id: str, comment_id: str, request: Request):
    user = require_auth(request)
    result = content_util.delete_comment(comment_id, user['google_id'])
    if not result:
        raise HTTPException(status_code=403, detail="Not authorized or comment not found")
    return {"success": True}

@router.post("/bookmarks/{content_id}")
async def toggle_bookmark_route(content_id: str, request: Request):
    user = require_auth(request)
    result = content_util.toggle_bookmark(user['google_id'], content_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Content or User not found")
    return {"success": True, "is_bookmarked": result}

@router.post("/content/{content_id}/comment/{comment_id}/like")
async def toggle_comment_like(content_id: str, comment_id: str, request: Request):
    user = require_auth(request)
    result = content_util.toggle_like(comment_id, user['google_id'])
    if result is None:
        raise HTTPException(status_code=404, detail="Comment not found")
    return {"success": True, "is_liked": result}

@router.get("/content/{content_id}/comment/{comment_id}")
async def get_comment_thread(content_id: str, comment_id: str, request: Request):
    user = request.session.get('user')
    user_id = user['google_id'] if user else None
    
    # 1. Fetch the anchor comment
    comment = db.comments.find_one({"_id": comment_id})
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    comment['_id'] = str(comment['_id'])
    # 2. Add metadata (likes, author info)
    liked_by = comment.get('liked_by_user_ids', [])
    comment['likes_count'] = len(liked_by)
    comment['is_liked'] = user_id in liked_by if user_id else False
    
    author = db.users.find_one({"google_id": comment.get('author_id')}, {"username": 1, "profile_picture_url": 1})
    comment['author_username'] = author.get('username', 'Unknown') if author else 'Unknown'
    comment['author_profile_picture_url'] = author.get('profile_picture_url') if author else None
    
    # 3. Fetch its subtree
    replies = content_util.get_comment_tree(comment_id)
    
    # 4. Fetch the parent content title
    content_doc = db.posts.find_one({"_id": content_id}, {"title": 1})
    if not content_doc:
        content_doc = db.discussions.find_one({"_id": content_id}, {"title": 1})
        
    content_title = content_doc.get('title', 'Unknown Content') if content_doc else 'Unknown Content'
    
    return {"data": comment, "replies": replies, "content_title": content_title}

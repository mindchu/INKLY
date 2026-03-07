from fastapi import APIRouter, Request, HTTPException, UploadFile, File, Form, Query
from typing import List, Optional
import uuid
from middleware.auth import require_auth
from middleware.validate import validate
from validation_schema.content_schema import ContentCreate, CommentRequest, ContentUpdate
from util import content as content_util, files as file_util, tags as tags_util
from util.dbconn import db, fs
from fastapi.responses import StreamingResponse

router = APIRouter(tags=["content"])

@router.get("/tags/popular")
async def get_popular_tags():
    return {"tags": tags_util.get_popular_tags()}

@router.get("/tags/all")
async def get_all_tags():
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
    grid_out = fs.find_one({"filename": filename})
    if not grid_out:
        raise HTTPException(status_code=404, detail="File not found")
    
    def iterfile():
        yield from grid_out
        
    content_type = grid_out.metadata.get("content_type", "application/octet-stream") if grid_out.metadata else "application/octet-stream"
    return StreamingResponse(iterfile(), media_type=content_type)

@router.get("/content/recommended")
async def get_recommended(
    request: Request,
    sort: str = 'recent',
    tags: Optional[List[str]] = Query(None),
    exclude_tags: Optional[List[str]] = Query(None),  # NEW
    type: Optional[str] = Query(None),
    skip: int = Query(0),
    limit: int = Query(10)
):
    user = request.session.get('user')
    user_id = user['google_id'] if user else None
    recommended = content_util.get_recommended_content(
        user_id,
        sort_by=sort,
        filter_tags=tags,
        exclude_tags=exclude_tags,  # NEW
        content_type=type,
        skip=skip,
        limit=limit
    )
    return {"data": recommended}

@router.get("/content/{content_id}")
async def get_content_detail(content_id: str, request: Request):
    user = request.session.get('user')
    user_id = user['google_id'] if user else None
    item = content_util.get_content_by_id(content_id, user_id=user_id)
    if not item:
        raise HTTPException(status_code=404, detail="Content not found")
    comments = content_util.get_comment_tree(content_id, user_id=user_id) 
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
    sort_by: str = Query("recent", description="recent, views, likes, or comments"),
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
async def update_content(
    content_id: str,
    request: Request,
    title: str = Form(...),
    text: str = Form(...),
    type: str = Form(...),
    tags: List[str] = Form(default=[]),
    existing_file_paths: List[str] = Form(default=[]), 
    license_agreement: bool = Form(default=False), # ADD THIS LINE!
    files: Optional[List[UploadFile]] = File(default=None)
):
    user = request.session.get('user')
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
        
    user_id = user['google_id']
    uploader_name = user.get('name', 'Unknown_User')

    original_post = content_util.get_content_by_id(content_id)
    if not original_post or original_post.get('author_id') != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this content")

    new_file_paths = []
    if files:
        for file in files:
            if file.filename != "": 
                saved_filename = file_util.save_upload(file, uploader_name)
                new_file_paths.append(saved_filename)

    final_file_paths = existing_file_paths + new_file_paths
    updated_data = {
        "title": title,
        "text": text,
        "type": type,
        "tags": tags,
        "file_paths": final_file_paths
    }
    
    success = content_util.update_content_in_db(content_id, updated_data)
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update database")

    return {"success": True, "message": "Content updated successfully!", "file_paths": final_file_paths}

@router.delete("/comment/{comment_id}")
async def delete_comment(comment_id: str, request: Request):
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

@router.post("/comment/{comment_id}/like")
async def toggle_comment_like(comment_id: str, request: Request):
    user = require_auth(request)
    result = content_util.toggle_comment_like(comment_id, user['google_id'])
    if result is None:
        raise HTTPException(status_code=404, detail="Comment not found")
    return {"success": True, "is_liked": result}

@router.get("/content/{content_id}/comment/{comment_id}")
async def get_comment_thread(content_id: str, comment_id: str, request: Request):
    user = request.session.get('user')
    user_id = user['google_id'] if user else None
    comment = db.comments.find_one({"_id": comment_id})
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    comment['_id'] = str(comment['_id'])
    comment['like_count'] = comment.get('like_count', 0)
    if user_id:
        user_like = db.likes.find_one({
            "target_id": comment_id, 
            "user_id": user_id, 
            "type": "comment"
        })
        comment['is_liked'] = bool(user_like)
    else:
        comment['is_liked'] = False
    
    author = db.users.find_one({"google_id": comment.get('author_id')}, {"username": 1, "profile_picture_url": 1})
    comment['author_username'] = author.get('username', 'Unknown') if author else 'Unknown'
    comment['author_profile_picture_url'] = author.get('profile_picture_url') if author else None  
    
    comment.pop('liked_by_user_ids', None)
    comment.pop('comment_ids', None)
    comment.pop('reply_ids', None)
    if 'author_id' in comment:
        comment['author_id'] = str(comment['author_id'])
    replies = content_util.get_comment_tree(comment_id, user_id)
    content_doc = db.posts.find_one({"_id": content_id}, {"title": 1})
    if not content_doc:
        content_doc = db.discussions.find_one({"_id": content_id}, {"title": 1})
        
    content_title = content_doc.get('title', 'Unknown Content') if content_doc else 'Unknown Content'
    
    return {"data": comment, "replies": replies, "content_title": content_title}


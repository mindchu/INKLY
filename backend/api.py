from fastapi import APIRouter, Request, HTTPException, UploadFile, File, Form, Query
from starlette.responses import RedirectResponse
from util import auth, tags
import os
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

FRONTEND_PORT = os.getenv('FRONTEND_PORT', 5173)
API_HOST = os.getenv('API_HOST', 'localhost')
FRONTEND_URL = f"http://{API_HOST}:{FRONTEND_PORT}"

@router.get("/login/google")
async def login_google(request: Request):
    return await auth.login(request)

class UserInterests(BaseModel):
    tags: List[str]

@router.get("/tags/popular")
async def get_popular_tags():
    return {"tags": tags.get_popular_tags()}

@router.post("/users/me/interests")
async def update_user_interests(interests: UserInterests, request: Request):
    user = request.session.get('user')
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Update in DB
    success = tags.update_user_interests(user['google_id'], interests.tags)
    
    # Update session with new tags
    if success:
        # We need to fetch the full user object or just update the session blindly if we trust the input.
        # For simplicity, let's just update the specific field in the session if it existed in the simplified session user
        # But wait, the session 'user' is just what google returned usually. 
        # Let's double check auth.py. 
        # Actually, let's just return success and let the client reload /users/me if needed.
        pass

    return {"success": success, "interests": interests.tags}

@router.get("/auth/google")
async def auth_google(request: Request):
    user_data = await auth.authenticate(request)

    # Set session
    request.session['user'] = user_data
    
    redirect_url = f'{FRONTEND_URL}/'
    if user_data.get('is_new'):
        redirect_url = f'{FRONTEND_URL}/interests'
        
    return RedirectResponse(url=redirect_url)

@router.get("/logout")
async def logout(request: Request):
    request.session.pop('user', None)
    return RedirectResponse(url=f'{FRONTEND_URL}/')

@router.get("/users/me")
async def get_current_user(request: Request):
    user_session = request.session.get('user')
    if not user_session:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    from util.dbconn import db
    user_data = db.users.find_one({"google_id": user_session['google_id']})
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
        
    user_data['_id'] = str(user_data['_id'])
    return user_data

@router.get("/users/{user_id}")
async def get_user_by_id(user_id: str):
    from util.dbconn import db
    user_data = db.users.find_one({"google_id": user_id})
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_data['_id'] = str(user_data['_id'])
    # Optional: filter sensitive fields if any (email is already public in current UI)
    return user_data

@router.get("/users/{user_id}/posts")
async def get_user_posts(user_id: str):
    from util.dbconn import db
    
    # Fetch all posts by this user
    posts = list(db.posts.find({"author_id": user_id}))
    
    for post in posts:
        post['_id'] = str(post['_id'])
        # Fetch author username
        author = db.users.find_one({"google_id": post.get('author_id')}, {"username": 1})
        post['author_username'] = author.get('username', 'Unknown') if author else 'Unknown'
    
    # Sort by creation date, newest first
    posts.sort(key=lambda x: x.get('created_at', ''), reverse=True)
    
    return {"data": posts}

@router.get("/users/{user_id}/discussions")
async def get_user_discussions(user_id: str):
    from util.dbconn import db
    
    # Fetch all discussions by this user
    discussions = list(db.discussions.find({"author_id": user_id}))
    
    for discussion in discussions:
        discussion['_id'] = str(discussion['_id'])
        # Fetch author username
        author = db.users.find_one({"google_id": discussion.get('author_id')}, {"username": 1})
        discussion['author_username'] = author.get('username', 'Unknown') if author else 'Unknown'
    
    # Sort by creation date, newest first
    discussions.sort(key=lambda x: x.get('created_at', ''), reverse=True)
    
    return {"data": discussions}

@router.get("/users/{user_id}/followers")
async def get_user_followers(user_id: str):
    from util.dbconn import db
    
    # Get the user to access their follower_ids
    user = db.users.find_one({"google_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    follower_ids = user.get('follower_ids', [])
    
    # Fetch user details for each follower
    followers = []
    for follower_id in follower_ids:
        follower = db.users.find_one({"google_id": follower_id})
        if follower:
            followers.append({
                "google_id": follower.get('google_id'),
                "username": follower.get('username'),
                "profile_picture_url": follower.get('profile_picture_url'),
                "bio": follower.get('bio', '')
            })
    
    return {"data": followers}

@router.get("/users/{user_id}/following")
async def get_user_following(user_id: str):
    from util.dbconn import db
    
    # Get the user to access their following_ids
    user = db.users.find_one({"google_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    following_ids = user.get('following_ids', [])
    
    # Fetch user details for each following
    following = []
    for following_id in following_ids:
        followed_user = db.users.find_one({"google_id": following_id})
        if followed_user:
            following.append({
                "google_id": followed_user.get('google_id'),
                "username": followed_user.get('username'),
                "profile_picture_url": followed_user.get('profile_picture_url'),
                "bio": followed_user.get('bio', '')
            })
    
    return {"data": following}


class BioUpdate(BaseModel):
    bio: str

@router.put("/users/me/bio")
async def update_user_bio(bio_update: BioUpdate, request: Request):
    user_session = request.session.get('user')
    if not user_session:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    from util.dbconn import db
    result = db.users.update_one(
        {"google_id": user_session['google_id']},
        {"$set": {"bio": bio_update.bio}}
    )
    
    if result.modified_count > 0 or result.matched_count > 0:
        return {"success": True, "bio": bio_update.bio}
    else:
        raise HTTPException(status_code=500, detail="Failed to update bio")

@router.post("/users/{target_user_id}/follow")
async def toggle_follow(target_user_id: str, request: Request):
    user_session = request.session.get('user')
    if not user_session:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    current_user_id = user_session['google_id']
    
    # Can't follow yourself
    if current_user_id == target_user_id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")
    
    from util.dbconn import db
    
    # Check if target user exists
    target_user = db.users.find_one({"google_id": target_user_id})
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if already following
    current_user = db.users.find_one({"google_id": current_user_id})
    is_following = target_user_id in current_user.get('following_ids', [])
    
    if is_following:
        # Unfollow
        db.users.update_one(
            {"google_id": current_user_id},
            {"$pull": {"following_ids": target_user_id}}
        )
        db.users.update_one(
            {"google_id": target_user_id},
            {"$pull": {"follower_ids": current_user_id}}
        )
        return {"success": True, "is_following": False}
    else:
        # Follow
        db.users.update_one(
            {"google_id": current_user_id},
            {"$addToSet": {"following_ids": target_user_id}}
        )
        db.users.update_one(
            {"google_id": target_user_id},
            {"$addToSet": {"follower_ids": current_user_id}}
        )
        return {"success": True, "is_following": True}


@router.post("/content")
async def create_new_content(
    request: Request,
    title: str = Form(...),
    text: str = Form(...),
    type: str = Form(...),
    tags: List[str] = Form([]),
    files: List[UploadFile] = File(None)
):
    from util import content, files as file_util
    import uuid

    user = request.session.get('user')
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    content_id = str(uuid.uuid4())
    file_paths = []
    
    if files:
        for file in files:
            filename = file_util.save_upload(file, content_id)
            file_paths.append(filename)
            
    content_data = {
        "title": title,
        "text": text,
        "type": type,
        "tags": tags,
        "file_paths": file_paths
    }
    
    result = content.create_content(content_data, user['google_id'], _id=content_id)
    
    if result:
        return {"success": True, "data": result}
    else:
        raise HTTPException(status_code=500, detail="Failed to create content")

@router.get("/uploads/{filename}")
async def get_uploaded_file(filename: str):
    from fastapi.responses import FileResponse
    from util.files import UPLOAD_DIR
    
    file_path = os.path.join(UPLOAD_DIR, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    raise HTTPException(status_code=404, detail="File not found")

@router.get("/content/recommended")
async def get_recommended(request: Request, sort: str = 'likes', tags: Optional[List[str]] = Query(None), type: Optional[str] = Query(None)):
    from util import content
    
    user = request.session.get('user')
    user_id = user['google_id'] if user else None
    
    recommended = content.get_recommended_content(user_id, sort_by=sort, filter_tags=tags, content_type=type)
    return {"data": recommended}

@router.get("/content/{content_id}")
async def get_content_detail(content_id: str):
    from util import content
    
    item = content.get_content_by_id(content_id)
    if not item:
        raise HTTPException(status_code=404, detail="Content not found")
        
    comments = content.get_comment_tree(content_id)
    return {"data": item, "comments": comments}

class CommentRequest(BaseModel):
    text: str

@router.post("/content/{content_id}/comment")
async def add_comment(content_id: str, comment_req: CommentRequest, request: Request):
    from util import content
    
    user = request.session.get('user')
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
        
    result = content.create_comment(content_id, user['google_id'], comment_req.text)
    if result:
        return {"success": True, "data": result}
    else:
        raise HTTPException(status_code=500, detail="Failed to create comment")
@router.post("/content/{content_id}/like")
async def toggle_content_like(content_id: str, request: Request):
    from util import content
    
    user = request.session.get('user')
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
        
    result = content.toggle_like(content_id, user['google_id'])
    if result is None:
        raise HTTPException(status_code=404, detail="Content not found")
        
    return {"success": True, "is_liked": result}

@router.delete("/content/{content_id}")
async def delete_content(content_id: str, request: Request):
    from util import content
    
    user = request.session.get('user')
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    result = content.delete_content(content_id, user['google_id'])
    if not result:
        raise HTTPException(status_code=403, detail="Not authorized or content not found")
    
    return {"success": True}

@router.delete("/content/{content_id}/comment/{comment_id}")
async def delete_comment(content_id: str, comment_id: str, request: Request):
    from util import content
    
    user = request.session.get('user')
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    result = content.delete_comment(comment_id, user['google_id'])
    if not result:
        raise HTTPException(status_code=403, detail="Not authorized or comment not found")
    
    return {"success": True}


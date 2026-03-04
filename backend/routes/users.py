from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import List
from middleware.auth import require_auth
from middleware.validate import validate
from validation_schema.user_schema import UserInterests, BioUpdate, ProfileUpdate
from util import tags, files as file_util
from util.admin import is_user_admin
from util.dbconn import db
from fastapi import UploadFile, File

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/me/interests")
async def update_user_interests(interests_data: dict, request: Request):
    require_auth(request)
    interests = validate(interests_data, UserInterests)
    user = request.session.get('user')
    success = tags.update_user_interests(user['google_id'], interests.tags)
    return {"success": success, "interests": interests.tags}

@router.get("/me")
async def get_current_user(request: Request):
    user_session = require_auth(request)
    user_data = db.users.find_one({"google_id": user_session['google_id']})
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    user_data['_id'] = str(user_data['_id'])
    user_data['is_admin'] = is_user_admin(user_session['google_id'])
    return user_data

@router.post("/me/toggle-admin")
async def toggle_admin_status(request: Request):
    user_session = require_auth(request)
    user_id = user_session['google_id']
    is_admin = is_user_admin(user_id)
    
    if is_admin:
        db.admins.delete_one({"google_id": user_id})
        return {"success": True, "is_admin": False}
    else:
        db.admins.insert_one({"google_id": user_id})
        return {"success": True, "is_admin": True}

@router.get("/{user_id}")
async def get_user_by_id(user_id: str):
    user_data = db.users.find_one({"google_id": user_id})
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    user_data['_id'] = str(user_data['_id'])
    return user_data

@router.get("/{user_id}/posts")
async def get_user_posts(user_id: str):
    posts = list(db.posts.find({"author_id": user_id}))
    for post in posts:
        post['_id'] = str(post['_id'])
        author = db.users.find_one({"google_id": post.get('author_id')}, {"username": 1, "profile_picture_url": 1})
        post['author_username'] = author.get('username', 'Unknown') if author else 'Unknown'
        post['author_profile_picture_url'] = author.get('profile_picture_url') if author else None
    posts.sort(key=lambda x: x.get('created_at', ''), reverse=True)
    return {"data": posts}

@router.get("/{user_id}/discussions")
async def get_user_discussions(user_id: str):
    discussions = list(db.discussions.find({"author_id": user_id}))
    for discussion in discussions:
        discussion['_id'] = str(discussion['_id'])
        author = db.users.find_one({"google_id": discussion.get('author_id')}, {"username": 1, "profile_picture_url": 1})
        discussion['author_username'] = author.get('username', 'Unknown') if author else 'Unknown'
        discussion['author_profile_picture_url'] = author.get('profile_picture_url') if author else None
    discussions.sort(key=lambda x: x.get('created_at', ''), reverse=True)
    return {"data": discussions}

@router.get("/{user_id}/followers")
async def get_user_followers(user_id: str):
    user = db.users.find_one({"google_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    follower_ids = user.get('follower_ids', [])
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

@router.get("/{user_id}/following")
async def get_user_following(user_id: str):
    user = db.users.find_one({"google_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    following_ids = user.get('following_ids', [])
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

@router.put("/me/bio")
async def update_user_bio(bio_data: dict, request: Request):
    user_session = require_auth(request)
    bio_update = validate(bio_data, BioUpdate)
    result = db.users.update_one(
        {"google_id": user_session['google_id']},
        {"$set": {"bio": bio_update.bio}}
    )
    if result.modified_count > 0 or result.matched_count > 0:
        return {"success": True, "bio": bio_update.bio}
    else:
        raise HTTPException(status_code=500, detail="Failed to update bio")

@router.put("/me/profile")
async def update_user_profile(profile_data: dict, request: Request):
    user_session = require_auth(request)
    profile_update = validate(profile_data, ProfileUpdate)
    
    # Check username uniqueness: find anyone else with this username
    existing_user = db.users.find_one({
        "username": profile_update.username,
        "google_id": {"$ne": user_session['google_id']}
    })
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")

    result = db.users.update_one(
        {"google_id": user_session['google_id']},
        {"$set": {
            "username": profile_update.username,
            "bio": profile_update.bio,
            "interested_tags": profile_update.interests
        }}
    )
    return {"success": True, "username": profile_update.username, "bio": profile_update.bio, "interests": profile_update.interests}

@router.post("/me/avatar")
async def upload_avatar(request: Request, file: UploadFile = File(...)):
    user_session = require_auth(request)
    
    # Reuse file saving logic
    filename = file_util.save_upload(file, user_session['username'])
    avatar_url = f"/api/uploads/{filename}" # Assuming prefix /api matches frontend expectations
    
    db.users.update_one(
        {"google_id": user_session['google_id']},
        {"$set": {"profile_picture_url": avatar_url}}
    )
    
    return {"success": True, "profile_picture_url": avatar_url}

@router.post("/{target_user_id}/follow")
async def toggle_follow(target_user_id: str, request: Request):
    user_session = require_auth(request)
    current_user_id = user_session['google_id']
    if current_user_id == target_user_id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")
    target_user = db.users.find_one({"google_id": target_user_id})
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    current_user = db.users.find_one({"google_id": current_user_id})
    is_following = target_user_id in current_user.get('following_ids', [])
    if is_following:
        db.users.update_one({"google_id": current_user_id}, {"$pull": {"following_ids": target_user_id}})
        db.users.update_one({"google_id": target_user_id}, {"$pull": {"follower_ids": current_user_id}})
        return {"success": True, "is_following": False}
    else:
        db.users.update_one({"google_id": current_user_id}, {"$addToSet": {"following_ids": target_user_id}})
        db.users.update_one({"google_id": target_user_id}, {"$addToSet": {"follower_ids": current_user_id}})
        return {"success": True, "is_following": True}

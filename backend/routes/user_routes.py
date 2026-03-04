from fastapi import APIRouter, Request, HTTPException, Depends, UploadFile, File
from pydantic import BaseModel
from typing import Dict, Any, List

# Import your database and models
from model.user import User, users_col
from model.file_manager import FileManager

router = APIRouter(prefix="/api/users", tags=["Users"])

def get_current_user(request: Request) -> User:
    """
    Checks the session cookie from your auth.py. 
    If logged in, fetches their data from MongoDB and returns a Python User object.
    """
    session_user = request.session.get("user")
    if not session_user:
        raise HTTPException(status_code=401, detail="Not logged in")
        
    user_doc = users_col.find_one({"_id": session_user["_id"]})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found in database")
        
    # Rebuild the User object so we can use its methods
    user = User(
        google_id=user_doc["google_id"],
        email=user_doc["email"],
        username=user_doc["username"],
        avatar_url=user_doc["avatar_url"],
        _id=user_doc["_id"]
    )
    user.profile = user_doc.get("profile", {})
    user.interest_tags = user_doc.get("interest_tags", [])
    return user

class ProfileUpdateData(BaseModel):
    bio: str = ""
    github: str = ""
    location: str = ""
    # Add anything else your frontend UI collects here

class InterestTagsUpdate(BaseModel):
    tags: List[str]

@router.get("/me")
async def get_my_profile(user: User = Depends(get_current_user)):
    """Frontend calls this on page load to display the user's info."""
    return user.to_dict()

@router.put("/me/profile")
async def update_profile_text(data: ProfileUpdateData, user: User = Depends(get_current_user)):
    """Frontend sends JSON here when the user clicks 'Save Profile'."""
    # Convert the Pydantic model to a dictionary, excluding empty fields if you want
    new_profile_data = data.dict(exclude_unset=True) 
    
    # Call the method we wrote in user.py
    user.edit_profile(new_profile_data)
    
    return {"message": "Profile updated successfully", "profile": user.profile}

@router.put("/me/interests")
async def update_my_interests(data: InterestTagsUpdate, user: User = Depends(get_current_user)):
    """Frontend sends an array of strings here for the interest tags."""
    user.update_interests(data.tags)
    return {"message": "Interests updated", "interest_tags": user.interest_tags}

@router.put("/me/avatar")
async def upload_new_avatar(file: UploadFile = File(...), user: User = Depends(get_current_user)):
    """Frontend uploads an image file here to change the profile picture."""
    # 1. Save the file using the FileManager we built
    new_avatar_url = await FileManager.upload_file(file, subfolder="avatars")
    
    # 2. Update the user's avatar_url in the database
    users_col.update_one(
        {"_id": user.id},
        {"$set": {"avatar_url": new_avatar_url}}
    )
    
    return {"message": "Profile picture updated", "avatar_url": new_avatar_url}
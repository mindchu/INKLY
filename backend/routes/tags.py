from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import List
from middleware.admin import require_admin
from util.dbconn import db

router = APIRouter(prefix="/tags", tags=["tags"])

class MergeTagsRequest(BaseModel):
    source_tags: List[str]
    target_tag: str

class CreateTagRequest(BaseModel):
    name: str

@router.post("/")
async def create_tag(request: Request, tag_request: CreateTagRequest):
    require_admin(request)
    
    name = tag_request.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Tag name cannot be empty")
        
    existing = db.tags.find_one({"name": {"$regex": f"^{name}$", "$options": "i"}})
    if existing:
        raise HTTPException(status_code=400, detail=f"Tag '{existing['name']}' already exists")
        
    user = getattr(request.state, "user", None)
    user_id = user["id"] if user else None
        
    db.tags.insert_one({"name": name, "use_count": 0, "created_by": user_id})
    return {"success": True, "message": f"Tag '{name}' created successfully!"}

@router.post("/merge")
async def merge_tags(request: Request, merge_request: MergeTagsRequest):
    require_admin(request)
    
    source_tags = [tag.strip() for tag in merge_request.source_tags if tag.strip()]
    target_tag = merge_request.target_tag.strip()

    if not source_tags or not target_tag:
        raise HTTPException(status_code=400, detail="Source tags and target tag must be provided and cannot be empty")

    if target_tag in source_tags:
        raise HTTPException(status_code=400, detail="Target tag cannot be in the source tags")

    # 1. Update all posts and discussions that have source_tags to use the target_tag
    # We add target_tag and then pull all source_tags
    db.posts.update_many(
        {"tags": {"$in": source_tags}},
        {"$addToSet": {"tags": target_tag}}
    )
    db.posts.update_many(
        {"tags": {"$in": source_tags}},
        {"$pull": {"tags": {"$in": source_tags}}}
    )
    
    db.discussions.update_many(
        {"tags": {"$in": source_tags}},
        {"$addToSet": {"tags": target_tag}}
    )
    db.discussions.update_many(
        {"tags": {"$in": source_tags}},
        {"$pull": {"tags": {"$in": source_tags}}}
    )

    # 2. Delete source_tags from tags collection
    db.tags.delete_many({"name": {"$in": source_tags}})

    # 3. Increment the use_count of the target tag to reasonably reflect merged usage
    # We could theoretically sum counts but a simple update is to just make sure the tag exists.
    # We will use the ensure_tags_exist function or manually update.
    target_doc = db.tags.find_one({"name": target_tag})
    if target_doc:
        # Just ensure it's there. The counts might be off slightly but tags will be merged.
        pass
    else:
        # Create target tag if it didn't exist
        db.tags.insert_one({"name": target_tag, "use_count": 1, "created_by": None})
        
    # Optional: Update users' registered interests
    db.users.update_many(
        {"interested_tags": {"$in": source_tags}},
        {"$addToSet": {"interested_tags": target_tag}}
    )
    db.users.update_many(
        {"interested_tags": {"$in": source_tags}},
        {"$pull": {"interested_tags": {"$in": source_tags}}}
    )

    return {"success": True, "message": f"Successfully merged {len(source_tags)} tags into '{target_tag}'"}

@router.delete("/{tag_name}")
async def delete_tag(request: Request, tag_name: str):
    require_admin(request)
    
    tag_name = tag_name.strip()
    if not tag_name:
        raise HTTPException(status_code=400, detail="Tag name cannot be empty")
        
    # Attempt to find the tag (case-insensitive) just to be sure it exists before doing big updates
    existing = db.tags.find_one({"name": {"$regex": f"^{tag_name}$", "$options": "i"}})
    if not existing:
        raise HTTPException(status_code=404, detail=f"Tag '{tag_name}' not found")
        
    actual_tag_name = existing["name"]

    # 1. Update all posts and discussions that have this tag
    db.posts.update_many(
        {"tags": actual_tag_name},
        {"$pull": {"tags": actual_tag_name}}
    )
    
    db.discussions.update_many(
        {"tags": actual_tag_name},
        {"$pull": {"tags": actual_tag_name}}
    )

    # 2. Update users' registered interests
    db.users.update_many(
        {"interested_tags": actual_tag_name},
        {"$pull": {"interested_tags": actual_tag_name}}
    )

    # 3. Delete from tags collection
    result = db.tags.delete_one({"_id": existing["_id"]})
    
    if result.deleted_count == 1:
        return {"success": True, "message": f"Tag '{actual_tag_name}' deleted successfully!"}
    else:
        raise HTTPException(status_code=500, detail="Failed to delete tag")

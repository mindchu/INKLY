from fastapi import APIRouter, Request, HTTPException
from middleware.admin import require_admin
from util import content as content_util

router = APIRouter(prefix="/admin", tags=["admin"])

@router.delete("/content/{content_id}")
async def admin_delete_content(content_id: str, request: Request):
    """
    Admin-only endpoint to delete any post or discussion by ID.
    """
    require_admin(request)
    
    success = content_util.admin_delete_content(content_id)
    if not success:
        raise HTTPException(status_code=404, detail="Content not found or could not be deleted")
        
    return {"success": True, "message": f"Content {content_id} deleted successfully"}

@router.delete("/content/{content_id}/comment/{comment_id}")
async def admin_delete_comment(content_id: str, comment_id: str, request: Request):
    """
    Admin-only endpoint to delete any comment by ID.
    """
    require_admin(request)
    
    success = content_util.admin_delete_comment(comment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Comment not found or could not be deleted")
        
    return {"success": True, "message": f"Comment {comment_id} deleted successfully"}

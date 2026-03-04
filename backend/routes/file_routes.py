from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from model.user import User
from routes.user_routes import get_current_user
from model.file_manager import FileManager

router = APIRouter(prefix="/api/files", tags=["Files"])

@router.post("/upload")
async def upload_single_file(
    file: UploadFile = File(...), 
    folder: str = Form("attachments"), # Defaults to 'attachments', but frontend can specify 'avatars'
    user: User = Depends(get_current_user)
):
    """
    Accepts a file upload, saves it via the FileManager, and returns the URL.
    Requires the user to be logged in to prevent random people from filling up your server storage!
    """
    # Optional: You can add validation here to check file extensions or size!
    allowed_types = ["image/jpeg", "image/png", "image/gif", "application/pdf"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPG, PNG, GIF, and PDF are allowed.")

    try:
        # We use the FileManager service we built earlier
        file_url = await FileManager.upload_file(file, subfolder=folder)
        return {
            "message": "File uploaded successfully",
            "url": file_url
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")
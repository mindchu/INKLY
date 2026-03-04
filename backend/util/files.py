import os
import uuid
from datetime import datetime
from fastapi import UploadFile, HTTPException
from util.dbconn import fs

def save_upload(file: UploadFile, uploader_name: str) -> str:
    """
    Saves an uploaded file to MongoDB GridFS.
    Returns the filename.
    """
    # 1. Validate File Extension and Size
    filename_lower = file.filename.lower()
    ext = os.path.splitext(filename_lower)[1]
    
    # Validation limits
    IMAGE_EXTS = ['.png', '.jpg', '.jpeg', '.webp']
    PDF_EXT = '.pdf'
    
    MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5MB
    MAX_PDF_SIZE = 20 * 1024 * 1024 # 20MB
    
    # Read file content to check size
    file.file.seek(0, os.SEEK_END)
    file_size = file.file.tell()
    file.file.seek(0) # Reset to beginning
    
    if ext in IMAGE_EXTS:
        if file_size > MAX_IMAGE_SIZE:
            raise HTTPException(status_code=413, detail="Image size exceeds 5MB limit")
    elif ext == PDF_EXT:
        if file_size > MAX_PDF_SIZE:
            raise HTTPException(status_code=413, detail="PDF size exceeds 20MB limit")
    else:
        DISALLOWED_EXTS = ['.exe', '.bat', '.sh', '.msi', '.com']
        if ext in DISALLOWED_EXTS:
            raise HTTPException(status_code=400, detail="Disallowed file type")
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    safe_uploader = uploader_name.replace(" ", "_").lower()
    original_filename = file.filename.replace(" ", "_")
    
    filename = f"{timestamp}_{safe_uploader}_{original_filename}"
    
    # GridFS put
    # Note: Use file.file which is a binary file-like object
    fs.put(
        file.file, 
        filename=filename, 
        metadata={
            "uploader": uploader_name,
            "content_type": file.content_type,
            "original_filename": file.filename,
            "upload_date": datetime.now().isoformat()
        }
    )
        
    return filename


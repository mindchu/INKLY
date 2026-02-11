import os
import shutil
import uuid
from fastapi import UploadFile

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads") # ../uploads relative to this file? No, backend/uploads? User said `uploads` folder. The user path shows `c:\Uni\Y2\S2\SoftDev\INKLY\uploads`. This is at the root of the workspace, not inside backend.
# Wait, user said `uploads` is `c:\Uni\Y2\S2\SoftDev\INKLY\uploads`.
# `backend` is `c:\Uni\Y2\S2\SoftDev\INKLY\backend`.
# So `uploads` is sibling to `backend`.

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))) # c:\Uni\Y2\S2\SoftDev\INKLY
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")

if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

def save_upload(file: UploadFile, content_id: str) -> str:
    """
    Saves an uploaded file to the uploads directory with a unique name.
    Format: {content_id}_{doc_id}.{ext}
    Returns the filename.
    """
    doc_id = str(uuid.uuid4())
    _, ext = os.path.splitext(file.filename)
    if not ext:
        ext = "" # or logic to infer extension
    
    filename = f"{content_id}_{doc_id}{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return filename

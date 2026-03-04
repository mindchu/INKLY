import os
import shutil
import uuid
from fastapi import UploadFile, HTTPException

# Create a base directory for all uploads at the root of your project
BASE_UPLOAD_DIR = "uploads"
os.makedirs(BASE_UPLOAD_DIR, exist_ok=True)

class FileManager:
    
    @staticmethod
    def _get_secure_filename(original_filename: str) -> str:
        """Generates a unique filename to prevent overwriting existing files."""
        extension = original_filename.split(".")[-1] if "." in original_filename else "bin"
        unique_id = str(uuid.uuid4())
        return f"{unique_id}.{extension}"

    @staticmethod
    async def upload_file(file: UploadFile, subfolder: str = "attachments") -> str:
        """
        Saves the file to disk and returns the relative URL path.
        `subfolder` helps organize files (e.g., 'avatars', 'attachments')
        """
        # Validate the file
        allowed_types = ["image/jpeg", "image/png", "image/gif", "application/pdf"]
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="Invalid file type.")

        # Setup the directory
        target_dir = os.path.join(BASE_UPLOAD_DIR, subfolder)
        os.makedirs(target_dir, exist_ok=True)

        # Generate unique name
        safe_filename = FileManager._get_secure_filename(file.filename)
        file_path = os.path.join(target_dir, safe_filename)

        # Save the file to your local disk
        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Could not save file: {str(e)}")

        #Return the URL path that you will save into MongoDB
        return f"/static/{subfolder}/{safe_filename}"

    @staticmethod
    def delete_file(file_url: str) -> bool:
        """
        Deletes a file from the disk when a post is deleted.
        Expects the URL format returned by upload_file (e.g., /static/attachments/name.png)
        """
        if not file_url:
            return False
            
        # Strip the '/static/' prefix and build the real file path
        relative_path = file_url.replace("/static/", "", 1)
        actual_path = os.path.join(BASE_UPLOAD_DIR, relative_path)

        if os.path.exists(actual_path):
            os.remove(actual_path)
            return True
        return False
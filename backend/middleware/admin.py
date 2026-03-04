from fastapi import Request, HTTPException
from middleware.auth import require_auth
from util.admin import is_user_admin

def require_admin(request: Request):
    user = require_auth(request)
    if not is_user_admin(user['google_id']):
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return user

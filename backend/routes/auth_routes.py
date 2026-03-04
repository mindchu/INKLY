# backend/routes/auth_routes.py

from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import RedirectResponse
from util.auth import oauth, config
from model.user import User
from util.dbconn import db

router = APIRouter(prefix="/auth", tags=["Authentication"])

FRONTEND_PORT = config('FRONTEND_PORT', default=5173)
FRONTEND_URL = f"http://localhost:{FRONTEND_PORT}"

@router.get("/login")
async def login(request: Request):
    if not oauth.google:
         raise HTTPException(status_code=500, detail="Google OAuth not configured")
         
    # Ensure the redirect URI matches what is configured in Google Cloud Console
    redirect_uri = request.url_for('authenticate')
    print(f"DEBUG: Generated redirect_uri: {redirect_uri}")
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/callback", name="authenticate")
async def authenticate(request: Request):
    if not oauth.google:
         raise HTTPException(status_code=500, detail="Google OAuth not configured")
    
    try:
        token = await oauth.google.authorize_access_token(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"OAuth Error: {str(e)}")

    user_info = token.get('userinfo')
    if not user_info:
         user_info = await oauth.google.userinfo(token=token)
    
    # Check if user exists
    user_data = db.users.find_one({"google_id": user_info.get('sub')})
    is_new = False
    
    if not user_data:
        # Create new user
        new_user = User.from_google_info(user_info)
        result = db.users.insert_one(new_user.to_dict())
        user_id = str(result.inserted_id)
        is_new = True
    else:
        user_id = str(user_data['_id'])

    # Save ONLY the user ID in the session cookie (keeps the cookie lightweight)
    request.session['user'] = {"_id": user_id}

    # Redirect based on your brilliant is_new flag
    if is_new:
        # Send them to the page where they pick their tags
        return RedirectResponse(url=f"{FRONTEND_URL}/onboarding") 
    else:
        # Send them to the homepage
        return RedirectResponse(url=f"{FRONTEND_URL}/")

@router.get("/logout")
async def logout(request: Request):
    request.session.pop('user', None)
    return RedirectResponse(url=f"{FRONTEND_URL}/login")
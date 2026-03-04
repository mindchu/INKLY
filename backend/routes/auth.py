from fastapi import APIRouter, Request, HTTPException
from starlette.responses import RedirectResponse
import os
from middleware import auth

router = APIRouter(tags=["auth"])

FRONTEND_PORT = os.getenv('FRONTEND_PORT', 6601)
API_HOST = os.getenv('API_HOST', 'localhost')
FRONTEND_URL = f"http://{API_HOST}:{FRONTEND_PORT}"

@router.get("/login/google")
async def login_google(request: Request):
    return await auth.login(request)

@router.get("/auth/google")
async def auth_google(request: Request):
    user_data = await auth.authenticate(request)

    # Set session
    request.session['user'] = user_data
    
    redirect_url = f'{FRONTEND_URL}/'
    if user_data.get('is_new'):
        redirect_url = f'{FRONTEND_URL}/interests'
        
    return RedirectResponse(url=redirect_url)

@router.get("/logout")
async def logout(request: Request):
    request.session.pop('user', None)
    return RedirectResponse(url=f'{FRONTEND_URL}/')
